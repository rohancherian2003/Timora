import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import type { ApiSuccessResponse } from '@timora/shared';

export class AuthController {
  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, purpose } = req.body;
      const result = await authService.requestOtp(phone, purpose);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, otp, purpose } = req.body;
      const result = await authService.verifyOtp(phone, otp, purpose);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Account successfully registered.',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, pin } = req.body;
      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };
      const result = await authService.login(phone, pin, meta);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: ApiSuccessResponse = {
        success: true,
        data: { user: req.user },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const result = await authService.updateProfile(userId, role, req.body);
      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Profile updated successfully.',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
