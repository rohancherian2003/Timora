import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { listingsController } from '../listings/listings.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import { rejectReasonSchema, approvalNoteSchema } from './admin.schema.js';

export const adminRouter = Router();

// Protect all admin endpoints
adminRouter.use(authenticate, requireRole('admin'));

// Business Approvals (Multi-role: Seller, Mill, Carpenter, Transport)
adminRouter.get('/sellers/pending', adminController.getPendingSellers.bind(adminController));
adminRouter.get('/approvals/pending', adminController.getPendingSellers.bind(adminController));
adminRouter.patch(
  '/approvals/:userId',
  adminController.updateApprovalStatus.bind(adminController)
);
adminRouter.patch(
  '/sellers/:id/approve',
  validate(approvalNoteSchema),
  adminController.approveSeller.bind(adminController)
);
adminRouter.patch(
  '/sellers/:id/reject',
  validate(rejectReasonSchema),
  adminController.rejectSeller.bind(adminController)
);

// Listing reviews
adminRouter.get('/listings/pending', adminController.getPendingListings.bind(adminController));
adminRouter.patch('/listings/:id/approve', adminController.approveListing.bind(adminController));
adminRouter.patch(
  '/listings/:id/reject',
  validate(rejectReasonSchema),
  adminController.rejectListing.bind(adminController)
);
adminRouter.delete('/listings/:id', listingsController.deleteListing.bind(listingsController));
