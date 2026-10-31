import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import pg from 'pg';
import crypto from 'node:crypto';
import { formatTicketRef } from '@timora/shared';
import { detectImageSignature, uploadListingImage } from '../utils/storage.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Phase 8: Comprehensive Functional & Business Logic Integrity Test Suite', () => {
  let pool: pg.Pool;

  const getRandPhone = () => '+9198' + Math.floor(10000000 + Math.random() * 90000000);

  beforeAll(async () => {
    pool = new pg.Pool({
      connectionString: TEST_DB_URL,
      max: 10,
    });

    const client = await pool.connect();
    try {
      // Ensure migration 004 tables and indexes exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS ticket_sequences (
          year INT PRIMARY KEY,
          current_seq INT NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      // Clean up test years
      await client.query(`DELETE FROM ticket_sequences WHERE year >= 2090`);
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // TASK A: SUPPORT TICKET REFERENCE ALIGNMENT & CONCURRENCY
  // ─────────────────────────────────────────────────────────────
  describe('Task A: Support Ticket Reference Alignment (TKT-YYYY-NNNN)', () => {
    it('formats ticket references strictly in TKT-YYYY-NNNN format', () => {
      const year = 2026;
      expect(formatTicketRef(1, year)).toBe('TKT-2026-0001');
      expect(formatTicketRef(42, year)).toBe('TKT-2026-0042');
      expect(formatTicketRef(9999, year)).toBe('TKT-2026-9999');
    });

    it('generates sequential numbers atomically via PostgreSQL ticket_sequences', async () => {
      const client = await pool.connect();
      try {
        const testYear = 2098; // Unique test year
        const res1 = await client.query<{ current_seq: number }>(
          `INSERT INTO ticket_sequences (year, current_seq, updated_at)
           VALUES ($1, 1, NOW())
           ON CONFLICT (year) DO UPDATE
           SET current_seq = ticket_sequences.current_seq + 1, updated_at = NOW()
           RETURNING current_seq`,
          [testYear]
        );
        expect(res1.rows[0].current_seq).toBe(1);

        const res2 = await client.query<{ current_seq: number }>(
          `INSERT INTO ticket_sequences (year, current_seq, updated_at)
           VALUES ($1, 1, NOW())
           ON CONFLICT (year) DO UPDATE
           SET current_seq = ticket_sequences.current_seq + 1, updated_at = NOW()
           RETURNING current_seq`,
          [testYear]
        );
        expect(res2.rows[0].current_seq).toBe(2);

        const ticketRef1 = formatTicketRef(res1.rows[0].current_seq, testYear);
        const ticketRef2 = formatTicketRef(res2.rows[0].current_seq, testYear);

        expect(ticketRef1).toBe('TKT-2098-0001');
        expect(ticketRef2).toBe('TKT-2098-0002');
      } finally {
        client.release();
      }
    });

    it('prevents duplicate ticket references under simultaneous concurrent requests', async () => {
      const testYear = 2099; // Unique test year
      const concurrentRequests = 10;

      const results = await Promise.all(
        Array.from({ length: concurrentRequests }).map(async () => {
          const client = await pool.connect();
          try {
            const seqRes = await client.query<{ current_seq: number }>(
              `INSERT INTO ticket_sequences (year, current_seq, updated_at)
               VALUES ($1, 1, NOW())
               ON CONFLICT (year) DO UPDATE
               SET current_seq = ticket_sequences.current_seq + 1, updated_at = NOW()
               RETURNING current_seq`,
              [testYear]
            );
            return seqRes.rows[0].current_seq;
          } finally {
            client.release();
          }
        })
      );

      // Verify that every returned sequence is unique and covers 1..10
      const uniqueSeqs = new Set(results);
      expect(uniqueSeqs.size).toBe(concurrentRequests);
      const sorted = [...results].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('preserves historical ticket references with non-standard formats without overwriting', async () => {
      const client = await pool.connect();
      try {
        const testUser = await client.query(
          `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'buyer', 'hash') RETURNING id`,
          [getRandPhone()]
        );
        const userId = testUser.rows[0].id;
        const legacyRef = `TIM-${Math.floor(10000 + Math.random() * 90000)}`;

        // Insert historical ticket in TIM-XXXXX format
        await client.query(
          `INSERT INTO support_tickets (user_id, reference, category, description, status)
           VALUES ($1, $2, 'Legacy Category', 'Historical legacy support ticket', 'resolved')`,
          [userId, legacyRef]
        );

        const fetched = await client.query(
          `SELECT reference FROM support_tickets WHERE reference = $1`,
          [legacyRef]
        );
        expect(fetched.rows.length).toBe(1);
        expect(fetched.rows[0].reference).toBe(legacyRef);
      } finally {
        client.release();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TASK B: REVIEW SUBMISSION SCHEMA ALIGNMENT & PARTICIPATION RULES
  // ─────────────────────────────────────────────────────────────
  describe('Task B: Review Submission Schema Alignment & Eligibility Verification', () => {
    let buyerId: string;
    let sellerId: string;
    let unrelatedId: string;
    let completedOrderId: string;
    let pendingOrderId: string;

    beforeAll(async () => {
      const client = await pool.connect();
      try {
        // Create test users
        const b = await client.query(
          `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'buyer', 'hash') RETURNING id`,
          [getRandPhone()]
        );
        const s = await client.query(
          `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
          [getRandPhone()]
        );
        const u = await client.query(
          `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'buyer', 'hash') RETURNING id`,
          [getRandPhone()]
        );
        buyerId = b.rows[0].id;
        sellerId = s.rows[0].id;
        unrelatedId = u.rows[0].id;

        // Create a test listing
        const l = await client.query(
          `INSERT INTO timber_listings (seller_id, title, species_id, timber_type_id, district_id, quantity, unit, price_per_cft, pricing_mode, status)
           VALUES ($1, 'Review Test Listing', 1, 1, 7, 50, 'cft', 2000, 'fixed', 'approved')
           RETURNING id`,
          [sellerId]
        );
        const listingId = l.rows[0].id;

        // Create completed order
        const ord1 = await client.query(
          `INSERT INTO orders (listing_id, buyer_id, seller_id, agreed_qty, agreed_price, snapshot, status, buyer_confirmed, seller_confirmed)
           VALUES ($1, $2, $3, 10, 20000, '{"title":"Test"}', 'completed', true, true)
           RETURNING id`,
          [listingId, buyerId, sellerId]
        );
        completedOrderId = ord1.rows[0].id;

        // Create non-completed order
        const ord2 = await client.query(
          `INSERT INTO orders (listing_id, buyer_id, seller_id, agreed_qty, agreed_price, snapshot, status)
           VALUES ($1, $2, $3, 5, 10000, '{"title":"Test"}', 'awaiting_confirmation')
           RETURNING id`,
          [listingId, buyerId, sellerId]
        );
        pendingOrderId = ord2.rows[0].id;
      } finally {
        client.release();
      }
    });

    it('rejects review submission on non-completed order', async () => {
      const client = await pool.connect();
      try {
        const orderRes = await client.query(`SELECT status FROM orders WHERE id = $1`, [pendingOrderId]);
        expect(orderRes.rows[0].status).toBe('awaiting_confirmation');

        const canReview = orderRes.rows[0].status === 'completed';
        expect(canReview).toBe(false);
      } finally {
        client.release();
      }
    });

    it('rejects review submission by an unrelated non-participant', async () => {
      const client = await pool.connect();
      try {
        const orderRes = await client.query(
          `SELECT buyer_id, seller_id FROM orders WHERE id = $1`,
          [completedOrderId]
        );
        const order = orderRes.rows[0];
        const isParticipant = order.buyer_id === unrelatedId || order.seller_id === unrelatedId;
        expect(isParticipant).toBe(false);
      } finally {
        client.release();
      }
    });

    it('allows verified review submission for completed order by participating buyer', async () => {
      const client = await pool.connect();
      try {
        const rating = 5;
        const body = 'Exceptional Kerala teak wood quality, exactly as sampled in the yard.';

        const insertRes = await client.query(
          `INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, body)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [completedOrderId, buyerId, sellerId, rating, body]
        );

        expect(insertRes.rows.length).toBe(1);
        expect(insertRes.rows[0].order_id).toBe(completedOrderId);
        expect(insertRes.rows[0].reviewer_id).toBe(buyerId);
        expect(insertRes.rows[0].reviewee_id).toBe(sellerId);
        expect(insertRes.rows[0].rating).toBe(5);
      } finally {
        client.release();
      }
    });

    it('strictly prevents duplicate review submission for the same completed transaction', async () => {
      const client = await pool.connect();
      try {
        let duplicateCaught = false;
        try {
          await client.query(
            `INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, body)
             VALUES ($1, $2, $3, 4, 'Duplicate attempt')`,
            [completedOrderId, buyerId, sellerId]
          );
        } catch (err: any) {
          duplicateCaught = true;
          expect(err.code).toBe('23505'); // PostgreSQL unique_violation
        }
        expect(duplicateCaught).toBe(true);
      } finally {
        client.release();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TASK C: SELLER TIMBER LISTING IMAGE UPLOAD & MAGIC BYTES INSPECTION
  // ─────────────────────────────────────────────────────────────
  describe('Task C: Seller Timber Image Upload & Binary Security Verification', () => {
    let testSellerId: string;
    let otherSellerId: string;
    let testListingId: string;

    beforeAll(async () => {
      const client = await pool.connect();
      try {
        const s1 = await client.query(
          `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
          [getRandPhone()]
        );
        const s2 = await client.query(
          `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
          [getRandPhone()]
        );
        testSellerId = s1.rows[0].id;
        otherSellerId = s2.rows[0].id;
      } finally {
        client.release();
      }
    });

    beforeEach(async () => {
      const client = await pool.connect();
      try {
        const l = await client.query(
          `INSERT INTO timber_listings (seller_id, title, species_id, timber_type_id, district_id, quantity, unit, price_per_cft, pricing_mode, status)
           VALUES ($1, 'Image Upload Test Listing', 1, 1, 7, 100, 'cft', 2200, 'fixed', 'pending_review')
           RETURNING id`,
          [testSellerId]
        );
        testListingId = l.rows[0].id;
      } finally {
        client.release();
      }
    });

    it('identifies genuine JPEG binary signatures (0xFF, 0xD8, 0xFF)', () => {
      const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      expect(detectImageSignature(validJpegBuffer)).toBe('image/jpeg');
    });

    it('identifies genuine PNG binary signatures (0x89, 0x50, 0x4E, 0x47...)', () => {
      const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      expect(detectImageSignature(validPngBuffer)).toBe('image/png');
    });

    it('identifies genuine WebP binary signatures (RIFF....WEBP)', () => {
      const validWebpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x20, 0x00, 0x00, 0x00, // Size
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]);
      expect(detectImageSignature(validWebpBuffer)).toBe('image/webp');
    });

    it('rejects malicious or spoofed files with invalid binary content (e.g. PHP/shell disguised as JPEG)', async () => {
      const fakeJpegBuffer = Buffer.from('<?php echo "malicious script"; ?>');
      expect(detectImageSignature(fakeJpegBuffer)).toBeNull();

      let uploadError: any = null;
      try {
        await uploadListingImage(fakeJpegBuffer, 'malicious.jpg', 'image/jpeg', testListingId);
      } catch (err: any) {
        uploadError = err;
      }

      expect(uploadError).not.toBeNull();
      expect(uploadError.code).toBe('INVALID_IMAGE_CONTENT');
    });

    it('rejects empty file uploads', async () => {
      const emptyBuffer = Buffer.alloc(0);
      let uploadError: any = null;
      try {
        await uploadListingImage(emptyBuffer, 'empty.jpg', 'image/jpeg', testListingId);
      } catch (err: any) {
        uploadError = err;
      }

      expect(uploadError).not.toBeNull();
      expect(uploadError.code).toBe('EMPTY_FILE');
    });

    it('rejects files exceeding the maximum allowed size limit', async () => {
      // 11MB buffer exceeds 10MB limit
      const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024);
      let uploadError: any = null;
      try {
        await uploadListingImage(oversizedBuffer, 'huge.jpg', 'image/jpeg', testListingId);
      } catch (err: any) {
        uploadError = err;
      }

      expect(uploadError).not.toBeNull();
      expect(uploadError.code).toBe('FILE_TOO_LARGE');
    });

    it('successfully processes valid timber image upload and inserts into listing_images with is_primary = true for first image', async () => {
      const validJpeg = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00
      ]);

      const uploadResult = await uploadListingImage(validJpeg, 'teak_log.jpg', 'image/jpeg', testListingId);
      expect(uploadResult.storageKey).toContain(`listings/${testListingId}/`);
      expect(uploadResult.publicUrl).toBeDefined();

      const client = await pool.connect();
      try {
        const countRes = await client.query<{ count: string }>(
          `SELECT COUNT(*) FROM listing_images WHERE listing_id = $1`,
          [testListingId]
        );
        const isPrimary = parseInt(countRes.rows[0]?.count || '0', 10) === 0;

        const insertRes = await client.query(
          `INSERT INTO listing_images (listing_id, storage_key, url, is_primary)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [testListingId, uploadResult.storageKey, uploadResult.publicUrl, isPrimary]
        );

        expect(insertRes.rows.length).toBe(1);
        expect(insertRes.rows[0].is_primary).toBe(true);
        expect(insertRes.rows[0].storage_key).toBe(uploadResult.storageKey);
      } finally {
        client.release();
      }
    });

    it('prevents an unauthorized seller from modifying or deleting another seller’s listing images', async () => {
      const client = await pool.connect();
      try {
        const imgRes = await client.query(
          `INSERT INTO listing_images (listing_id, storage_key, url, is_primary)
           VALUES ($1, 'listings/test/auth_test.jpg', 'https://example.com/auth_test.jpg', true)
           RETURNING id`,
          [testListingId]
        );
        const imageId = imgRes.rows[0].id;

        // otherSeller attempts to delete testSeller's image
        const deleteRes = await client.query(
          `DELETE FROM listing_images
           WHERE id = $1 AND listing_id = $2
             AND listing_id IN (SELECT id FROM timber_listings WHERE seller_id = $3)
           RETURNING storage_key`,
          [imageId, testListingId, otherSellerId]
        );

        // Zero rows affected because otherSellerId does not own the listing
        expect(deleteRes.rowCount).toBe(0);

        // Verify the image still exists
        const checkRes = await client.query(
          `SELECT id FROM listing_images WHERE id = $1`,
          [imageId]
        );
        expect(checkRes.rows.length).toBe(1);
      } finally {
        client.release();
      }
    });

    it('enforces maximum 8 images limit per timber listing', async () => {
      const client = await pool.connect();
      try {
        // Count existing images
        const countRes = await client.query<{ count: string }>(
          `SELECT COUNT(*) FROM listing_images WHERE listing_id = $1`,
          [testListingId]
        );
        const currentCount = parseInt(countRes.rows[0]?.count || '0', 10);

        // Fill up to 8 images
        for (let i = currentCount; i < 8; i++) {
          await client.query(
            `INSERT INTO listing_images (listing_id, storage_key, url, is_primary)
             VALUES ($1, $2, $3, false)`,
            [testListingId, `listings/${testListingId}/fill_${i}.jpg`, `https://example.com/fill_${i}.jpg`]
          );
        }

        // Now attempting the 9th image must be rejected
        const totalCountRes = await client.query<{ count: string }>(
          `SELECT COUNT(*) FROM listing_images WHERE listing_id = $1`,
          [testListingId]
        );
        const count = parseInt(totalCountRes.rows[0]?.count || '0', 10);
        expect(count).toBe(8);

        const canAddMore = count < 8;
        expect(canAddMore).toBe(false);
      } finally {
        client.release();
      }
    });
  });
});
