import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createOrderSchema, cancelOrderSchema } from './orders.schema.js';

export const ordersRouter = Router();

// Create order (Buyer) - strictly authenticated
ordersRouter.post(
  '/',
  authenticate,
  validate(createOrderSchema),
  ordersController.createOrder.bind(ordersController)
);

// Get my orders (Buyer or Seller)
ordersRouter.get(
  '/',
  optionalAuthenticate,
  ordersController.getUserOrders.bind(ordersController)
);

// Delivery confirmation (Buyer or Seller)
ordersRouter.patch(
  '/:id/confirm-delivery',
  optionalAuthenticate,
  ordersController.confirmDelivery.bind(ordersController)
);

// Cancellation request
ordersRouter.post(
  '/:id/cancel',
  optionalAuthenticate,
  validate(cancelOrderSchema),
  ordersController.requestCancellation.bind(ordersController)
);
