import { Router } from 'express';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { formatTicketRef } from '@timora/shared';
import type { ApiSuccessResponse } from '@timora/shared';
import { notificationsService } from '../notifications/notifications.service.js';

export const supportRouter = Router();

supportRouter.use(authenticate);

// VAPID Public Key for Web Push Subscription
supportRouter.get('/notifications/vapid-public-key', async (_req, res, next) => {
  try {
    const key = notificationsService.getVapidPublicKey();
    const response: ApiSuccessResponse = { success: true, data: { publicKey: key } };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// Register a push subscription
supportRouter.post('/notifications/subscribe', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { endpoint, keys, userAgent } = req.body;
    await notificationsService.subscribe(userId, { endpoint, keys, userAgent });
    const response: ApiSuccessResponse = { success: true, data: { subscribed: true }, message: 'Push subscription registered.' };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// Unregister a push subscription
supportRouter.delete('/notifications/unsubscribe', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { endpoint } = req.body;
    await notificationsService.unsubscribe(userId, endpoint);
    const response: ApiSuccessResponse = { success: true, data: { unsubscribed: true }, message: 'Push subscription removed.' };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

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

// Create support ticket
supportRouter.post('/tickets', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { category, description } = req.body;

    const countRes = await query<{ count: string }>('SELECT COUNT(*) FROM support_tickets');
    const seq = parseInt(countRes.rows[0]?.count || '0', 10) + 1;
    const reference = formatTicketRef(seq);

    const result = await query(
      `INSERT INTO support_tickets (user_id, reference, category, description, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING *`,
      [userId, reference, category || 'general', description]
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
