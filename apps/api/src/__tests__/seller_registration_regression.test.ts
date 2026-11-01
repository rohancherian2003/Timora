import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import pg from 'pg';
import { createApp } from '../app.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Regression Test: Seller Registration & Database Constraint Alignment', () => {
  const app = createApp();
  let pool: pg.Pool;

  const testPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);
  const testPin = '840291';
  let sellerAccessToken: string;
  let sellerUserId: string;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    setPoolForTesting(pool);

    // Ensure district 7 exists
    await pool.query(`
      INSERT INTO kerala_districts (id, name_en, name_ml) 
      VALUES (7, 'Ernakulam', 'എറണാകുളം') 
      ON CONFLICT (id) DO NOTHING;
    `);
  });

  afterAll(async () => {
    if (pool) {
      if (sellerUserId) {
        await pool.query(`DELETE FROM users WHERE id = $1`, [sellerUserId]);
      }
      await pool.end();
    }
  });

  it('1. Successfully registers an Individual Seller without check constraint violation', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phone: testPhone,
        pin: testPin,
        pin_confirm: testPin,
        role: 'seller',
        name: 'Perumbavoor Timber Merchant',
        district_id: 7,
        language_pref: 'en',
        business_name: 'Perumbavoor Wood Depot',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('seller');
    expect(res.body.data.user.approval_status).toBe('PENDING_APPROVAL');
    expect(res.body.data.accessToken).toBeDefined();

    sellerUserId = res.body.data.user.id;
    sellerAccessToken = res.body.data.accessToken;
  });

  it('2. Confirms persisted database status in seller_profiles is lowercase "pending"', async () => {
    const dbRes = await pool.query(
      `SELECT user_id, seller_subtype, business_name, approval_status, district_id 
       FROM seller_profiles 
       WHERE user_id = $1`,
      [sellerUserId]
    );

    expect(dbRes.rows).toHaveLength(1);
    const profile = dbRes.rows[0];
    expect(profile.approval_status).toBe('pending');
    expect(profile.business_name).toBe('Perumbavoor Wood Depot');
    expect(profile.district_id).toBe(7);
  });

  it('3. Confirms login returns normalized PENDING_APPROVAL status in response contract', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        phone: testPhone,
        pin: testPin,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.approval_status).toBe('PENDING_APPROVAL');
    expect(res.body.data.user.seller_approval_status).toBe('pending');
  });

  it('4. Confirms GET /auth/me returns normalized PENDING_APPROVAL status for session restoration', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${sellerAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.approvalStatus).toBe('PENDING_APPROVAL');
    expect(res.body.data.user.role).toBe('seller');
    expect(res.body.data.user.businessName).toBe('Perumbavoor Wood Depot');
  });

  it('5. Confirms unapproved seller is blocked from approval-gated features (creating listings)', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${sellerAccessToken}`)
      .send({
        title: 'Premium Teak Logs',
        species_id: 1,
        timber_type_id: 1,
        district_id: 7,
        quantity: 100,
        unit: 'cft',
        price_per_cft: 2500,
        pricing_mode: 'fixed',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SELLER_NOT_APPROVED');
    expect(res.body.error.message).toContain('awaiting Admin approval');
  });
});
