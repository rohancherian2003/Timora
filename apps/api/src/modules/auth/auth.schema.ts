import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Please enter a valid 10-digit mobile number.'),
    purpose: z.enum(['register', 'login', 'forgot_pin', 'phone_change']).default('register'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Please enter a valid 10-digit mobile number.'),
    otp: z.string().length(6, 'OTP must be 6 digits.'),
    purpose: z.enum(['register', 'login', 'forgot_pin', 'phone_change']).default('register'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Please enter a valid 10-digit mobile number.'),
    pin: z.string().length(6, 'PIN must be exactly 6 digits.'),
    pin_confirm: z.string().length(6, 'PIN confirmation must be exactly 6 digits.'),
    role: z.enum(['buyer', 'seller', 'carpenter']).default('buyer'),
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    district_id: z.number().int().min(1).max(14).optional(),
    language_pref: z.enum(['en', 'ml']).default('en'),
    business_name: z.string().optional(),
    locality: z.string().optional(),
  }).refine((data) => data.pin === data.pin_confirm, {
    message: 'PIN and PIN confirmation do not match.',
    path: ['pin_confirm'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Please enter a valid 10-digit mobile number.'),
    pin: z.string().length(6, 'PIN must be 6 digits.'),
  }),
});

export const forgotPinSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Please enter a valid 10-digit mobile number.'),
    otp: z.string().length(6, 'OTP must be 6 digits.'),
    new_pin: z.string().length(6, 'New PIN must be 6 digits.'),
    new_pin_confirm: z.string().length(6, 'New PIN confirmation must match.'),
  }).refine((data) => data.new_pin === data.new_pin_confirm, {
    message: 'New PIN and PIN confirmation do not match.',
    path: ['new_pin_confirm'],
  }),
});
