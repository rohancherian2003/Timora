import { z } from 'zod';

export const createDisputeSchema = z.object({
  body: z.object({
    order_id: z.string().uuid(),
    explanation: z.string().min(15, 'Please provide a detailed explanation of the issue (min 15 characters).'),
  }),
});

export const resolveDisputeSchema = z.object({
  body: z.object({
    decision: z.string().min(5, 'Decision statement is required.'),
    admin_notes: z.string().optional(),
    status: z.enum(['resolved', 'closed']).default('resolved'),
    inventory_action: z.enum([
      'none',                      // Dispute dismissed or resolved with buyer keeping timber
      'monetary_refund_no_return', // Buyer keeps wood, financial adjustment only -> No stock restore
      'price_concession',          // Partial price concession -> No stock restore
      'full_cancellation',         // Pre-dispatch or complete cancellation -> Restore full stock
      'physical_return',           // Wood physically returned to seller's yard -> Restore returned quantity
    ]).default('none'),
    returned_quantity: z.number().positive('Returned quantity must be positive.').optional(),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    order_id: z.string().uuid('Valid order UUID is required.'),
    rating: z.number().int('Rating must be an integer.').min(1, 'Rating must be between 1 and 5.').max(5, 'Rating must be between 1 and 5.'),
    body: z.string().min(5, 'Review comment must be at least 5 characters.').optional(),
  }),
});

export const createReportSchema = z.object({
  body: z.object({
    target_type: z.enum(['user', 'listing', 'message', 'review']),
    target_id: z.string().uuid(),
    reason: z.string().min(5, 'Please provide the reason for reporting.'),
    details: z.string().optional(),
  }),
});
