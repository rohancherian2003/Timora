import 'dotenv/config';
import { z } from 'zod';

/**
 * Validates all required environment variables at application startup.
 * The app will refuse to start if critical config is missing or invalid.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_SSL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),

  // Frontend / CORS
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Argon2id
  ARGON2_MEMORY: z.coerce.number().default(65536),
  ARGON2_ITERATIONS: z.coerce.number().default(3),
  ARGON2_PARALLELISM: z.coerce.number().default(4),

  // OTP
  OTP_DEMO_MODE: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  OTP_EXPIRY_SECONDS: z.coerce.number().default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(3),
  OTP_RATE_LIMIT_WINDOW: z.coerce.number().default(900),
  OTP_RATE_LIMIT_MAX: z.coerce.number().default(3),

  // Twilio (optional in dev, required in prod when demo mode is off)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_SENDER_ID: z.string().optional(),

  // Supabase Storage
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default('timber-listings'),
  IMAGE_MAX_SIZE_BYTES: z.coerce.number().default(10 * 1024 * 1024),

  // Super Admin
  SUPER_ADMIN_PHONE: z.string().optional(),

  // Logging
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),

  // Listing expiry
  LISTING_EXPIRY_DAYS: z.coerce.number().default(90),
  LISTING_EXPIRY_GRACE_DAYS: z.coerce.number().default(7),

  // Rate limits
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(10),
  LOGIN_RATE_LIMIT_WINDOW: z.coerce.number().default(900),
  API_RATE_LIMIT_MAX: z.coerce.number().default(100),
  API_RATE_LIMIT_WINDOW: z.coerce.number().default(60),
});

function validateEnv() {
  // Populate fallback test environment variables if running in test
  if (process.env['NODE_ENV'] === 'test') {
    process.env['DATABASE_URL'] = process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/timora_test';
    process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || 'test-secret-key-that-is-at-least-32-chars-long';
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(result.error.format());
    process.exit(1);
  }

  const env = result.data;

  // CRITICAL: Block production startup if demo OTP mode is enabled
  if (env.NODE_ENV === 'production' && env.OTP_DEMO_MODE) {
    console.error(
      '❌ FATAL: OTP_DEMO_MODE=true is not allowed in production. ' +
        'Set OTP_DEMO_MODE=false and configure Twilio credentials.'
    );
    process.exit(1);
  }

  // Warn if Twilio credentials are missing in production
  if (env.NODE_ENV === 'production' && !env.OTP_DEMO_MODE) {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_SENDER_ID) {
      console.error('❌ FATAL: Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SENDER_ID) are required in production.');
      process.exit(1);
    }
  }

  return env;
}

export const env = validateEnv();
export type Env = typeof env;
