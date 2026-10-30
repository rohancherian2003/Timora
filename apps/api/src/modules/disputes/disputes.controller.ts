import type { Request, Response, NextFunction } from 'express';
import { disputesService } from './disputes.service.js';
import type { ApiSuccessResponse } from '@timora/shared';

export class DisputesController {
  async createDispute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await disputesService.createDispute(userId, req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Dispute submitted for Admin investigation.',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async resolveDispute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.id;
      const disputeId = req.params.id as string;
      const result = await disputesService.resolveDispute(adminId, disputeId, req.body);
      const response: ApiSuccessResponse = { success: true, data: result };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await disputesService.createReview(userId, req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Verified review submitted successfully.',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getReviewsForEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityId = req.params.entityId as string;
      const result = await disputesService.getReviewsForEntity(entityId);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async submitReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await disputesService.submitReport(userId, req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Report submitted for moderation.',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const disputesController = new DisputesController();
