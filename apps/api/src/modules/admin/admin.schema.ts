import { z } from 'zod';

export const rejectReasonSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'A clear reason for rejection is mandatory.'),
  }),
});

export const approvalNoteSchema = z.object({
  body: z.object({
    note: z.string().optional(),
  }),
});
