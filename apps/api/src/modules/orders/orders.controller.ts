import type { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service.js';
import type { ApiSuccessResponse } from '@timora/shared';

export class OrdersController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user!.id;
      const order = await ordersService.createOrder(buyerId, req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: order,
        message: 'Order confirmed and stock allocated.',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async confirmDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-buyer-01';
      const orderId = req.params.id as string;
      const result = await ordersService.confirmDelivery(userId, orderId);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async requestCancellation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-buyer-01';
      const orderId = req.params.id as string;
      const { reason } = req.body;
      const result = await ordersService.requestCancellation(userId, orderId, reason);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const orders = await ordersService.getUserOrders(userId);
      const response: ApiSuccessResponse = {
        success: true,
        data: orders,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const ordersController = new OrdersController();
