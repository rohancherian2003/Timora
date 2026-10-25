import type { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import type { ApiSuccessResponse } from '@timora/shared';

export class AdminController {
  async getPendingSellers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getPendingSellers();
      const response: ApiSuccessResponse = { success: true, data };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async approveSeller(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.id;
      const sellerId = req.params.id as string;
      const { note } = req.body;
      const result = await adminService.approveSeller(adminId, sellerId, note);
      const response: ApiSuccessResponse = { success: true, data: result };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async rejectSeller(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.id;
      const sellerId = req.params.id as string;
      const { reason } = req.body;
      const result = await adminService.rejectSeller(adminId, sellerId, reason);
      const response: ApiSuccessResponse = { success: true, data: result };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getPendingListings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getPendingListings();
      const response: ApiSuccessResponse = { success: true, data };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async approveListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.id;
      const listingId = req.params.id as string;
      const result = await adminService.approveListing(adminId, listingId);
      const response: ApiSuccessResponse = { success: true, data: result };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async rejectListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.id;
      const listingId = req.params.id as string;
      const { reason } = req.body;
      const result = await adminService.rejectListing(adminId, listingId, reason);
      const response: ApiSuccessResponse = { success: true, data: result };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAuditLogs();
      const response: ApiSuccessResponse = { success: true, data };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
