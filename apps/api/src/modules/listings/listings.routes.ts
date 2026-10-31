import { Router } from 'express';
import multer from 'multer';
import { listingsController } from './listings.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  createListingSchema,
  updateStockSchema,
  listQuerySchema,
} from './listings.schema.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const listingsRouter = Router();

// Public routes
listingsRouter.get(
  '/',
  validate(listQuerySchema),
  listingsController.searchListings.bind(listingsController)
);

// Seller's own listings list
listingsRouter.get(
  '/seller/me',
  authenticate,
  requireRole('seller'),
  listingsController.getMyListings.bind(listingsController)
);

listingsRouter.get(
  '/:id',
  optionalAuthenticate,
  listingsController.getListingById.bind(listingsController)
);

// Seller create & stock update
listingsRouter.post(
  '/',
  authenticate,
  requireRole('seller'),
  validate(createListingSchema),
  listingsController.createListing.bind(listingsController)
);

listingsRouter.patch(
  '/:id/stock',
  authenticate,
  requireRole('seller'),
  validate(updateStockSchema),
  listingsController.updateStock.bind(listingsController)
);

// Submit listing for approval
listingsRouter.post(
  '/:id/submit',
  authenticate,
  requireRole('seller'),
  listingsController.submitForReview.bind(listingsController)
);

// Photo upload & delete
listingsRouter.post(
  '/:id/images',
  authenticate,
  requireRole('seller'),
  upload.single('image'),
  listingsController.uploadImage.bind(listingsController)
);

listingsRouter.delete(
  '/:id/images/:imageId',
  authenticate,
  requireRole('seller'),
  listingsController.deleteImage.bind(listingsController)
);
