import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Auth & Health Endpoints', () => {
  const app = createApp();

  it('GET /health returns server status without leaking secrets', async () => {
    const res = await request(app).get('/health');
    // May be 200 or 503 depending on whether local PostgreSQL is running
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('services');
    expect(res.body).not.toHaveProperty('DATABASE_URL');
    expect(res.body).not.toHaveProperty('JWT_SECRET');
  });

  it('GET /api/v1 returns active API metadata', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Timora API');
  });

  it('POST /api/v1/auth/send-otp validates 10-digit Indian phone numbers', async () => {
    const invalidRes = await request(app)
      .post('/api/v1/auth/send-otp')
      .send({ phone: '123' });

    expect(invalidRes.status).toBe(422);
    expect(invalidRes.body.success).toBe(false);
    expect(invalidRes.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/register rejects mismatched PINs', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phone: '9847123456',
        pin: '739201',
        pin_confirm: '739202', // mismatch
        name: 'Ajith Kumar',
        role: 'buyer',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/refresh validates required refreshToken parameter', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/refresh rejects invalid or malformed tokens with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid.jwt.token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  describe('CORS Configuration for Custom Domain', () => {
    it('allows CORS requests from https://timorah.me with credentials', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://timorah.me');

      expect(res.headers['access-control-allow-origin']).toBe('https://timorah.me');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('allows CORS requests from https://www.timorah.me with credentials', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://www.timorah.me');

      expect(res.headers['access-control-allow-origin']).toBe('https://www.timorah.me');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('handles preflight OPTIONS request for https://timorah.me', async () => {
      const res = await request(app)
        .options('/api/v1/auth/login')
        .set('Origin', 'https://timorah.me')
        .set('Access-Control-Request-Method', 'POST');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('https://timorah.me');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('does not allow CORS for unauthorized arbitrary domains', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://unauthorized-domain.com');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
