import { Router } from 'express';
import { disputesController } from './disputes.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import {
  createDisputeSchema,
  resolveDisputeSchema,
  createReviewSchema,
  createReportSchema,
} from './disputes.schema.js';

export const disputesRouter = Router();

// Public: View verified reviews & calculated ratings for an entity
disputesRouter.get(
  '/reviews/:entityId',
  disputesController.getReviewsForEntity.bind(disputesController)
);

disputesRouter.use(authenticate);

// Disputes
disputesRouter.post(
  '/disputes',
  validate(createDisputeSchema),
  disputesController.createDispute.bind(disputesController)
);

disputesRouter.patch(
  '/admin/disputes/:id',
  requireRole('admin'),
  validate(resolveDisputeSchema),
  disputesController.resolveDispute.bind(disputesController)
);

// Verified Reviews
disputesRouter.post(
  '/reviews',
  validate(createReviewSchema),
  disputesController.createReview.bind(disputesController)
);

// Moderation Reports
disputesRouter.post(
  '/reports',
  validate(createReportSchema),
  disputesController.submitReport.bind(disputesController)
);
