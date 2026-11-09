import type { Request, Response, NextFunction } from 'express';
import { listingsService } from './listings.service.js';
import { uploadListingImage, deleteListingImage } from '../../utils/storage.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { ApiSuccessResponse } from '@timora/shared';

export class ListingsController {
  async searchListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingsService.searchListings(req.query as any);
      const response: ApiSuccessResponse & Record<string, unknown> = {
        success: true,
        data: result,
        listings: result.listings,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        currentPage: result.currentPage,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingsService.getListingById(req.params.id as string);
      
      // Guest privacy sanitization: omit private seller phone number if not logged in
      if (!req.user && result) {
        delete (result as Record<string, unknown>).seller_phone;
      }

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

  async submitForReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.id;
      const listingId = req.params.id as string;
      const result = await listingsService.submitForReview(sellerId, listingId);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Listing submitted for Admin review.',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.id;
      const listingId = req.params.id as string;
      const file = req.file;

      if (!file || !file.buffer || file.buffer.length === 0) {
        throw new AppError(400, 'FILE_REQUIRED', 'Image file is required.');
      }

      const uploaded = await uploadListingImage(
        file.buffer,
        file.originalname,
        file.mimetype,
        listingId
      );

      try {
        const result = await listingsService.addListingImage(sellerId, listingId, uploaded);
        const response: ApiSuccessResponse = {
          success: true,
          data: result,
          message: 'Photograph uploaded successfully.',
        };
        res.status(201).json(response);
      } catch (dbErr) {
        // Rollback / clean up uploaded storage key if database insertion fails
        if (uploaded?.storageKey) {
          await deleteListingImage(uploaded.storageKey).catch(() => {});
        }
        throw dbErr;
      }
    } catch (err) {
      next(err);
    }
  }

  async replaceImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.id;
      const listingId = req.params.id as string;
      const imageId = req.params.imageId as string;
      const file = req.file;

      if (!file || !file.buffer || file.buffer.length === 0) {
        throw new AppError(400, 'FILE_REQUIRED', 'Image file is required for replacement.');
      }

      const uploaded = await uploadListingImage(
        file.buffer,
        file.originalname,
        file.mimetype,
        listingId
      );

      try {
        const result = await listingsService.replaceListingImage(
          sellerId,
          listingId,
          imageId,
          uploaded
        );

        if (result?.old_storage_key && result.old_storage_key !== uploaded.storageKey) {
          await deleteListingImage(result.old_storage_key).catch(() => {});
        }

        const response: ApiSuccessResponse = {
          success: true,
          data: result,
          message: 'Photograph replaced successfully.',
        };
        res.status(200).json(response);
      } catch (dbErr) {
        if (uploaded?.storageKey) {
          await deleteListingImage(uploaded.storageKey).catch(() => {});
        }
        throw dbErr;
      }
    } catch (err) {
      next(err);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.id;
      const listingId = req.params.id as string;
      const imageId = req.params.imageId as string;

      const deleted = await listingsService.removeListingImage(sellerId, listingId, imageId);
      if (deleted?.storage_key) {
        await deleteListingImage(deleted.storage_key);
      }

      const response: ApiSuccessResponse = {
        success: true,
        data: { id: imageId },
        message: 'Photograph removed successfully.',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.id;
      const result = await listingsService.getSellerListings(sellerId);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const listingId = req.params.id as string;

      const result = await listingsService.deleteListing(userId, userRole, listingId);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Timber listing removed successfully.',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async markAsSold(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const listingId = req.params.id as string;

      const result = await listingsService.markAsSold(userId, userRole, listingId);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Timber listing marked as sold successfully.',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const listingsController = new ListingsController();
