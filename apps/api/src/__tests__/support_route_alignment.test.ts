import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { createApp } from '../app.js';
import { env } from '../config/env.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Phase 9 | Correction 1: Support & Notification Route Alignment', () => {
  let pool: pg.Pool;
  let testUserId: string;
  let testUserToken: string;
  const app = createApp();

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    setPoolForTesting(pool);

    const client = await pool.connect();
    try {
      const u = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'buyer', 'hash') RETURNING id`,
        ['+9198' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      testUserId = u.rows[0].id;
      testUserToken = jwt.sign(
        { id: testUserId, phone: '+919847123456', role: 'buyer' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
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

  // 1. Authentication enforcement on both paths
  describe('Authentication Enforcement', () => {
    it('rejects unauthenticated requests on both /api/v1/tickets and /api/v1/support/tickets', async () => {
      const res1 = await request(app).get('/api/v1/tickets');
      expect(res1.status).toBe(401);
      expect(res1.body.error.code).toBe('UNAUTHORIZED');

      const res2 = await request(app).get('/api/v1/support/tickets');
      expect(res2.status).toBe(401);
      expect(res2.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects unauthenticated requests on both /api/v1/notifications and /api/v1/support/notifications', async () => {
      const res1 = await request(app).get('/api/v1/notifications');
      expect(res1.status).toBe(401);
      expect(res1.body.error.code).toBe('UNAUTHORIZED');

      const res2 = await request(app).get('/api/v1/support/notifications');
      expect(res2.status).toBe(401);
      expect(res2.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // 2. Dual-path availability for Tickets
  describe('Tickets Dual-Path Availability', () => {
    it('reaches ticket routes via existing /api/v1/tickets path', async () => {
      const res = await request(app)
        .get('/api/v1/tickets')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('reaches ticket routes via frontend /api/v1/support/tickets path', async () => {
      const res = await request(app)
        .get('/api/v1/support/tickets')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('creates support tickets via frontend /api/v1/support/tickets with validation', async () => {
      // Short description validation
      const invalidRes = await request(app)
        .post('/api/v1/support/tickets')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ category: 'general', description: 'hi' });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error.code).toBe('INVALID_INPUT');

      // Valid ticket creation
      const validRes = await request(app)
        .post('/api/v1/support/tickets')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ category: 'general', description: 'Assistance needed with timber order inspection.' });

      expect(validRes.status).toBe(201);
      expect(validRes.body.success).toBe(true);
      expect(validRes.body.data.reference).toMatch(/^TKT-\d{4}-\d{4}$/);
    });
  });

  // 3. Dual-path availability for Notifications & Read status
  describe('Notifications Dual-Path Availability', () => {
    it('fetches notifications via existing /api/v1/notifications', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('fetches notifications via frontend /api/v1/support/notifications', async () => {
      const res = await request(app)
        .get('/api/v1/support/notifications')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('marks notification as read via both /api/v1/notifications/:id/read and /api/v1/support/notifications/:id/read', async () => {
      const dummyId = '22222222-2222-2222-2222-222222222222';

      const res1 = await request(app)
        .patch(`/api/v1/notifications/${dummyId}/read`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);

      const res2 = await request(app)
        .patch(`/api/v1/support/notifications/${dummyId}/read`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res2.status).toBe(200);
      expect(res2.body.success).toBe(true);
    });
  });
});
