import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createOrderSchema, cancelOrderSchema } from './orders.schema.js';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

// Create order (Buyer)
ordersRouter.post(
  '/',
  validate(createOrderSchema),
  ordersController.createOrder.bind(ordersController)
);

// Get my orders (Buyer or Seller)
ordersRouter.get(
  '/',
  ordersController.getUserOrders.bind(ordersController)
);

// Delivery confirmation (Buyer or Seller)
ordersRouter.patch(
  '/:id/confirm-delivery',
  ordersController.confirmDelivery.bind(ordersController)
);

// Cancellation request
ordersRouter.post(
  '/:id/cancel',
  validate(cancelOrderSchema),
  ordersController.requestCancellation.bind(ordersController)
);
