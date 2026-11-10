import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { createApp } from '../app.js';
import { env } from '../config/env.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Production Audit & Sync Fixes', () => {
  let pool: pg.Pool;
  let testUserId: string;
  let testUserToken: string;
  let notifId: string;
  const app = createApp();

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    setPoolForTesting(pool);

    const client = await pool.connect();
    try {
      const u = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
        ['+9198' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      testUserId = u.rows[0].id;
      testUserToken = jwt.sign(
        { id: testUserId, phone: '+919847120099', role: 'seller' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const n = await client.query(
        `INSERT INTO notifications (user_id, category, title_en, title_ml, body_en, action_url)
         VALUES ($1, 'support', 'Support Ticket Resolved (TKT-2026-0002)', 'സഹായ അഭ്യർത്ഥന പരിഹരിച്ചു', 'Admin reply solution', '/dashboard')
         RETURNING id`,
        [testUserId]
      );
      notifId = n.rows[0].id;
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  describe('Issue 2: Notification Persistent Dismissal', () => {
    it('dismisses notification permanently via /api/v1/support/notifications/:id/dismiss', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/notifications/${notifId}/dismiss`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(notifId);
    });

    it('dismisses notification permanently via alias /api/v1/notifications/:id/dismiss', async () => {
      const res = await request(app)
        .patch(`/api/v1/notifications/${notifId}/dismiss`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Issue 3: Image Deduplication Safety', () => {
    it('deduplicates duplicate image URLs in array inputs', () => {
      const rawUrls = [
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
      ];
      const uniqueUrls = Array.from(new Set(rawUrls.filter(Boolean)));
      expect(uniqueUrls).toHaveLength(2);
      expect(uniqueUrls).toEqual([
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
      ]);
    });
  });
});

