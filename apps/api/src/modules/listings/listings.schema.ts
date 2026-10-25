import { z } from 'zod';

export const createListingSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters.'),
    species_id: z.number().int().min(1).max(8),
    timber_type_id: z.number().int().min(1).max(4),
    district_id: z.number().int().min(1).max(14),
    locality: z.string().optional(),
    quantity: z.number().positive('Quantity must be greater than zero.'),
    unit: z.enum(['cft', 'pieces', 'kg', 'tonnes']).default('cft'),
    price_per_cft: z.number().positive('Price per CFT must be positive.'),
    pricing_mode: z.enum(['fixed', 'negotiable']).default('fixed'),
    length_ft: z.number().positive().optional(),
    width_in: z.number().positive().optional(),
    thickness_in: z.number().positive().optional(),
    diameter_in: z.number().positive().optional(),
    pieces: z.number().int().positive().optional(),
    is_dried: z.boolean().optional(),
    moisture_pct: z.number().min(0).max(100).optional(),
    has_cracks: z.boolean().optional(),
    condition_notes: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const updateStockSchema = z.object({
  body: z.object({
    quantity: z.number().min(0, 'Quantity cannot be negative.'),
    price_per_cft: z.number().positive().optional(),
  }),
});

export const listQuerySchema = z.object({
  query: z.object({
    species_id: z.coerce.number().optional(),
    timber_type_id: z.coerce.number().optional(),
    district_id: z.coerce.number().optional(),
    min_price: z.coerce.number().optional(),
    max_price: z.coerce.number().optional(),
    search: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  }),
});
