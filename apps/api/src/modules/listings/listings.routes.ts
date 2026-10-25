import { Router } from 'express';
import { listingsController } from './listings.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  createListingSchema,
  updateStockSchema,
  listQuerySchema,
} from './listings.schema.js';

export const listingsRouter = Router();

// Public routes
listingsRouter.get(
  '/',
  validate(listQuerySchema),
  listingsController.searchListings.bind(listingsController)
);

listingsRouter.get(
  '/:id',
  listingsController.getListingById.bind(listingsController)
);

// Seller routes
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
