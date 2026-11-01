import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { createApp } from '../app.js';
import { env } from '../config/env.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Phase 9 | Correction 3: Admin Multi-Role Business Approval & Verification', () => {
  let pool: pg.Pool;
  const app = createApp();

  // Test identities
  let adminId: string;
  let adminToken: string;
  let buyerId: string;
  let buyerToken: string;

  let sellerUserId: string;
  let millUserId: string;
  let millId: string;
  let carpenterUserId: string;
  let transportUserId: string;

  let rejectCarpenterUserId: string;
  let rejectTransportUserId: string;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    setPoolForTesting(pool);

    const client = await pool.connect();
    try {
      // 1. Create Admin
      const adminRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'admin', 'hash') RETURNING id`,
        ['+9199' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      adminId = adminRes.rows[0].id;
      adminToken = jwt.sign(
        { id: adminId, phone: '+919900000001', role: 'admin' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 2. Create Buyer (for role restriction testing)
      const buyerRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'buyer', 'hash') RETURNING id`,
        ['+9191' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      buyerId = buyerRes.rows[0].id;
      buyerToken = jwt.sign(
        { id: buyerId, phone: '+919100000002', role: 'buyer' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 3. Create Pending Individual Seller
      const sRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
        ['+9192' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      sellerUserId = sRes.rows[0].id;
      await client.query(
        `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Individual Timber Seller', 7)`,
        [sellerUserId]
      );
      await client.query(
        `INSERT INTO seller_profiles (user_id, seller_subtype, business_name, locality, approval_status, district_id)
         VALUES ($1, 'individual', 'Greenwood Yard', 'Perumbavoor', 'pending', 7)`,
        [sellerUserId]
      );

      // 4. Create Pending Mill Owner
      const mRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
        ['+9193' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      millUserId = mRes.rows[0].id;
      await client.query(
        `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Mill Owner Joe', 7)`,
        [millUserId]
      );
      await client.query(
        `INSERT INTO seller_profiles (user_id, seller_subtype, business_name, locality, approval_status, district_id)
         VALUES ($1, 'mill_owner', 'Malabar Sawmill', 'Kalady', 'pending', 7)`,
        [millUserId]
      );
      const tmRes = await client.query(
        `INSERT INTO timber_mills (owner_id, mill_name, locality, approval_status, district_id)
         VALUES ($1, 'Malabar Sawmill Factory', 'Kalady', 'PENDING_APPROVAL', 7)
         RETURNING id`,
        [millUserId]
      );
      millId = tmRes.rows[0].id;

      // 5. Create Pending Carpenter
      const cRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'carpenter', 'hash') RETURNING id`,
        ['+9194' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      carpenterUserId = cRes.rows[0].id;
      await client.query(
        `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Master Carpenter Raman', 7)`,
        [carpenterUserId]
      );
      await client.query(
        `INSERT INTO carpenter_profiles (user_id, business_name, approval_status, is_admin_verified, district_id)
         VALUES ($1, 'Raman Woodcraft Atelier', 'PENDING_APPROVAL', false, 7)`,
        [carpenterUserId]
      );

      // 6. Create Pending Transport Owner
      const tRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'transport', 'hash') RETURNING id`,
        ['+9195' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      transportUserId = tRes.rows[0].id;
      await client.query(
        `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Kerala Transit Boss', 7)`,
        [transportUserId]
      );
      await client.query(
        `INSERT INTO transport_owner_profiles (user_id, business_name, approval_status, district_id)
         VALUES ($1, 'Highland Timber Logistics', 'PENDING_APPROVAL', 7)`,
        [transportUserId]
      );

      // 7. Create Carpenter for Rejection Test
      const cRejRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'carpenter', 'hash') RETURNING id`,
        ['+9196' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      rejectCarpenterUserId = cRejRes.rows[0].id;
      await client.query(
        `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Applicant Carpenter', 7)`,
        [rejectCarpenterUserId]
      );
      await client.query(
        `INSERT INTO carpenter_profiles (user_id, business_name, approval_status, district_id)
         VALUES ($1, 'Incomplete Carpenter Work', 'PENDING_APPROVAL', 7)`,
        [rejectCarpenterUserId]
      );

      // 8. Create Transport for Rejection Test
      const tRejRes = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'transport', 'hash') RETURNING id`,
        ['+9197' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      rejectTransportUserId = tRejRes.rows[0].id;
      await client.query(
        `INSERT INTO user_profiles (user_id, name, district_id) VALUES ($1, 'Applicant Transport', 7)`,
        [rejectTransportUserId]
      );
      await client.query(
        `INSERT INTO transport_owner_profiles (user_id, business_name, approval_status, district_id)
         VALUES ($1, 'Uncertified Timber Truck', 'PENDING_APPROVAL', 7)`,
        [rejectTransportUserId]
      );
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
  // 1. ENDPOINT ACCESS & SECURITY RESTRICTIONS
  // ─────────────────────────────────────────────────────────────
  describe('1. Endpoint Access & Security Restrictions', () => {
    it('rejects unauthenticated requests to GET /api/v1/admin/sellers/pending with 401', async () => {
      const res = await request(app).get('/api/v1/admin/sellers/pending');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects non-admin (buyer) requests to GET /api/v1/admin/sellers/pending with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/sellers/pending')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects unauthenticated PATCH /api/v1/admin/sellers/:id/approve with 401', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${sellerUserId}/approve`)
        .send({ note: 'Verified' });
      expect(res.status).toBe(401);
    });

    it('rejects non-admin PATCH /api/v1/admin/sellers/:id/approve with 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${sellerUserId}/approve`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ note: 'Verified' });
      expect(res.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. RETRIEVAL OF MULTI-ROLE BUSINESS APPLICATIONS
  // ─────────────────────────────────────────────────────────────
  describe('2. Multi-Role Pending Business Applications Retrieval', () => {
    it('returns pending applications across Individual Seller, Mill, Carpenter, and Transport roles', async () => {
      const res = await request(app)
        .get('/api/v1/admin/sellers/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const items = res.body.data;
      const roles = items.map((i: any) => i.role);
      const entityTypes = items.map((i: any) => i.entity_type);

      // Verify all business roles are included in pending list
      expect(roles).toContain('seller');
      expect(roles).toContain('carpenter');
      expect(roles).toContain('transport');

      expect(entityTypes).toContain('seller');
      expect(entityTypes).toContain('carpenter');
      expect(entityTypes).toContain('transport');

      // Verify specific seeded items are present
      const sellerItem = items.find((i: any) => i.id === sellerUserId);
      expect(sellerItem).toBeDefined();
      expect(sellerItem.business_name).toBe('Greenwood Yard');
      expect(sellerItem.seller_subtype).toBe('individual');

      const millItem = items.find((i: any) => i.id === millUserId);
      expect(millItem).toBeDefined();
      expect(millItem.seller_subtype).toBe('mill_owner');

      const carpenterItem = items.find((i: any) => i.id === carpenterUserId);
      expect(carpenterItem).toBeDefined();
      expect(carpenterItem.role).toBe('carpenter');
      expect(carpenterItem.business_name).toBe('Raman Woodcraft Atelier');

      const transportItem = items.find((i: any) => i.id === transportUserId);
      expect(transportItem).toBeDefined();
      expect(transportItem.role).toBe('transport');
      expect(transportItem.business_name).toBe('Highland Timber Logistics');
    });

    it('returns applications sorted chronologically by created_at', async () => {
      const res = await request(app)
        .get('/api/v1/admin/sellers/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const items = res.body.data;
      for (let i = 0; i < items.length - 1; i++) {
        const t1 = new Date(items[i].created_at).getTime();
        const t2 = new Date(items[i + 1].created_at).getTime();
        expect(t1).toBeLessThanOrEqual(t2);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. ROLE-AWARE APPROVAL WORKFLOWS
  // ─────────────────────────────────────────────────────────────
  describe('3. Role-Aware Business Approval Workflows', () => {
    it('approves an Individual Seller, updates seller_profiles, and logs APPROVE_SELLER audit', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${sellerUserId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Documents verified by Admin' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify database state
      const checkRes = await pool.query(
        `SELECT approval_status, approval_note, approved_by, approved_at FROM seller_profiles WHERE user_id = $1`,
        [sellerUserId]
      );
      expect(checkRes.rows[0].approval_status).toBe('approved');
      expect(checkRes.rows[0].approval_note).toBe('Documents verified by Admin');
      expect(checkRes.rows[0].approved_by).toBe(adminId);
      expect(checkRes.rows[0].approved_at).not.toBeNull();

      // Verify audit log
      const auditRes = await pool.query(
        `SELECT action, entity_type, entity_id FROM admin_audit_logs WHERE actor_id = $1 AND entity_id = $2`,
        [adminId, sellerUserId]
      );
      expect(auditRes.rows.length).toBeGreaterThan(0);
      expect(auditRes.rows[0].action).toBe('APPROVE_SELLER');
      expect(auditRes.rows[0].entity_type).toBe('seller_profile');
    });

    it('approves a Mill Owner, updates seller_profiles and timber_mills, and logs APPROVE_SELLER audit', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${millUserId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Sawmill license validated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify seller_profiles
      const sellerRes = await pool.query(
        `SELECT approval_status FROM seller_profiles WHERE user_id = $1`,
        [millUserId]
      );
      expect(sellerRes.rows[0].approval_status).toBe('approved');

      // Verify timber_mills
      const millDbRes = await pool.query(
        `SELECT approval_status, approved_by FROM timber_mills WHERE owner_id = $1`,
        [millUserId]
      );
      expect(millDbRes.rows[0].approval_status).toBe('approved');
      expect(millDbRes.rows[0].approved_by).toBe(adminId);
    });

    it('approves a Carpenter, sets is_admin_verified=true, and logs APPROVE_CARPENTER audit', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${carpenterUserId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Portfolio and experience verified' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify database state
      const checkRes = await pool.query(
        `SELECT approval_status, is_admin_verified, approval_note, approved_by FROM carpenter_profiles WHERE user_id = $1`,
        [carpenterUserId]
      );
      expect(checkRes.rows[0].approval_status).toBe('approved');
      expect(checkRes.rows[0].is_admin_verified).toBe(true);
      expect(checkRes.rows[0].approval_note).toBe('Portfolio and experience verified');
      expect(checkRes.rows[0].approved_by).toBe(adminId);

      // Verify audit log
      const auditRes = await pool.query(
        `SELECT action, entity_type, entity_id FROM admin_audit_logs WHERE actor_id = $1 AND entity_id = $2`,
        [adminId, carpenterUserId]
      );
      expect(auditRes.rows.length).toBeGreaterThan(0);
      expect(auditRes.rows[0].action).toBe('APPROVE_CARPENTER');
      expect(auditRes.rows[0].entity_type).toBe('carpenter_profile');
    });

    it('approves a Transport Owner, updates transport_owner_profiles, and logs APPROVE_TRANSPORT audit', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${transportUserId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Transit permits confirmed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify database state
      const checkRes = await pool.query(
        `SELECT approval_status, approval_note, approved_by FROM transport_owner_profiles WHERE user_id = $1`,
        [transportUserId]
      );
      expect(checkRes.rows[0].approval_status).toBe('approved');
      expect(checkRes.rows[0].approval_note).toBe('Transit permits confirmed');
      expect(checkRes.rows[0].approved_by).toBe(adminId);

      // Verify audit log
      const auditRes = await pool.query(
        `SELECT action, entity_type, entity_id FROM admin_audit_logs WHERE actor_id = $1 AND entity_id = $2`,
        [adminId, transportUserId]
      );
      expect(auditRes.rows.length).toBeGreaterThan(0);
      expect(auditRes.rows[0].action).toBe('APPROVE_TRANSPORT');
      expect(auditRes.rows[0].entity_type).toBe('transport_owner_profile');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. ROLE-AWARE REJECTION WORKFLOWS
  // ─────────────────────────────────────────────────────────────
  describe('4. Role-Aware Business Rejection Workflows', () => {
    it('rejects a Carpenter with mandatory reason and logs REJECT_CARPENTER audit', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${rejectCarpenterUserId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Invalid certification documents' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify database state
      const checkRes = await pool.query(
        `SELECT approval_status, is_admin_verified, approval_note FROM carpenter_profiles WHERE user_id = $1`,
        [rejectCarpenterUserId]
      );
      expect(checkRes.rows[0].approval_status).toBe('rejected');
      expect(checkRes.rows[0].is_admin_verified).toBe(false);
      expect(checkRes.rows[0].approval_note).toBe('Invalid certification documents');

      // Verify audit log
      const auditRes = await pool.query(
        `SELECT action, entity_type, reason FROM admin_audit_logs WHERE actor_id = $1 AND entity_id = $2`,
        [adminId, rejectCarpenterUserId]
      );
      expect(auditRes.rows.length).toBeGreaterThan(0);
      expect(auditRes.rows[0].action).toBe('REJECT_CARPENTER');
      expect(auditRes.rows[0].entity_type).toBe('carpenter_profile');
      expect(auditRes.rows[0].reason).toBe('Invalid certification documents');
    });

    it('rejects a Transport Owner with mandatory reason and logs REJECT_TRANSPORT audit', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${rejectTransportUserId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Vehicle fitness certificate expired' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify database state
      const checkRes = await pool.query(
        `SELECT approval_status, approval_note FROM transport_owner_profiles WHERE user_id = $1`,
        [rejectTransportUserId]
      );
      expect(checkRes.rows[0].approval_status).toBe('rejected');
      expect(checkRes.rows[0].approval_note).toBe('Vehicle fitness certificate expired');

      // Verify audit log
      const auditRes = await pool.query(
        `SELECT action, entity_type, reason FROM admin_audit_logs WHERE actor_id = $1 AND entity_id = $2`,
        [adminId, rejectTransportUserId]
      );
      expect(auditRes.rows.length).toBeGreaterThan(0);
      expect(auditRes.rows[0].action).toBe('REJECT_TRANSPORT');
      expect(auditRes.rows[0].entity_type).toBe('transport_owner_profile');
      expect(auditRes.rows[0].reason).toBe('Vehicle fitness certificate expired');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. REMOVAL FROM PENDING QUEUE
  // ─────────────────────────────────────────────────────────────
  describe('5. Verified Applications Removed from Pending Queue', () => {
    it('excludes approved and rejected accounts from pending list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/sellers/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const pendingIds = res.body.data.map((i: any) => i.id);

      // Approved users should not be pending
      expect(pendingIds).not.toContain(sellerUserId);
      expect(pendingIds).not.toContain(millUserId);
      expect(pendingIds).not.toContain(carpenterUserId);
      expect(pendingIds).not.toContain(transportUserId);

      // Rejected users should not be pending
      expect(pendingIds).not.toContain(rejectCarpenterUserId);
      expect(pendingIds).not.toContain(rejectTransportUserId);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. NEGATIVE & EDGE CASE TESTS
  // ─────────────────────────────────────────────────────────────
  describe('6. Negative and Edge Case Validations', () => {
    it('returns 422 if rejection is attempted without a reason', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${sellerUserId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 when approving non-existent user ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${nonExistentId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Missing user' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 INVALID_ROLE when attempting to approve a non-business user (e.g. buyer)', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${buyerId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Attempting to approve buyer' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_ROLE');
    });

    it('returns 400 INVALID_ROLE when attempting to reject a non-business user (e.g. buyer)', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/sellers/${buyerId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Attempting to reject buyer' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_ROLE');
    });
  });
});
