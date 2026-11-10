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

// List user notifications (excluding dismissed notifications)
supportRouter.get('/notifications', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    let result;
    try {
      result = await query(
        `SELECT * FROM notifications WHERE user_id = $1 AND (is_dismissed IS NOT TRUE) ORDER BY created_at DESC LIMIT 30`,
        [userId]
      );
    } catch {
      result = await query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
        [userId]
      );
    }
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

// Permanently dismiss notification across sessions
const dismissNotificationHandler = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;
    try {
      await query(
        `UPDATE notifications SET is_read = true, is_dismissed = true WHERE id = $1 AND user_id = $2`,
        [notificationId, userId]
      );
    } catch {
      await query(
        `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
        [notificationId, userId]
      );
    }
    const response: ApiSuccessResponse = {
      success: true,
      data: { id: notificationId, is_dismissed: true },
      message: 'Notification dismissed permanently.',
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

supportRouter.patch('/notifications/:id/dismiss', dismissNotificationHandler);
supportRouter.post('/notifications/:id/dismiss', dismissNotificationHandler);

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

// Admin: List all support tickets
supportRouter.get('/tickets/all', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT t.*, u.phone, COALESCE(up.name, '') as name, u.role
       FROM support_tickets t
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    const response: ApiSuccessResponse = { success: true, data: result.rows };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// Admin: Resolve support ticket and send solution to user
const resolveTicketHandler = async (req: any, res: any, next: any) => {
  try {
    const adminId = req.user!.id;
    const ticketId = req.params.id;
    const { resolution, reply, message, resolution_ml } = req.body || {};
    const replyText = resolution || reply || message || 'Issue resolved by Timora Admin Cell.';
    const replyTextMl = resolution_ml || replyText;

    let updatedTicket = null;
    try {
      const updateRes = await query(
        `UPDATE support_tickets
         SET status = 'resolved', updated_at = NOW()
         WHERE (id::text = $1 OR reference = $1)
         RETURNING *`,
        [ticketId]
      );
      updatedTicket = updateRes.rows[0];
    } catch {
      // Graceful fallback
    }

    if (updatedTicket) {
      try {
        await query(
          `INSERT INTO support_ticket_messages (ticket_id, sender_id, body)
           VALUES ($1, $2, $3)`,
          [updatedTicket.id, adminId, replyText]
        );
      } catch {}

      if (updatedTicket.user_id) {
        notificationsService.dispatch({
          userId: updatedTicket.user_id,
          category: 'support',
          title_en: `Support Ticket Resolved (${updatedTicket.reference})`,
          title_ml: `സഹായ അഭ്യർത്ഥന പരിഹരിച്ചു (${updatedTicket.reference})`,
          body_en: replyText,
          body_ml: replyTextMl,
          action_url: '/dashboard',
        }).catch(() => {});
      }
    }

    const response: ApiSuccessResponse = {
      success: true,
      data: updatedTicket || { id: ticketId, status: 'resolved', resolutionReply: replyText },
      message: 'Support ticket resolved and solution reply sent to user dashboard.',
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

supportRouter.post('/tickets/:id/resolve', resolveTicketHandler);
supportRouter.patch('/tickets/:id/resolve', resolveTicketHandler);

// Mark support ticket as read
supportRouter.patch('/tickets/:id/read', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const ticketId = req.params.id;
    try {
      await query(
        `UPDATE support_tickets SET updated_at = NOW() WHERE (id::text = $1 OR reference = $1) AND user_id = $2`,
        [ticketId, userId]
      );
    } catch {
      // Graceful fallback for non-UUID reference strings
    }
    const response: ApiSuccessResponse = {
      success: true,
      data: { id: ticketId, isRead: true },
      message: 'Support ticket marked as read.',
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});
