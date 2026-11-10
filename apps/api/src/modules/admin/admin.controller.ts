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

  async updateApprovalStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.id;
      const targetUserId = (req.params.userId || req.params.id) as string;
      const { status, action, note, reason } = req.body || {};

      const effectiveStatus = (status || action || '').toString().toLowerCase();

      if (effectiveStatus === 'approved' || effectiveStatus === 'approve') {
        const result = await adminService.approveSeller(adminId, targetUserId, note);
        const response: ApiSuccessResponse = { success: true, data: result, message: 'Business application approved successfully.' };
        res.status(200).json(response);
        return;
      }

      if (effectiveStatus === 'rejected' || effectiveStatus === 'reject') {
        const result = await adminService.rejectSeller(adminId, targetUserId, reason || note || 'Rejected by Admin');
        const response: ApiSuccessResponse = { success: true, data: result, message: 'Business application rejected.' };
        res.status(200).json(response);
        return;
      }

      if (effectiveStatus === 'action_required' || effectiveStatus === 'request_info') {
        const result = await adminService.updateBusinessStatus(adminId, {
          entityType: 'seller', // will be auto-resolved inside service
          entityId: targetUserId,
          status: 'ACTION_REQUIRED',
          note: note || reason || 'Additional documentation requested by moderator.',
          reason: reason || note,
        });
        const response: ApiSuccessResponse = { success: true, data: result, message: 'Information requested from applicant.' };
        res.status(200).json(response);
        return;
      }

      // Default to approve if unspecified
      const result = await adminService.approveSeller(adminId, targetUserId, note);
      const response: ApiSuccessResponse = { success: true, data: result };
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
}

export const adminController = new AdminController();
