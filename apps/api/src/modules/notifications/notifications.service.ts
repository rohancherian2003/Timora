import { query } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export interface SendNotificationOptions {
  userId: string;
  category: 'enquiry' | 'order' | 'support' | 'verification' | 'system' | 'offer' | 'listing';
  title_en: string;
  title_ml?: string;
  body_en?: string;
  body_ml?: string;
  action_url?: string;
}

export class NotificationsService {
  /**
   * Insert in-dashboard notification into existing notifications table.
   */
  async dispatch(options: SendNotificationOptions) {
    const { userId, category, title_en, title_ml, body_en, body_ml, action_url } = options;

    try {
      const insertRes = await query<{ id: string }>(
        `INSERT INTO notifications (user_id, category, title_en, title_ml, body_en, body_ml, action_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [userId, category, title_en, title_ml || null, body_en || null, body_ml || null, action_url || null]
      );
      return insertRes.rows[0]?.id || null;
    } catch (err) {
      logger.error({ err, userId }, 'Failed to insert in-dashboard notification');
      return null;
    }
  }

  /**
   * Helper alias for dispatch
   */
  async create(options: SendNotificationOptions) {
    return this.dispatch(options);
  }

  /**
   * Fetch in-dashboard notifications for the authenticated user only
   */
  async getNotifications(userId: string, limit = 30) {
    const res = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }

  /**
   * Mark a notification as read for the authenticated user only
   */
  async markAsRead(notificationId: string, userId: string) {
    await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
    return { id: notificationId };
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string) {
    const res = await query(
      `SELECT * FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );
    if (res.rows.length === 0) {
      return {
        enquiries: true,
        offers: true,
        orders: true,
        wishlist: true,
        support: true,
        security: true,
      };
    }
    return res.rows[0];
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId: string, prefs: Record<string, boolean>) {
    const allowed = ['enquiries', 'offers', 'orders', 'wishlist', 'support', 'security'];
    const updates: string[] = [];
    const values: any[] = [userId];
    let idx = 2;

    for (const key of allowed) {
      if (typeof prefs[key] === 'boolean') {
        updates.push(`${key} = $${idx++}`);
        values.push(prefs[key]);
      }
    }

    if (updates.length > 0) {
      await query(
        `INSERT INTO notification_preferences (user_id, ${allowed.filter((k) => typeof prefs[k] === 'boolean').join(', ')})
         VALUES ($1, ${values.slice(1).map((_, i) => `$${i + 2}`).join(', ')})
         ON CONFLICT (user_id)
         DO UPDATE SET ${updates.join(', ')}`,
        values
      );
    }

    return this.getPreferences(userId);
  }
}

export const notificationsService = new NotificationsService();
