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

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const listingId = req.params.id as string;
      const { status } = req.body || {};

      if (status === 'sold') {
        const result = await listingsService.markAsSold(userId, userRole, listingId);
        const response: ApiSuccessResponse = {
          success: true,
          data: result,
          message: 'Timber listing marked as sold successfully.',
        };
        res.status(200).json(response);
        return;
      }

      if (status === 'deleted') {
        const result = await listingsService.deleteListing(userId, userRole, listingId);
        const response: ApiSuccessResponse = {
          success: true,
          data: result,
          message: 'Timber listing removed successfully.',
        };
        res.status(200).json(response);
        return;
      }

      throw new AppError(400, 'INVALID_STATUS', `Status '${status}' is not supported via this endpoint.`);
    } catch (err) {
      next(err);
    }
  }

  async appendPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uploadedImages: string[] = [];
    try {
      const sellerId = req.user!.id;
      const listingId = req.params.id as string;
      const files: Express.Multer.File[] = [];

      if (req.file) files.push(req.file);
      if (Array.isArray((req as any).files)) {
        files.push(...(req as any).files);
      }

      // Strictly deduplicate files to avoid duplicate image attachments
      const seenFileKeys = new Set<string>();
      const uniqueFiles: Express.Multer.File[] = [];
      for (const file of files) {
        const key = `${file.originalname}_${file.size}`;
        if (!seenFileKeys.has(key)) {
          seenFileKeys.add(key);
          uniqueFiles.push(file);
        }
      }

      const results = [];

      if (uniqueFiles.length > 0) {
        for (const file of uniqueFiles) {
          const uploaded = await uploadListingImage(
            file.buffer,
            file.originalname,
            file.mimetype,
            listingId
          );
          if (uploaded.storageKey) uploadedImages.push(uploaded.storageKey);
          const saved = await listingsService.addListingImage(sellerId, listingId, uploaded);
          results.push(saved);
        }
      } else if (req.body?.imageUrl || req.body?.imageUrls || req.body?.photos) {
        const rawUrls: string[] = Array.isArray(req.body.imageUrls)
          ? req.body.imageUrls
          : Array.isArray(req.body.photos)
          ? req.body.photos
          : [req.body.imageUrl];
        const urls: string[] = Array.from(
          new Set(rawUrls.filter((u): u is string => typeof u === 'string' && u.trim().length > 0))
        );
        for (const url of urls) {
          if (url && typeof url === 'string') {
            const saved = await listingsService.addListingImage(sellerId, listingId, {
              storageKey: `external-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              publicUrl: url,
            });
            results.push(saved);
          }
        }
      } else {
        throw new AppError(400, 'NO_PHOTOS', 'No image file or image URLs provided.');
      }

      const response: ApiSuccessResponse = {
        success: true,
        data: results.length === 1 ? results[0] : results,
        message: 'Photos appended to timber listing successfully.',
      };
      res.status(200).json(response);
    } catch (err) {
      for (const key of uploadedImages) {
        await deleteListingImage(key).catch(() => {});
      }
      next(err);
    }
  }
}

export const listingsController = new ListingsController();
