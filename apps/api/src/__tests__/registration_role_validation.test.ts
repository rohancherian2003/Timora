import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import pg from 'pg';
import { registerSchema } from '../modules/auth/auth.schema.js';
import { authService } from '../modules/auth/auth.service.js';
import { createApp } from '../app.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Phase 9 | Correction 2: Transport Owner Registration Validation & Integration', () => {
  const app = createApp();
  let pool: pg.Pool;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    setPoolForTesting(pool);
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 1. PURE ZOD SCHEMA VALIDATION TESTS
  // ─────────────────────────────────────────────────────────────
  describe('1. Registration Schema Unit Validation', () => {
    const basePayload = {
      phone: '+919847123456',
      pin: '654321',
      pin_confirm: '654321',
      name: 'Test Transporter',
      district_id: 7,
      language_pref: 'en' as const,
    };

    it('validates buyer role successfully', () => {
      const parsed = registerSchema.parse({
        body: { ...basePayload, role: 'buyer' },
      });
      expect(parsed.body.role).toBe('buyer');
    });

    it('validates seller role successfully', () => {
      const parsed = registerSchema.parse({
        body: { ...basePayload, role: 'seller', business_name: 'Timber Yard' },
      });
      expect(parsed.body.role).toBe('seller');
    });

    it('validates carpenter role successfully', () => {
      const parsed = registerSchema.parse({
        body: { ...basePayload, role: 'carpenter', business_name: 'Woodwork Studio' },
      });
      expect(parsed.body.role).toBe('carpenter');
    });

    it('validates transport role successfully (Correction 2 Verified)', () => {
      const parsed = registerSchema.parse({
        body: { ...basePayload, role: 'transport', business_name: 'Kerala Timber Freight' },
      });
      expect(parsed.body.role).toBe('transport');
    });

    it('defaults to buyer role when role is omitted from payload', () => {
      const parsed = registerSchema.parse({
        body: { ...basePayload },
      });
      expect(parsed.body.role).toBe('buyer');
    });

    it('rejects unauthorized or arbitrary role values', () => {
      expect(() =>
        registerSchema.parse({
          body: { ...basePayload, role: 'admin' },
        })
      ).toThrow();

      expect(() =>
        registerSchema.parse({
          body: { ...basePayload, role: 'superadmin' },
        })
      ).toThrow();

      expect(() =>
        registerSchema.parse({
          body: { ...basePayload, role: 'random_guest' },
        })
      ).toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. EXPRESS HTTP REQUEST VALIDATION TESTS (SUPERTEST)
  // ─────────────────────────────────────────────────────────────
  describe('2. HTTP Request Route Validation via Express Middleware', () => {
    it('rejects invalid role with HTTP 422 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phone: '+919847123456',
          pin: '654321',
          pin_confirm: '654321',
          name: 'Hacker Attempt',
          role: 'admin',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.fields).toHaveProperty('body.role');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. FULL POSTGRESQL DATABASE INTEGRATION REGISTRATION TEST
  // ─────────────────────────────────────────────────────────────
  describe('3. Full PostgreSQL Transport Owner Registration Integration', () => {
    const getRandPhone = () => '+9196' + Math.floor(10000000 + Math.random() * 90000000);

    it('registers a real transport owner in PostgreSQL, creating user and transport_owner_profiles records', async () => {
      const phone = getRandPhone();
      const businessName = 'Perumbavoor Timber Lorry Service';

      const result = await authService.register({
        phone,
        pin: '839201',
        role: 'transport',
        name: 'Varghese Mathew',
        district_id: 7, // Ernakulam
        business_name: businessName,
        vehicle_types: ['Heavy Timber Truck', 'Taurus 10-Wheeler'],
        vehicle_count: 2,
        max_tonnage: 16.5,
      });

      expect(result).toBeDefined();
      expect(result.user.phone).toBe(phone);
      expect(result.user.role).toBe('transport');
      expect(result.user.approval_status).toBe('PENDING_APPROVAL');
      expect(result.accessToken).toBeDefined();

      // Query database directly to verify real PostgreSQL records
      const client = await pool.connect();
      try {
        // 1. Verify user record
        const userRows = await client.query(`SELECT id, phone, role FROM users WHERE id = $1`, [result.user.id]);
        expect(userRows.rows.length).toBe(1);
        expect(userRows.rows[0].role).toBe('transport');

        // 2. Verify user_profiles record
        const profileRows = await client.query(`SELECT name, district_id FROM user_profiles WHERE user_id = $1`, [result.user.id]);
        expect(profileRows.rows.length).toBe(1);
        expect(profileRows.rows[0].name).toBe('Varghese Mathew');

        // 3. Verify transport_owner_profiles record
        const transportRows = await client.query(
          `SELECT business_name, vehicle_types, vehicle_count, max_tonnage, approval_status
           FROM transport_owner_profiles
           WHERE user_id = $1`,
          [result.user.id]
        );
        expect(transportRows.rows.length).toBe(1);
        const transportProfile = transportRows.rows[0];
        expect(transportProfile.business_name).toBe(businessName);
        expect(transportProfile.approval_status).toBe('PENDING_APPROVAL');
        expect(Number(transportProfile.max_tonnage)).toBe(16.5);
      } finally {
        client.release();
      }
    });
  });
});
