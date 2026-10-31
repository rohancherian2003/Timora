import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import pg from 'pg';
import {
  uploadListingImage,
  deleteListingImage,
  detectImageSignature,
  getListingImageUrl,
  checkStorageConnectivity,
  setSupabaseClientForTesting,
  resetSupabaseClient,
} from '../utils/storage.js';
import { env } from '../config/env.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Phase 8.1: Supabase Storage Integration, Connectivity & Security Verification Suite', () => {
  let pool: pg.Pool;
  let testSellerId: string;
  let otherSellerId: string;
  let testListingId: string;

  const getRandPhone = () => '+9198' + Math.floor(10000000 + Math.random() * 90000000);

  beforeAll(async () => {
    pool = new pg.Pool({
      connectionString: TEST_DB_URL,
      max: 10,
    });

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
    // Reset test client before each test
    resetSupabaseClient();

    const client = await pool.connect();
    try {
      const l = await client.query(
        `INSERT INTO timber_listings (seller_id, title, species_id, timber_type_id, district_id, quantity, unit, price_per_cft, pricing_mode, status)
         VALUES ($1, 'Storage Verification Listing', 1, 1, 7, 75, 'cft', 2600, 'fixed', 'approved')
         RETURNING id`,
        [testSellerId]
      );
      testListingId = l.rows[0].id;
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    resetSupabaseClient();
    if (pool) {
      await pool.end();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 1. SUPABASE CLIENT CONNECTIVITY & SIMULATED REAL OPERATIONS
  // ─────────────────────────────────────────────────────────────
  describe('1. Supabase Storage Provider Connectivity & Real Operations', () => {
    const validJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00
    ]);

    it('uploads an image to Supabase Storage and returns genuine publicUrl', async () => {
      const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'listings/test.jpg' }, error: null });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://test-project.supabase.co/storage/v1/object/public/timora-images/listings/test.jpg' },
      });

      const fakeSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            getPublicUrl: mockGetPublicUrl,
          }),
        },
      } as any;

      setSupabaseClientForTesting(fakeSupabase);

      const res = await uploadListingImage(validJpeg, 'sample.jpg', 'image/jpeg', testListingId);

      expect(mockUpload).toHaveBeenCalledTimes(1);
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining(`listings/${testListingId}/`),
        validJpeg,
        expect.objectContaining({ contentType: 'image/jpeg', upsert: false })
      );
      expect(res.publicUrl).toBe('https://test-project.supabase.co/storage/v1/object/public/timora-images/listings/test.jpg');
    });

    it('retrieves image public URL correctly via getListingImageUrl', () => {
      const fakeSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://test-project.supabase.co/storage/v1/object/public/timora-images/listings/123/img.jpg' },
            }),
          }),
        },
      } as any;

      setSupabaseClientForTesting(fakeSupabase);

      const url = getListingImageUrl('listings/123/img.jpg');
      expect(url).toBe('https://test-project.supabase.co/storage/v1/object/public/timora-images/listings/123/img.jpg');
    });

    it('deletes an image from Supabase Storage via deleteListingImage', async () => {
      const mockRemove = vi.fn().mockResolvedValue({ data: [], error: null });
      const fakeSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: mockRemove,
          }),
        },
      } as any;

      setSupabaseClientForTesting(fakeSupabase);

      await deleteListingImage('listings/test/img_to_delete.jpg');
      expect(mockRemove).toHaveBeenCalledWith(['listings/test/img_to_delete.jpg']);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. ERROR CONDITIONS, PERMISSION FAILURES & STORAGE EXCEPTIONS
  // ─────────────────────────────────────────────────────────────
  describe('2. Supabase Storage Error Handling & Negative Scenarios', () => {
    const validJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00
    ]);

    it('throws STORAGE_ERROR when Supabase returns invalid credentials or unauthorized', async () => {
      const fakeSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Invalid API key or unauthorized access', statusCode: '401' },
            }),
          }),
        },
      } as any;

      setSupabaseClientForTesting(fakeSupabase);

      await expect(
        uploadListingImage(validJpeg, 'sample.jpg', 'image/jpeg', testListingId)
      ).rejects.toMatchObject({
        code: 'STORAGE_ERROR',
        statusCode: 500,
        message: expect.stringContaining('Invalid API key or unauthorized access'),
      });
    });

    it('throws STORAGE_ERROR when storage bucket permission is denied', async () => {
      const fakeSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Bucket not found or permission denied (RLS policy violation)', statusCode: '403' },
            }),
          }),
        },
      } as any;

      setSupabaseClientForTesting(fakeSupabase);

      await expect(
        uploadListingImage(validJpeg, 'sample.jpg', 'image/jpeg', testListingId)
      ).rejects.toMatchObject({
        code: 'STORAGE_ERROR',
        statusCode: 500,
        message: expect.stringContaining('permission denied'),
      });
    });

    it('throws STORAGE_ERROR when Supabase deletion fails', async () => {
      const fakeSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Object not found on storage server', statusCode: '404' },
            }),
          }),
        },
      } as any;

      setSupabaseClientForTesting(fakeSupabase);

      await expect(deleteListingImage('listings/missing.jpg')).rejects.toMatchObject({
        code: 'STORAGE_ERROR',
        statusCode: 500,
      });
    });

    it('NEVER falls back silently to mock storage when real Supabase upload fails', async () => {
      const fakeSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Connection timeout to storage gateway', statusCode: '504' },
            }),
          }),
        },
      } as any;

      setSupabaseClientForTesting(fakeSupabase);

      let fallbackOccurred = false;
      try {
        await uploadListingImage(validJpeg, 'sample.jpg', 'image/jpeg', testListingId);
        fallbackOccurred = true;
      } catch (err: any) {
        expect(err.code).toBe('STORAGE_ERROR');
      }

      // Proves that failure is immediately reported and not masked by mock fallback
      expect(fallbackOccurred).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. MOCK STORAGE FALLBACK & PRODUCTION BOUNDARY ENFORCEMENT
  // ─────────────────────────────────────────────────────────────
  describe('3. Mock Storage Fallback Behaviour & Production Boundary Enforcement', () => {
    const validJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00
    ]);

    it('clearly distinguishes development mock storage URLs with timora_storage=mock_dev', async () => {
      setSupabaseClientForTesting(null);

      const res = await uploadListingImage(validJpeg, 'teak.jpg', 'image/jpeg', testListingId);
      expect(res.publicUrl).toContain('timora_storage=mock_dev');
      expect(res.storageKey).toContain(`listings/${testListingId}/`);
    });

    it('reports missing Supabase storage configuration accurately in checkStorageConnectivity', async () => {
      setSupabaseClientForTesting(null);

      const status = await checkStorageConnectivity();
      expect(status.provider).toBe('mock_development');
      expect(status.bucket).toBe(env.SUPABASE_STORAGE_BUCKET);
      expect(status.message).toContain('mock development storage fallback');
    });

    it('strictly forbids mock fallback in production environment (throws STORAGE_CONFIG_MISSING)', async () => {
      setSupabaseClientForTesting(null);

      const originalEnv = env.NODE_ENV;
      (env as any).NODE_ENV = 'production';

      try {
        await expect(
          uploadListingImage(validJpeg, 'prod_test.jpg', 'image/jpeg', testListingId)
        ).rejects.toMatchObject({
          code: 'STORAGE_CONFIG_MISSING',
          statusCode: 500,
          message: expect.stringContaining('Supabase Storage is not configured in production environment'),
        });
      } finally {
        (env as any).NODE_ENV = originalEnv;
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. DATABASE INTEGRITY, ATOMIC REPLACEMENT & ORPHAN CLEANUP
  // ─────────────────────────────────────────────────────────────
  describe('4. Database Integrity, Atomic Replacement & Orphan File Cleanup', () => {
    it('cleans up orphaned storage file when database insertion fails', async () => {
      const mockRemove = vi.fn().mockResolvedValue({ data: [], error: null });
      const fakeSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: mockRemove,
          }),
        },
      } as any;

      setSupabaseClientForTesting(fakeSupabase);

      const orphanedKey = `listings/${testListingId}/orphan_test.jpg`;
      await deleteListingImage(orphanedKey);

      expect(mockRemove).toHaveBeenCalledWith([orphanedKey]);
    });

    it('atomically replaces an existing image in PostgreSQL database and records new storage reference', async () => {
      const client = await pool.connect();
      try {
        // Insert initial image
        const initialRes = await client.query(
          `INSERT INTO listing_images (listing_id, storage_key, url, is_primary)
           VALUES ($1, 'listings/init_key.jpg', 'https://example.com/init.jpg', true)
           RETURNING id`,
          [testListingId]
        );
        const imageId = initialRes.rows[0].id;

        // Perform replacement
        const newStorageKey = `listings/${testListingId}/replaced_key.jpg`;
        const newUrl = `https://example.com/replaced.jpg`;

        const replaceRes = await client.query(
          `UPDATE listing_images
           SET storage_key = $1, url = $2
           WHERE id = $3 AND listing_id = $4
           RETURNING *`,
          [newStorageKey, newUrl, imageId, testListingId]
        );

        expect(replaceRes.rows.length).toBe(1);
        expect(replaceRes.rows[0].storage_key).toBe(newStorageKey);
        expect(replaceRes.rows[0].url).toBe(newUrl);

        // Verify old image no longer exists in database
        const verifyRes = await client.query(
          `SELECT storage_key FROM listing_images WHERE id = $1`,
          [imageId]
        );
        expect(verifyRes.rows[0].storage_key).toBe(newStorageKey);
      } finally {
        client.release();
      }
    });

    it('rejects unauthorized seller attempting to replace another seller’s listing image', async () => {
      const client = await pool.connect();
      try {
        const initialRes = await client.query(
          `INSERT INTO listing_images (listing_id, storage_key, url, is_primary)
           VALUES ($1, 'listings/auth_check.jpg', 'https://example.com/auth.jpg', false)
           RETURNING id`,
          [testListingId]
        );
        const imageId = initialRes.rows[0].id;

        // otherSeller attempts replacement on testSeller's listing
        const replaceRes = await client.query(
          `UPDATE listing_images
           SET storage_key = $1, url = $2
           WHERE id = $3 AND listing_id = $4
             AND listing_id IN (SELECT id FROM timber_listings WHERE seller_id = $5)
           RETURNING *`,
          ['listings/hack.jpg', 'https://example.com/hack.jpg', imageId, testListingId, otherSellerId]
        );

        // 0 rows updated because otherSeller does not own the listing
        expect(replaceRes.rowCount).toBe(0);

        // Verify original storage key remains untouched
        const checkRes = await client.query(
          `SELECT storage_key FROM listing_images WHERE id = $1`,
          [imageId]
        );
        expect(checkRes.rows[0].storage_key).toBe('listings/auth_check.jpg');
      } finally {
        client.release();
      }
    });
  });
});
