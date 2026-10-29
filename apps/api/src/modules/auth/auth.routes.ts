import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { loginRateLimiter, otpRateLimiter } from '../../middleware/rateLimiter.js';
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
} from './auth.schema.js';

export const authRouter = Router();

authRouter.post(
  '/send-otp',
  otpRateLimiter,
  validate(sendOtpSchema),
  authController.sendOtp.bind(authController)
);

authRouter.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  authController.verifyOtp.bind(authController)
);

authRouter.post(
  '/register',
  validate(registerSchema),
  authController.register.bind(authController)
);

authRouter.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

authRouter.get(
  '/me',
  authenticate,
  authController.me.bind(authController)
);

authRouter.patch(
  '/profile',
  authenticate,
  authController.updateProfile.bind(authController)
);
