import type { Request, Response, NextFunction } from 'express';
import { enquiriesService } from './enquiries.service.js';
import type { ApiSuccessResponse } from '@timora/shared';

export class EnquiriesController {
  async createEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user!.id;
      const result = await enquiriesService.createEnquiry(buyerId, req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Enquiry submitted to seller.',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const enquiryId = req.params.id as string;
      const result = await enquiriesService.getEnquiry(userId, enquiryId);
      const response: ApiSuccessResponse = { success: true, data: result };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async makeOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const enquiryId = req.params.id as string;
      const result = await enquiriesService.makeOffer(userId, enquiryId, req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Offer submitted successfully.',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async acceptOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const offerId = req.params.offerId as string;
      const result = await enquiriesService.acceptOffer(userId, offerId);
      const response: ApiSuccessResponse = { success: true, data: result };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const enquiryId = req.params.id as string;
      const result = await enquiriesService.sendMessage(userId, enquiryId, req.body.body);
      const response: ApiSuccessResponse = { success: true, data: result };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const enquiriesController = new EnquiriesController();
