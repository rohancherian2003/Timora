import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    listing_id: z.string().uuid(),
    enquiry_id: z.string().uuid().optional(),
    agreed_qty: z.number().positive('Quantity must be greater than zero.'),
    agreed_price: z.number().positive('Agreed total price must be positive.'),
  }),
});

export const cancelOrderSchema = z.object({
  body: z.object({
    reason: z.string().min(10, 'Please provide a clear reason for cancellation (min 10 characters).'),
  }),
});
