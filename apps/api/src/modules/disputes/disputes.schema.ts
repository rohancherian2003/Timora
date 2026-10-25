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
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    order_id: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
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
