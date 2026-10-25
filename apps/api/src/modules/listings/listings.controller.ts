import type { Request, Response, NextFunction } from 'express';
import { listingsService } from './listings.service.js';
import type { ApiSuccessResponse } from '@timora/shared';

export class ListingsController {
  async searchListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingsService.searchListings(req.query as any);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingsService.getListingById(req.params.id as string);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async createListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.id;
      const result = await listingsService.createListing(sellerId, req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Timber listing submitted for Admin review.',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.id;
      const listingId = req.params.id as string;
      const { quantity, price_per_cft } = req.body;
      const result = await listingsService.updateStock(sellerId, listingId, quantity, price_per_cft);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Stock updated successfully.',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const listingsController = new ListingsController();
