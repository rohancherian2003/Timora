import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import pg from 'pg';
import argon2 from 'argon2';
import { createApp } from '../app.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Gate 2 Sub-Stage 2.2: Directory Integration & Contact Privacy', () => {
  const app = createApp();
  let pool: pg.Pool;

  let buyerToken: string;
  let buyerUserId: string;
  const buyerPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);

  const testPin = '840291';
  let pinHash: string;

  // Specific IDs for test data
  let approvedMillOwnerId: string;
  let pendingMillOwnerId: string;
  let approvedMillId: string;
  let pendingMillId: string;
  const approvedMillPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);
  const pendingMillPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);

  let approvedCarpenterId: string;
  let pendingCarpenterId: string;
  const approvedCarpenterPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);
  const pendingCarpenterPhone = '+919847' + Math.floor(100000 + Math.random() * 900000);

  let testQuoteId: string | null = null;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    setPoolForTesting(pool);

    pinHash = await argon2.hash(testPin);

    // 1. Ensure required districts
    await pool.query(`
      INSERT INTO kerala_districts (id, name_en, name_ml) 
      VALUES 
        (5, 'Kottayam', 'കോട്ടയം'),
        (7, 'Ernakulam', 'എറണാകുളം'),
        (11, 'Kozhikode', 'കോഴിക്കോട്')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Register an authenticated Buyer
    const buyerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phone: buyerPhone,
        pin: testPin,
        pin_confirm: testPin,
        role: 'buyer',
        name: 'Privacy Audit Buyer',
        district_id: 5,
      });
    buyerUserId = buyerRes.body.data.user.id;
    buyerToken = buyerRes.body.data.accessToken;

    // 3. Insert an Approved Mill and a Pending Mill
    const approvedMillUser = await pool.query(
      `INSERT INTO users (phone, pin_hash, role) VALUES ($1, $2, 'seller') RETURNING id`,
      [approvedMillPhone, pinHash]
    );
    approvedMillOwnerId = approvedMillUser.rows[0].id;
    await pool.query(
      `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Approved Mill Owner', 7)`,
      [approvedMillOwnerId]
    );
    const millRes = await pool.query(
      `INSERT INTO timber_mills (owner_id, mill_name, license_no, district_id, locality, daily_cft_capacity, saw_types, approval_status)
       VALUES ($1, 'Approved Perumbavoor Sawmill', 'KL-TEST-001', 7, 'Perumbavoor', 300, ARRAY['Horizontal Bandsaw'], 'approved')
       RETURNING id`,
      [approvedMillOwnerId]
    );
    approvedMillId = millRes.rows[0].id;

    const pendingMillUser = await pool.query(
      `INSERT INTO users (phone, pin_hash, role) VALUES ($1, $2, 'seller') RETURNING id`,
      [pendingMillPhone, pinHash]
    );
    pendingMillOwnerId = pendingMillUser.rows[0].id;
    await pool.query(
      `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Pending Mill Owner', 7)`,
      [pendingMillOwnerId]
    );
    const pMillRes = await pool.query(
      `INSERT INTO timber_mills (owner_id, mill_name, license_no, district_id, locality, daily_cft_capacity, saw_types, approval_status)
       VALUES ($1, 'Pending Secret Sawmill', 'KL-TEST-002', 7, 'Kaloor', 150, ARRAY['Circular Saw'], 'pending')
       RETURNING id`,
      [pendingMillOwnerId]
    );
    pendingMillId = pMillRes.rows[0].id;

    // 4. Insert an Approved Carpenter and a Pending Carpenter
    const approvedCarpUser = await pool.query(
      `INSERT INTO users (phone, pin_hash, role) VALUES ($1, $2, 'carpenter') RETURNING id`,
      [approvedCarpenterPhone, pinHash]
    );
    approvedCarpenterId = approvedCarpUser.rows[0].id;
    await pool.query(
      `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Approved Master Carpenter', 5)`,
      [approvedCarpenterId]
    );
    await pool.query(
      `INSERT INTO carpenter_profiles (user_id, business_name, district_id, specialization, experience_yrs, rating, is_admin_verified, approval_status)
       VALUES ($1, 'Achari Traditional Joinery', 5, ARRAY['Roof Truss Framing', 'Doors'], 25, 4.9, true, 'approved')`,
      [approvedCarpenterId]
    );

    const pendingCarpUser = await pool.query(
      `INSERT INTO users (phone, pin_hash, role) VALUES ($1, $2, 'carpenter') RETURNING id`,
      [pendingCarpenterPhone, pinHash]
    );
    pendingCarpenterId = pendingCarpUser.rows[0].id;
    await pool.query(
      `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Pending Carpenter', 5)`,
      [pendingCarpenterId]
    );
    await pool.query(
      `INSERT INTO carpenter_profiles (user_id, business_name, district_id, specialization, experience_yrs, rating, is_admin_verified, approval_status)
       VALUES ($1, 'Unverified Carpentry', 5, ARRAY['General'], 3, 3.5, false, 'pending')`,
      [pendingCarpenterId]
    );

    // 5. Seed a benchmark Transport Quote
    const provRes = await pool.query(`SELECT id FROM transport_providers LIMIT 1`);
    if (provRes.rows.length > 0) {
      const qRes = await pool.query(
        `INSERT INTO transport_quotes (provider_id, from_district, to_district, rate_per_ton, notes)
         VALUES ($1, 'Kottayam', 'Ernakulam', 1250, 'Standard log haulage rate')
         RETURNING id`,
        [provRes.rows[0].id]
      );
      testQuoteId = qRes.rows[0].id;
    }
  });

  afterAll(async () => {
    // Clean up test records
    if (pool) {
      if (testQuoteId) {
        await pool.query(`DELETE FROM transport_quotes WHERE id = $1`, [testQuoteId]);
      }
      await pool.query(`DELETE FROM timber_mills WHERE id IN ($1, $2)`, [approvedMillId, pendingMillId]);
      await pool.query(`DELETE FROM carpenter_profiles WHERE user_id IN ($1, $2)`, [approvedCarpenterId, pendingCarpenterId]);
      await pool.query(`DELETE FROM user_profiles WHERE user_id IN ($1, $2, $3, $4, $5)`, [
        buyerUserId, approvedMillOwnerId, pendingMillOwnerId, approvedCarpenterId, pendingCarpenterId
      ]);
      await pool.query(`DELETE FROM users WHERE id IN ($1, $2, $3, $4, $5)`, [
        buyerUserId, approvedMillOwnerId, pendingMillOwnerId, approvedCarpenterId, pendingCarpenterId
      ]);
      await pool.end();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Timber Mills Directory & Contact Privacy
  // ─────────────────────────────────────────────────────────────
  describe('1. Timber Mills Directory Contact Privacy', () => {
    it('masks phone numbers for guest (unauthenticated) users on GET /api/v1/mills', async () => {
      const res = await request(app).get('/api/v1/mills');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const target = res.body.data.find((m: any) => m.id === approvedMillId);
      expect(target).toBeDefined();
      expect(target.name).toBe('Approved Perumbavoor Sawmill');
      // Guest should NOT see raw unmasked phone number
      expect(target.phone).not.toBe(approvedMillPhone);
      expect(target.phone).toContain('••••••');
    });

    it('returns unmasked genuine phone number for authenticated users on GET /api/v1/mills', async () => {
      const res = await request(app)
        .get('/api/v1/mills')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const target = res.body.data.find((m: any) => m.id === approvedMillId);
      expect(target).toBeDefined();
      // Authenticated user receives raw phone number
      expect(target.phone).toBe(approvedMillPhone);
    });

    it('excludes pending unapproved timber mills from public directory', async () => {
      const res = await request(app).get('/api/v1/mills');
      expect(res.status).toBe(200);

      const pendingTarget = res.body.data.find((m: any) => m.id === pendingMillId);
      expect(pendingTarget).toBeUndefined();
    });

    it('filters timber mills by district_id query parameter', async () => {
      const resKottayam = await request(app).get('/api/v1/mills?district_id=5');
      expect(resKottayam.status).toBe(200);
      const inKottayam = resKottayam.body.data.find((m: any) => m.id === approvedMillId);
      expect(inKottayam).toBeUndefined();

      const resErnakulam = await request(app).get('/api/v1/mills?district_id=7');
      expect(resErnakulam.status).toBe(200);
      const inErnakulam = resErnakulam.body.data.find((m: any) => m.id === approvedMillId);
      expect(inErnakulam).toBeDefined();
    });

    it('filters timber mills by search query', async () => {
      const res = await request(app).get('/api/v1/mills?search=Perumbavoor');
      expect(res.status).toBe(200);
      const found = res.body.data.find((m: any) => m.id === approvedMillId);
      expect(found).toBeDefined();

      const resNotFound = await request(app).get('/api/v1/mills?search=NonExistentMillXYZ');
      expect(resNotFound.status).toBe(200);
      const notFound = resNotFound.body.data.find((m: any) => m.id === approvedMillId);
      expect(notFound).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Carpenter Directory & Contact Privacy
  // ─────────────────────────────────────────────────────────────
  describe('2. Carpenter Directory Contact Privacy', () => {
    it('masks phone numbers for guest (unauthenticated) users on GET /api/v1/carpenters', async () => {
      const res = await request(app).get('/api/v1/carpenters');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const target = res.body.data.find((c: any) => c.id === approvedCarpenterId);
      expect(target).toBeDefined();
      expect(target.name).toBe('Achari Traditional Joinery');
      // Guest should NOT see raw unmasked phone number
      expect(target.phone).not.toBe(approvedCarpenterPhone);
      expect(target.phone).toContain('••••••');
    });

    it('returns unmasked genuine phone number for authenticated users on GET /api/v1/carpenters', async () => {
      const res = await request(app)
        .get('/api/v1/carpenters')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const target = res.body.data.find((c: any) => c.id === approvedCarpenterId);
      expect(target).toBeDefined();
      // Authenticated user receives raw phone number
      expect(target.phone).toBe(approvedCarpenterPhone);
    });

    it('excludes pending unapproved carpenters from public directory', async () => {
      const res = await request(app).get('/api/v1/carpenters');
      expect(res.status).toBe(200);

      const pendingTarget = res.body.data.find((c: any) => c.id === pendingCarpenterId);
      expect(pendingTarget).toBeUndefined();
    });

    it('filters carpenters by district_id query parameter', async () => {
      const resErnakulam = await request(app).get('/api/v1/carpenters?district_id=7');
      expect(resErnakulam.status).toBe(200);
      const inErnakulam = resErnakulam.body.data.find((c: any) => c.id === approvedCarpenterId);
      expect(inErnakulam).toBeUndefined();

      const resKottayam = await request(app).get('/api/v1/carpenters?district_id=5');
      expect(resKottayam.status).toBe(200);
      const inKottayam = resKottayam.body.data.find((c: any) => c.id === approvedCarpenterId);
      expect(inKottayam).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Transport Providers Directory & Contact Privacy
  // ─────────────────────────────────────────────────────────────
  describe('3. Transport Providers Directory & Contact Privacy', () => {
    it('masks contact phone numbers for guest (unauthenticated) users on GET /api/v1/transport/providers', async () => {
      const res = await request(app).get('/api/v1/transport/providers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      // Verify every provider returned to guest has masked contact
      for (const p of res.body.data) {
        expect(p.contact).toContain('••••••');
      }
    });

    it('returns unmasked contact numbers for authenticated users on GET /api/v1/transport/providers', async () => {
      const res = await request(app)
        .get('/api/v1/transport/providers')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      // Verify at least one provider has a full numeric contact
      const sample = res.body.data[0];
      expect(sample.contact).not.toContain('••••••');
      expect(sample.contact.replace(/[^0-9]/g, '').length).toBeGreaterThanOrEqual(10);
    });

    it('masks provider_contact for guests on GET /api/v1/transport/quotes', async () => {
      const res = await request(app).get(
        '/api/v1/transport/quotes?from_district=Kottayam&to_district=Ernakulam'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      for (const q of res.body.data) {
        expect(q.provider_contact).toContain('••••••');
      }
    });

    it('returns unmasked provider_contact for authenticated users on GET /api/v1/transport/quotes', async () => {
      const res = await request(app)
        .get(
          '/api/v1/transport/quotes?from_district=Kottayam&to_district=Ernakulam'
        )
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const sample = res.body.data[0];
      expect(sample.provider_contact).not.toContain('••••••');
      expect(sample.provider_contact.replace(/[^0-9]/g, '').length).toBeGreaterThanOrEqual(10);
    });
  });
});
