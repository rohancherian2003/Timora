import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { createApp } from '../app.js';
import { env } from '../config/env.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Listing Delete Workflow Suite (Seller & Admin)', () => {
  let pool: pg.Pool;
  const app = createApp();

  let adminId: string;
  let adminToken: string;
  let sellerAId: string;
  let sellerAToken: string;
  let sellerBId: string;
  let sellerBToken: string;

  let listingId1: string;
  let listingId2: string;
  let listingId3: string;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    setPoolForTesting(pool);

    const client = await pool.connect();
    try {
      // Ensure migration 005 check constraint is applied in test db
      await client.query(`
        ALTER TABLE timber_listings DROP CONSTRAINT IF EXISTS timber_listings_status_check;
        ALTER TABLE timber_listings ADD CONSTRAINT timber_listings_status_check 
          CHECK (status IN ('draft','pending_review','approved','rejected','hidden','out_of_stock','expired','deleted','sold'));
        ALTER TABLE listing_review_history DROP CONSTRAINT IF EXISTS listing_review_history_action_check;
        ALTER TABLE listing_review_history ADD CONSTRAINT listing_review_history_action_check
          CHECK (action IN ('approved','rejected','hidden','unhidden','deleted','purged'));
      `);

      // 1. Create Admin
      const adminRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'admin', 'hash') RETURNING id`,
        ['+9199' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      adminId = adminRes.rows[0].id;
      adminToken = jwt.sign(
        { id: adminId, phone: '+919900000099', role: 'admin' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 2. Create Seller A
      const sellerARes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
        ['+9199' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      sellerAId = sellerARes.rows[0].id;
      sellerAToken = jwt.sign(
        { id: sellerAId, phone: '+919900000091', role: 'seller' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      await client.query(
        `INSERT INTO seller_profiles (user_id, business_name, district_id, approval_status)
         VALUES ($1, 'Seller A Depot', 7, 'approved')`,
        [sellerAId]
      );

      // 3. Create Seller B
      const sellerBRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
        ['+9199' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      sellerBId = sellerBRes.rows[0].id;
      sellerBToken = jwt.sign(
        { id: sellerBId, phone: '+919900000092', role: 'seller' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      await client.query(
        `INSERT INTO seller_profiles (user_id, business_name, district_id, approval_status)
         VALUES ($1, 'Seller B Depot', 8, 'approved')`,
        [sellerBId]
      );

      // Query existing species, types, districts
      const speciesRes = await client.query(`SELECT id FROM timber_species LIMIT 2`);
      const typesRes = await client.query(`SELECT id FROM timber_types LIMIT 2`);
      const distRes = await client.query(`SELECT id FROM kerala_districts LIMIT 2`);

      const sp1 = speciesRes.rows[0]?.id || 1;
      const sp2 = speciesRes.rows[1]?.id || 2;
      const tp1 = typesRes.rows[0]?.id || 1;
      const tp2 = typesRes.rows[1]?.id || 2;
      const d1 = distRes.rows[0]?.id || 7;

      // 4. Create Listings for Seller A
      const list1Res = await client.query(
        `INSERT INTO timber_listings (
           seller_id, title, species_id, timber_type_id, district_id,
           quantity, unit, price_per_cft, status
         ) VALUES ($1, 'Delete Test Teak Log', $2, $3, $4, 50, 'cft', 2500, 'approved')
         RETURNING id`,
        [sellerAId, sp1, tp1, d1]
      );
      listingId1 = list1Res.rows[0].id;

      const list2Res = await client.query(
        `INSERT INTO timber_listings (
           seller_id, title, species_id, timber_type_id, district_id,
           quantity, unit, price_per_cft, status
         ) VALUES ($1, 'Delete Test Mahogany Planks', $2, $3, $4, 30, 'cft', 1800, 'pending_review')
         RETURNING id`,
        [sellerAId, sp2, tp2, d1]
      );
      listingId2 = list2Res.rows[0].id;

      const list3Res = await client.query(
        `INSERT INTO timber_listings (
           seller_id, title, species_id, timber_type_id, district_id,
           quantity, unit, price_per_cft, status
         ) VALUES ($1, 'Sold Test Anjili Joists', $2, $3, $4, 45, 'cft', 1200, 'approved')
         RETURNING id`,
        [sellerAId, sp1, tp1, d1]
      );
      listingId3 = list3Res.rows[0].id;
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    const client = await pool.connect();
    try {
      await client.query(`DELETE FROM listing_images WHERE listing_id IN ($1, $2, $3)`, [listingId1, listingId2, listingId3]);
      await client.query(`DELETE FROM listing_review_history WHERE listing_id IN ($1, $2, $3)`, [listingId1, listingId2, listingId3]);
      await client.query(`DELETE FROM timber_listings WHERE id IN ($1, $2, $3)`, [listingId1, listingId2, listingId3]);
      await client.query(`DELETE FROM seller_profiles WHERE user_id IN ($1, $2)`, [sellerAId, sellerBId]);
      await client.query(`DELETE FROM users WHERE id IN ($1, $2, $3)`, [adminId, sellerAId, sellerBId]);
    } finally {
      client.release();
      await pool.end();
    }
  });

  it('rejects unauthenticated requests to DELETE /api/v1/listings/:id with 401', async () => {
    const res = await request(app).delete(`/api/v1/listings/${listingId1}`);
    expect(res.status).toBe(401);
  });

  it('rejects unauthorized seller attempting to delete another seller listing with 403', async () => {
    const res = await request(app)
      .delete(`/api/v1/listings/${listingId1}`)
      .set('Authorization', `Bearer ${sellerBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error?.message).toMatch(/not authorized/i);
  });

  it('allows the listing owner (Seller A) to delete their listing', async () => {
    const res = await request(app)
      .delete(`/api/v1/listings/${listingId1}`)
      .set('Authorization', `Bearer ${sellerAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify status is now 'deleted' in DB
    const checkRes = await pool.query(`SELECT status FROM timber_listings WHERE id = $1`, [listingId1]);
    expect(checkRes.rows[0]?.status).toBe('deleted');
  });

  it('excludes deleted listing from public GET /api/v1/listings and returns 404 on direct lookup', async () => {
    // Direct lookup
    const directRes = await request(app).get(`/api/v1/listings/${listingId1}`);
    expect(directRes.status).toBe(404);

    // Public search
    const searchRes = await request(app).get(`/api/v1/listings?search=Delete+Test+Teak`);
    expect(searchRes.status).toBe(200);
    const items = searchRes.body.data?.items || [];
    expect(items.some((item: any) => item.id === listingId1)).toBe(false);

    // Seller's own listings list
    const myRes = await request(app)
      .get(`/api/v1/listings/seller/me`)
      .set('Authorization', `Bearer ${sellerAToken}`);
    expect(myRes.status).toBe(200);
    const myListings = myRes.body.data || [];
    expect(myListings.some((item: any) => item.id === listingId1)).toBe(false);
  });

  it('allows Super Admin to delete / purge any listing', async () => {
    const res = await request(app)
      .delete(`/api/v1/listings/${listingId2}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await pool.query(`SELECT status FROM timber_listings WHERE id = $1`, [listingId2]);
    expect(checkRes.rows[0]?.status).toBe('deleted');
  });

  describe('Mark As Sold Workflow & Marketplace Pagination', () => {
    it('rejects unauthenticated requests to PATCH /api/v1/listings/:id/sold with 401', async () => {
      const res = await request(app).patch(`/api/v1/listings/${listingId3}/sold`);
      expect(res.status).toBe(401);
    });

    it('rejects unauthorized seller attempting to mark another seller listing as sold with 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/listings/${listingId3}/sold`)
        .set('Authorization', `Bearer ${sellerBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error?.message).toMatch(/not authorized/i);
    });

    it('allows listing owner (Seller A) to mark their listing as sold', async () => {
      const res = await request(app)
        .patch(`/api/v1/listings/${listingId3}/sold`)
        .set('Authorization', `Bearer ${sellerAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.status).toBe('sold');

      const checkRes = await pool.query(`SELECT status FROM timber_listings WHERE id = $1`, [listingId3]);
      expect(checkRes.rows[0]?.status).toBe('sold');
    });

    it('keeps sold listing visible on public search with sold status and in seller private listings archive', async () => {
      // Public search includes sold item tagged as 'sold'
      const searchRes = await request(app).get(`/api/v1/listings?search=Sold+Test+Anjili`);
      expect(searchRes.status).toBe(200);
      const items = searchRes.body.data?.items || searchRes.body.data?.listings || [];
      const foundPublic = items.find((item: any) => item.id === listingId3);
      expect(foundPublic).toBeDefined();
      expect(foundPublic.status).toBe('sold');

      // Seller's own listings also retains sold items
      const myRes = await request(app)
        .get(`/api/v1/listings/seller/me`)
        .set('Authorization', `Bearer ${sellerAToken}`);
      expect(myRes.status).toBe(200);
      const myListings = myRes.body.data || [];
      const found = myListings.find((item: any) => item.id === listingId3);
      expect(found).toBeDefined();
      expect(found.status).toBe('sold');
    });

    it('returns structured pagination response with listings, totalPages, totalItems, and currentPage', async () => {
      const pageRes = await request(app).get(`/api/v1/listings?page=1&limit=8`);
      expect(pageRes.status).toBe(200);
      expect(pageRes.body.success).toBe(true);

      const data = pageRes.body.data;
      expect(Array.isArray(data.listings)).toBe(true);
      expect(typeof data.totalPages).toBe('number');
      expect(typeof data.totalItems).toBe('number');
      expect(data.currentPage).toBe(1);
      // Backward compatibility keys
      expect(Array.isArray(data.items)).toBe(true);
      expect(typeof data.total).toBe('number');
    });
  });
});
