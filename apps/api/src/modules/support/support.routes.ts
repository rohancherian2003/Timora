import { Router } from 'express';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';
import { formatTicketRef } from '@timora/shared';
import type { ApiSuccessResponse } from '@timora/shared';
import { notificationsService } from '../notifications/notifications.service.js';

export const supportRouter = Router();

supportRouter.use(['/notifications', '/tickets'], authenticate);

// Get user notification preferences
supportRouter.get('/notifications/preferences', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await notificationsService.getPreferences(userId);
    const response: ApiSuccessResponse = { success: true, data };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// Update user notification preferences
supportRouter.patch('/notifications/preferences', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await notificationsService.updatePreferences(userId, req.body);
    const response: ApiSuccessResponse = { success: true, data, message: 'Preferences updated.' };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// List user notifications
supportRouter.get('/notifications', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );
    const response: ApiSuccessResponse = { success: true, data: result.rows };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
supportRouter.patch('/notifications/:id/read', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;
    await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
    const response: ApiSuccessResponse = { success: true, data: { id: notificationId } };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// Create support ticket with concurrency-safe yearly numbering (TKT-YYYY-NNNN)
supportRouter.post('/tickets', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { category, description } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      throw new AppError(400, 'INVALID_INPUT', 'Ticket description must be at least 5 characters.');
    }

    const currentYear = new Date().getFullYear();
    let seq = 1;

    try {
      const seqRes = await query<{ current_seq: number }>(
        `INSERT INTO ticket_sequences (year, current_seq, updated_at)
         VALUES ($1, 1, NOW())
         ON CONFLICT (year) DO UPDATE
         SET current_seq = ticket_sequences.current_seq + 1, updated_at = NOW()
         RETURNING current_seq`,
        [currentYear]
      );
      seq = seqRes.rows[0]?.current_seq ?? 1;
    } catch {
      // Fallback if ticket_sequences table is not yet migrated in isolated environments
      const countRes = await query<{ count: string }>(
        `SELECT COUNT(*) FROM support_tickets WHERE reference LIKE $1`,
        [`TKT-${currentYear}-%`]
      );
      seq = parseInt(countRes.rows[0]?.count || '0', 10) + 1;
    }

    const reference = formatTicketRef(seq, currentYear);

    const result = await query(
      `INSERT INTO support_tickets (user_id, reference, category, description, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING *`,
      [userId, reference, (category || 'general').trim(), description.trim()]
    );

    const response: ApiSuccessResponse = {
      success: true,
      data: result.rows[0],
      message: `Support ticket created. Reference code: ${reference}`,
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// List user's support tickets
supportRouter.get('/tickets', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    const response: ApiSuccessResponse = { success: true, data: result.rows };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});
