import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import pg from 'pg';
import { createApp } from '../app.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Gate 2 Sub-Stage 2.1: Profile Validation & Schema Lockdown', () => {
  const app = createApp();
  let pool: pg.Pool;

  // Test identities
  let buyerToken: string;
  let buyerUserId: string;
  const buyerPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);

  let sellerToken: string;
  let sellerUserId: string;
  const sellerPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);

  let millToken: string;
  let millUserId: string;
  const millPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);

  let otherToken: string;
  let otherUserId: string;
  const otherPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);

  const testPin = '840291';

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    setPoolForTesting(pool);

    // 1. Ensure required Kerala districts exist
    await pool.query(`
      INSERT INTO kerala_districts (id, name_en, name_ml) 
      VALUES 
        (5, 'Kottayam', 'കോട്ടയം'),
        (7, 'Ernakulam', 'എറണാകുളം')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Register Buyer
    const buyerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phone: buyerPhone,
        pin: testPin,
        pin_confirm: testPin,
        role: 'buyer',
        name: 'Original Buyer Name',
        district_id: 5,
      });
    buyerUserId = buyerRes.body.data.user.id;
    buyerToken = buyerRes.body.data.accessToken;

    // 3. Register Individual Seller
    const sellerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phone: sellerPhone,
        pin: testPin,
        pin_confirm: testPin,
        role: 'seller',
        name: 'Original Seller Name',
        district_id: 7,
        business_name: 'Initial Wood Store',
      });
    sellerUserId = sellerRes.body.data.user.id;
    sellerToken = sellerRes.body.data.accessToken;

    // 4. Register Mill Owner
    const millRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phone: millPhone,
        pin: testPin,
        pin_confirm: testPin,
        role: 'seller',
        name: 'Original Mill Owner',
        district_id: 7,
        business_name: 'Initial Mill Depot',
      });
    millUserId = millRes.body.data.user.id;
    millToken = millRes.body.data.accessToken;

    // Set mill owner subtype and insert a timber_mill record
    await pool.query(
      `UPDATE seller_profiles SET seller_subtype = 'mill_owner' WHERE user_id = $1`,
      [millUserId]
    );
    await pool.query(
      `INSERT INTO timber_mills (owner_id, mill_name, district_id, locality, approval_status)
       VALUES ($1, 'Initial Sawmill', 7, 'Perumbavoor', 'pending')
       ON CONFLICT DO NOTHING`,
      [millUserId]
    );

    // 5. Register Another User (for cross-user tampering test)
    const otherRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phone: otherPhone,
        pin: testPin,
        pin_confirm: testPin,
        role: 'buyer',
        name: 'Inviolable Other User',
        district_id: 5,
      });
    otherUserId = otherRes.body.data.user.id;
    otherToken = otherRes.body.data.accessToken;
  });

  afterAll(async () => {
    if (pool) {
      const ids = [buyerUserId, sellerUserId, millUserId, otherUserId].filter(Boolean);
      for (const id of ids) {
        await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
      }
      await pool.end();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Valid Buyer Profile Update
  // ─────────────────────────────────────────────────────────────
  it('1. Updates Buyer profile validly and persists name and district in database', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Updated Buyer Suresh',
        district: 'Ernakulam (എറണാകുളം)',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify database record
    const dbRes = await pool.query(`SELECT name, district_id FROM user_profiles WHERE user_id = $1`, [buyerUserId]);
    expect(dbRes.rows[0].name).toBe('Updated Buyer Suresh');
    expect(dbRes.rows[0].district_id).toBe(7); // Ernakulam
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Valid Individual Seller Profile Update
  // ─────────────────────────────────────────────────────────────
  it('2. Updates Individual Seller profile validly (name, business_name, district, locality)', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        name: 'Madhavan K. R.',
        businessName: 'Madhavan Farmstead Hardwoods',
        district: 'Kottayam (കോട്ടയം)',
        locality: 'Pala Road Depot',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify user_profiles
    const uRes = await pool.query(`SELECT name, district_id FROM user_profiles WHERE user_id = $1`, [sellerUserId]);
    expect(uRes.rows[0].name).toBe('Madhavan K. R.');
    expect(uRes.rows[0].district_id).toBe(5); // Kottayam

    // Verify seller_profiles
    const sRes = await pool.query(
      `SELECT business_name, district_id, locality FROM seller_profiles WHERE user_id = $1`,
      [sellerUserId]
    );
    expect(sRes.rows[0].business_name).toBe('Madhavan Farmstead Hardwoods');
    expect(sRes.rows[0].district_id).toBe(5);
    expect(sRes.rows[0].locality).toBe('Pala Road Depot');
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Valid Timber Mill Owner Profile Update
  // ─────────────────────────────────────────────────────────────
  it('3. Updates Timber Mill Owner profile validly (mill_name, business_name, timber_mills record)', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${millToken}`)
      .send({
        name: 'George Varghese Proprietor',
        millName: 'Perumbavoor Modern Sawmills & Timber Depot',
        district: 'Ernakulam',
        locality: 'Industrial Valley',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify timber_mills table
    const mRes = await pool.query(
      `SELECT mill_name, district_id, locality FROM timber_mills WHERE owner_id = $1`,
      [millUserId]
    );
    expect(mRes.rows[0].mill_name).toBe('Perumbavoor Modern Sawmills & Timber Depot');
    expect(mRes.rows[0].district_id).toBe(7);
    expect(mRes.rows[0].locality).toBe('Industrial Valley');
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Invalid Short Name returns HTTP 400
  // ─────────────────────────────────────────────────────────────
  it('4. Rejects invalid short name (<2 characters) with HTTP 400', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'a',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Invalid District is Rejected with HTTP 400
  // ─────────────────────────────────────────────────────────────
  it('5. Rejects unrecognized district with HTTP 400 INVALID_DISTRICT', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        district: 'Atlantis Kingdom',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_DISTRICT');
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Malformed Numeric Fields are Rejected with HTTP 400
  // ─────────────────────────────────────────────────────────────
  it('6. Rejects malformed negative numeric values with HTTP 400', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        experience: -5,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Attempts to Change Role are Safely Ignored
  // ─────────────────────────────────────────────────────────────
  it('7. Safely ignores unauthorized attempt to elevate role to admin', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Sneaky User',
        role: 'admin',
      });

    expect([200, 400]).toContain(res.status);

    // Verify users.role is STILL 'buyer'
    const dbRes = await pool.query(`SELECT role FROM users WHERE id = $1`, [buyerUserId]);
    expect(dbRes.rows[0].role).toBe('buyer');
  });

  // ─────────────────────────────────────────────────────────────
  // 8. Attempts to Change approval_status are Safely Ignored
  // ─────────────────────────────────────────────────────────────
  it('8. Safely ignores unauthorized attempt to self-approve seller account', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        businessName: 'Self Approved Store',
        approval_status: 'approved',
        seller_approval_status: 'approved',
      });

    expect([200, 400]).toContain(res.status);

    // Verify seller_profiles.approval_status in DB is STILL 'pending'
    const dbRes = await pool.query(
      `SELECT approval_status FROM seller_profiles WHERE user_id = $1`,
      [sellerUserId]
    );
    expect(dbRes.rows[0].approval_status).toBe('pending');
  });

  // ─────────────────────────────────────────────────────────────
  // 9. Attempts to Change phone or is_active are Safely Ignored
  // ─────────────────────────────────────────────────────────────
  it('9. Safely ignores attempts to overwrite phone or deactivate account via profile PATCH', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Protected Buyer',
        phone: '+919999999999',
        is_active: false,
      });

    expect([200, 400]).toContain(res.status);

    // Verify users.phone and users.is_active remain unchanged
    const dbRes = await pool.query(`SELECT phone, is_active FROM users WHERE id = $1`, [buyerUserId]);
    expect(dbRes.rows[0].phone).toBe(buyerPhone);
    expect(dbRes.rows[0].is_active).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────
  // 10. One User Cannot Update Another User's Profile
  // ─────────────────────────────────────────────────────────────
  it('10. Strictly prevents User A from modifying User B profile via spoofed body ID', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${buyerToken}`) // authenticated as Buyer
      .send({
        id: otherUserId, // User B ID in payload
        userId: otherUserId,
        name: 'Compromised Name Attempt',
      });

    expect(res.status).toBe(200);

    // Verify User B (otherUser) is completely UNTOUCHED
    const otherDbRes = await pool.query(`SELECT name FROM user_profiles WHERE user_id = $1`, [otherUserId]);
    expect(otherDbRes.rows[0].name).toBe('Inviolable Other User');

    // Verify Buyer (User A) is the one whose name was updated
    const buyerDbRes = await pool.query(`SELECT name FROM user_profiles WHERE user_id = $1`, [buyerUserId]);
    expect(buyerDbRes.rows[0].name).toBe('Compromised Name Attempt');
  });

  // ─────────────────────────────────────────────────────────────
  // 11. Gate 1 Authentication & Seller Approval Invariance
  // ─────────────────────────────────────────────────────────────
  it('11. Confirms Gate 1 seller registration and normalization invariance remains intact', async () => {
    const newSellerPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phone: newSellerPhone,
        pin: testPin,
        pin_confirm: testPin,
        role: 'seller',
        name: 'Invariance Verification Seller',
        district_id: 7,
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.user.approval_status).toBe('PENDING_APPROVAL');

    const newId = regRes.body.data.user.id;
    const dbCheck = await pool.query(`SELECT approval_status FROM seller_profiles WHERE user_id = $1`, [newId]);
    expect(dbCheck.rows[0].approval_status).toBe('pending');

    await pool.query(`DELETE FROM users WHERE id = $1`, [newId]);
  });
});
