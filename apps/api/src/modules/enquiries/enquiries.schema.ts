import { z } from 'zod';

export const createEnquirySchema = z.object({
  body: z.object({
    listing_id: z.string().uuid(),
    quantity: z.number().positive('Quantity must be greater than zero.'),
    proposed_price: z.number().positive().optional(),
    message: z.string().min(5, 'Please provide an introductory message.'),
    contact_phone: z.string().optional(),
  }),
});

export const createOfferSchema = z.object({
  body: z.object({
    quantity: z.number().positive('Quantity must be positive.'),
    price: z.number().positive('Offer price must be positive.'),
    message: z.string().optional(),
    expires_in_hours: z.number().int().min(1).max(168).default(48), // default 48h
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    body: z.string().min(1, 'Message text cannot be empty.').max(2000),
  }),
});
