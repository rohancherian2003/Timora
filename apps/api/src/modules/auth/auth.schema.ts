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
    role: z.enum(['buyer', 'seller', 'carpenter', 'transport']).default('buyer'),
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

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must not exceed 100 characters.')
      .optional(),
    district: z
      .string()
      .trim()
      .min(2, 'District must be at least 2 characters.')
      .max(100)
      .optional(),
    district_id: z
      .number()
      .int('District ID must be an integer.')
      .min(1, 'District ID must be between 1 and 14.')
      .max(14, 'District ID must be between 1 and 14.')
      .optional(),
    businessName: z
      .string()
      .trim()
      .min(2, 'Business name must be at least 2 characters.')
      .max(150)
      .optional(),
    business_name: z
      .string()
      .trim()
      .min(2, 'Business name must be at least 2 characters.')
      .max(150)
      .optional(),
    millName: z
      .string()
      .trim()
      .min(2, 'Mill name must be at least 2 characters.')
      .max(150)
      .optional(),
    mill_name: z
      .string()
      .trim()
      .min(2, 'Mill name must be at least 2 characters.')
      .max(150)
      .optional(),
    skills: z
      .union([
        z.array(z.string().trim().min(1).max(50)),
        z.string().trim().min(1).max(300),
      ])
      .optional(),
    experience: z
      .number()
      .int('Experience must be an integer.')
      .min(0, 'Experience must be at least 0 years.')
      .max(70, 'Experience cannot exceed 70 years.')
      .optional(),
    vehicleDetails: z
      .union([
        z.array(z.string().trim().min(1).max(100)),
        z.string().trim().min(1).max(200),
      ])
      .optional(),
    vehicle_details: z
      .union([
        z.array(z.string().trim().min(1).max(100)),
        z.string().trim().min(1).max(200),
      ])
      .optional(),
    tonnageCapacity: z
      .number()
      .positive('Tonnage capacity must be positive.')
      .max(100, 'Tonnage capacity cannot exceed 100 tonnes.')
      .optional(),
    tonnage_capacity: z
      .number()
      .positive('Tonnage capacity must be positive.')
      .max(100, 'Tonnage capacity cannot exceed 100 tonnes.')
      .optional(),
    locality: z
      .string()
      .trim()
      .min(2, 'Locality must be at least 2 characters.')
      .max(150)
      .optional(),

    // Tampering fields: allowed in schema so requests containing them don't fail schema parsing,
    // but strictly ignored / stripped by service and database layers
    id: z.unknown().optional(),
    role: z.unknown().optional(),
    approval_status: z.unknown().optional(),
    seller_approval_status: z.unknown().optional(),
    phone: z.unknown().optional(),
    is_active: z.unknown().optional(),
  }),
});
