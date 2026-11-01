import pino from 'pino';
import { env } from '../config/env.js';

// Detect whether the code is running on Vercel or in standard production
const isServerlessOrProd =
  env.NODE_ENV === 'production' ||
  process.env.VERCEL === '1' ||
  !process.stdout?.isTTY;

export const logger = pino({
  level: env.LOG_LEVEL || 'info',
  transport: !isServerlessOrProd
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // Never log these fields (security)
  redact: {
    paths: [
      'pin',
      'pin_hash',
      'password',
      'otp',
      'otp_hash',
      'token',
      'accessToken',
      'refreshToken',
      'jwt',
      'authorization',
      'req.headers.authorization',
      'TWILIO_AUTH_TOKEN',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
    ],
    censor: '[REDACTED]',
  },
});