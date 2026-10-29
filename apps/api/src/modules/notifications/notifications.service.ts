import webpush from 'web-push';
import { query } from '../../config/database.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// Ephemeral fallback key pair for dev/test when not configured via env
let ephemeralVapidKeys: { publicKey: string; privateKey: string } | null = null;

function getVapidKeys(): { publicKey: string; privateKey: string; subject: string } {
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY,
      subject: env.VAPID_SUBJECT,
    };
  }

  if (!ephemeralVapidKeys) {
    ephemeralVapidKeys = webpush.generateVAPIDKeys();
    logger.info('Generated ephemeral VAPID keys for development Web Push');
  }

  return {
    publicKey: ephemeralVapidKeys.publicKey,
    privateKey: ephemeralVapidKeys.privateKey,
    subject: env.VAPID_SUBJECT,
  };
}

// Initialize web-push details
try {
  const keys = getVapidKeys();
  webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
} catch (err) {
  logger.warn({ err }, 'Failed to initialize web-push VAPID details');
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export interface SendNotificationOptions {
  userId: string;
  category: 'enquiry' | 'order' | 'support' | 'verification' | 'system' | 'offer';
  title_en: string;
  title_ml?: string;
  body_en?: string;
  body_ml?: string;
  action_url?: string;
}

export class NotificationsService {
  /**
   * Returns the public VAPID key so the frontend can subscribe with PushManager
   */
  getVapidPublicKey(): string {
    const keys = getVapidKeys();
    return keys.publicKey;
  }

  /**
   * Persists a push subscription for the authenticated user
   */
  async subscribe(userId: string, payload: PushSubscriptionPayload) {
    if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys?.auth) {
      throw new Error('Invalid push subscription payload. Endpoint and keys required.');
    }

    await query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent, last_used_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (endpoint)
       DO UPDATE SET user_id = EXCLUDED.user_id,
                     p256dh = EXCLUDED.p256dh,
                     auth = EXCLUDED.auth,
                     user_agent = EXCLUDED.user_agent,
                     last_used_at = NOW()`,
      [userId, payload.endpoint, payload.keys.p256dh, payload.keys.auth, payload.userAgent || null]
    );

    logger.info({ userId, endpoint: payload.endpoint.slice(0, 30) }, 'Push subscription saved');
    return { success: true };
  }

  /**
   * Unregisters a push subscription
   */
  async unsubscribe(userId: string, endpoint: string) {
    await query(
      `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
      [userId, endpoint]
    );
    return { success: true };
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
        push_enabled: true,
      };
    }
    return res.rows[0];
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId: string, prefs: Record<string, boolean>) {
    const allowed = ['enquiries', 'offers', 'orders', 'wishlist', 'support', 'security', 'push_enabled'];
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
        `INSERT INTO notification_preferences (user_id, ${allowed.filter(k => typeof prefs[k] === 'boolean').join(', ')})
         VALUES ($1, ${values.slice(1).map((_, i) => `$${i + 2}`).join(', ')})
         ON CONFLICT (user_id)
         DO UPDATE SET ${updates.join(', ')}`,
        values
      );
    }

    return this.getPreferences(userId);
  }

  /**
   * Send a notification:
   * 1. Preserves in-dashboard notification table record
   * 2. Dispatches Web Push if push is enabled and subscriptions exist
   */
  async dispatch(options: SendNotificationOptions) {
    const { userId, category, title_en, title_ml, body_en, body_ml, action_url } = options;

    // 1. In-dashboard notification (always saved)
    let inDashboardNotificationId: string | null = null;
    try {
      const insertRes = await query<{ id: string }>(
        `INSERT INTO notifications (user_id, category, title_en, title_ml, body_en, body_ml, action_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [userId, category, title_en, title_ml || null, body_en || null, body_ml || null, action_url || null]
      );
      inDashboardNotificationId = insertRes.rows[0]?.id || null;
    } catch (err) {
      logger.error({ err, userId }, 'Failed to insert in-dashboard notification');
    }

    // 2. Check user notification preferences
    try {
      const prefRes = await query(
        `SELECT * FROM notification_preferences WHERE user_id = $1`,
        [userId]
      );
      const prefs = prefRes.rows[0];
      if (prefs) {
        if (prefs.push_enabled === false) return inDashboardNotificationId;
        // Check category-specific opt-out
        if (category === 'enquiry' && prefs.enquiries === false) return inDashboardNotificationId;
        if (category === 'order' && prefs.orders === false) return inDashboardNotificationId;
        if (category === 'support' && prefs.support === false) return inDashboardNotificationId;
      }
    } catch (err) {
      logger.warn({ err }, 'Could not read notification preferences; defaulting to push enabled');
    }

    // 3. Find active push subscriptions
    let subscriptions: any[] = [];
    try {
      const subRes = await query(
        `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1`,
        [userId]
      );
      subscriptions = subRes.rows;
    } catch (err) {
      logger.warn({ err }, 'Could not query push subscriptions');
      return inDashboardNotificationId;
    }

    if (subscriptions.length === 0) {
      return inDashboardNotificationId;
    }

    // 4. Send Web Push to all active devices
    const pushPayload = JSON.stringify({
      title: title_en,
      title_ml: title_ml || title_en,
      body: body_en || title_en,
      body_ml: body_ml || body_en || title_en,
      url: action_url || '/',
      category,
      icon: '/images/brand/timora-logo-full-transparent.png',
      badge: '/pwa-192x192.png',
      timestamp: Date.now(),
    });

    const deadEndpoints: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, pushPayload);
          // Update last_used_at
          query(`UPDATE push_subscriptions SET last_used_at = NOW() WHERE id = $1`, [sub.id]).catch(() => {});
        } catch (pushErr: any) {
          // 410 Gone or 404 Not Found indicates subscription expired / revoked
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            deadEndpoints.push(sub.endpoint);
          } else {
            logger.warn({ err: pushErr.message, endpoint: sub.endpoint.slice(0, 30) }, 'Web Push dispatch failed');
          }
        }
      })
    );

    // 5. Purge expired subscriptions
    if (deadEndpoints.length > 0) {
      try {
        await query(
          `DELETE FROM push_subscriptions WHERE endpoint = ANY($1)`,
          [deadEndpoints]
        );
        logger.info({ count: deadEndpoints.length }, 'Purged expired push subscriptions');
      } catch (purgeErr) {
        logger.warn({ purgeErr }, 'Failed to purge dead push subscriptions');
      }
    }

    return inDashboardNotificationId;
  }
}

export const notificationsService = new NotificationsService();
