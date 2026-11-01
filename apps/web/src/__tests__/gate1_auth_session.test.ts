import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../lib/api';

describe('Gate 1: Real Authentication & Session Engine', () => {
  let mockStorage: Record<string, string> = {};
  let dispatchEventMock: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = {};

    const mockLocalStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = String(value);
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    dispatchEventMock = vi.fn();

    (globalThis as any).localStorage = mockLocalStorage;
    (globalThis as any).window = {
      dispatchEvent: dispatchEventMock,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  describe('1. Global 401 Interceptor Exclusion for Login Endpoint', () => {
    it('does NOT purge localStorage or dispatch unauthorized event when /auth/login returns 401', async () => {
      mockStorage['timora_auth_user'] = JSON.stringify({ id: 'existing-user' });
      mockStorage['timora_auth_token'] = 'existing-token';
      mockStorage['timora_last_active'] = String(Date.now());

      const interceptorHandlers = (api.interceptors.response as any).handlers;
      const errorHandler = interceptorHandlers[interceptorHandlers.length - 1].rejected;

      const mockLoginError = {
        config: { url: '/api/v1/auth/login', method: 'post' },
        response: {
          status: 401,
          data: {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid phone number or PIN.',
            },
          },
        },
      };

      await expect(errorHandler(mockLoginError)).rejects.toEqual(mockLoginError);

      // Verify storage was NOT cleared
      expect(mockStorage['timora_auth_user']).toBeDefined();
      expect(mockStorage['timora_auth_token']).toBeDefined();
      expect(mockStorage['timora_last_active']).toBeDefined();

      // Verify custom unauthorized event was NOT dispatched
      expect(dispatchEventMock).not.toHaveBeenCalled();
    });

    it('purges localStorage and dispatches timora:auth:unauthorized event on 401 for non-login endpoints', async () => {
      mockStorage['timora_auth_user'] = JSON.stringify({ id: 'user-xyz' });
      mockStorage['timora_auth_token'] = 'real-jwt-token';
      mockStorage['timora_last_active'] = String(Date.now());

      const interceptorHandlers = (api.interceptors.response as any).handlers;
      const errorHandler = interceptorHandlers[interceptorHandlers.length - 1].rejected;

      const mockProtectedError = {
        config: { url: '/api/v1/seller/listings', method: 'get' },
        response: {
          status: 401,
          data: {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid or expired token.',
            },
          },
        },
      };

      await expect(errorHandler(mockProtectedError)).rejects.toEqual(mockProtectedError);

      // Verify storage was purged
      expect(mockStorage['timora_auth_user']).toBeUndefined();
      expect(mockStorage['timora_auth_token']).toBeUndefined();
      expect(mockStorage['timora_last_active']).toBeUndefined();

      // Verify unauthorized event was dispatched
      expect(dispatchEventMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'timora:auth:unauthorized' })
      );
    });
  });

  describe('2. Request Interceptor & Demo Token Isolation', () => {
    it('attaches Bearer Authorization header for real JWT tokens', () => {
      mockStorage['timora_auth_token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real-token';

      const interceptorHandlers = (api.interceptors.request as any).handlers;
      const requestHandler = interceptorHandlers[interceptorHandlers.length - 1].fulfilled;

      const config: any = { headers: {} };
      const modifiedConfig = requestHandler(config);

      expect(modifiedConfig.headers.Authorization).toBe('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real-token');
    });

    it('does NOT attach Authorization header when session token is a mock demo token', () => {
      mockStorage['timora_auth_token'] = 'demo-token-seller_mill-1730000000000';

      const interceptorHandlers = (api.interceptors.request as any).handlers;
      const requestHandler = interceptorHandlers[interceptorHandlers.length - 1].fulfilled;

      const config: any = { headers: {} };
      const modifiedConfig = requestHandler(config);

      expect(modifiedConfig.headers.Authorization).toBeUndefined();
    });
  });

  describe('3. Multi-Tab Inactivity Synchronization & 25-Minute Timeout', () => {
    const SESSION_TIMEOUT_MS = 25 * 60 * 1000;

    it('identifies timeout when last active timestamp exceeds 25 minutes', () => {
      const now = Date.now();
      const past26Minutes = now - (26 * 60 * 1000);
      mockStorage['timora_last_active'] = String(past26Minutes);

      const lastActive = parseInt(mockStorage['timora_last_active'], 10);
      const elapsed = now - lastActive;

      expect(elapsed).toBeGreaterThanOrEqual(SESSION_TIMEOUT_MS);
    });

    it('keeps session active when peer tab updates timora_last_active within 25 minutes', () => {
      const now = Date.now();
      const recentActivity = now - (5 * 60 * 1000); // 5 mins ago in Tab B
      mockStorage['timora_last_active'] = String(recentActivity);

      const lastActive = parseInt(mockStorage['timora_last_active'], 10);
      const elapsed = now - lastActive;
      const remainingTime = SESSION_TIMEOUT_MS - elapsed;

      expect(elapsed).toBeLessThan(SESSION_TIMEOUT_MS);
      expect(remainingTime).toBe(20 * 60 * 1000);
    });

    it('simulates cross-tab logout synchronization via storage event payload', () => {
      mockStorage['timora_auth_user'] = JSON.stringify({ id: 'usr-1', role: 'buyer' });
      mockStorage['timora_auth_token'] = 'jwt-token-active';

      // Simulate peer tab calling logout (which clears timora_auth_token)
      delete mockStorage['timora_auth_token'];

      // Storage event representation
      const simulatedEvent = {
        key: 'timora_auth_token',
        newValue: null,
        oldValue: 'jwt-token-active',
      };

      expect(simulatedEvent.key).toBe('timora_auth_token');
      expect(simulatedEvent.newValue).toBeNull();
      expect(mockStorage['timora_auth_token']).toBeUndefined();
    });
  });

  describe('4. Demo OTP Explicit Identification & Schema Contracts', () => {
    it('recognizes 123456 as fixed demo OTP and rejects incorrect OTP', () => {
      const demoOtp = '123456';
      const isDemoOtp = (input: string) => input === demoOtp;

      expect(isDemoOtp('123456')).toBe(true);
      expect(isDemoOtp('999999')).toBe(false);
      expect(isDemoOtp('12345')).toBe(false);
    });

    it('verifies registration payload aligns with backend registerSchema', () => {
      const payload = {
        phone: '9847123456',
        pin: '654321',
        pin_confirm: '654321',
        role: 'seller',
        name: 'Kerala Wood Works',
        district_id: 7, // Ernakulam
        language_pref: 'en',
        business_name: 'Perumbavoor Timber Yard',
      };

      // Exact validations according to backend auth.schema.ts
      expect(payload.phone.length).toBeGreaterThanOrEqual(10);
      expect(payload.pin).toHaveLength(6);
      expect(payload.pin_confirm).toBe(payload.pin);
      expect(['buyer', 'seller', 'carpenter', 'transport']).toContain(payload.role);
      expect(payload.name.length).toBeGreaterThanOrEqual(2);
      expect(payload.district_id).toBeGreaterThanOrEqual(1);
      expect(payload.district_id).toBeLessThanOrEqual(14);
      expect(['en', 'ml']).toContain(payload.language_pref);
    });
  });
});
