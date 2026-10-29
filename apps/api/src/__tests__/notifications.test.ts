import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationsService } from '../modules/notifications/notifications.service.js';
import * as db from '../config/database.js';

describe('In-Dashboard Notifications Workflow & User Isolation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an in-dashboard notification record for a specific user', async () => {
    const mockQuery = vi.spyOn(db, 'query').mockResolvedValueOnce({
      rows: [{ id: 'notif-uuid-1' }],
      rowCount: 1,
      command: 'INSERT',
      oid: 0,
      fields: [],
    });

    const notifId = await notificationsService.dispatch({
      userId: 'user-buyer-1',
      category: 'verification',
      title_en: 'Business Account Approved',
      title_ml: 'കച്ചവട അക്കൗണ്ട് അംഗീകരിച്ചു',
      body_en: 'Your profile has been verified by the Timora Admin cell.',
      body_ml: 'നിങ്ങളുടെ പ്രൊഫൈൽ ടിമോറ അഡ്മിൻ പരിശോധിച്ചു അംഗീകരിച്ചു.',
      action_url: '/dashboard/seller',
    });

    expect(notifId).toBe('notif-uuid-1');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO notifications');
    expect(mockQuery.mock.calls[0][1]).toEqual([
      'user-buyer-1',
      'verification',
      'Business Account Approved',
      'കച്ചവട അക്കൗണ്ട് അംഗീകരിച്ചു',
      'Your profile has been verified by the Timora Admin cell.',
      'നിങ്ങളുടെ പ്രൊഫൈൽ ടിമോറ അഡ്മിൻ പരിശോധിച്ചു അംഗീകരിച്ചു.',
      '/dashboard/seller',
    ]);
  });

  it('retrieves notifications strictly isolated to the authenticated user', async () => {
    const mockRows = [
      {
        id: 'notif-1',
        user_id: 'user-buyer-1',
        category: 'order',
        title_en: 'Order Confirmed',
        is_read: false,
      },
    ];

    const mockQuery = vi.spyOn(db, 'query').mockResolvedValueOnce({
      rows: mockRows,
      rowCount: 1,
      command: 'SELECT',
      oid: 0,
      fields: [],
    });

    const result = await notificationsService.getNotifications('user-buyer-1', 20);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe('user-buyer-1');
    expect(mockQuery.mock.calls[0][0]).toContain('WHERE user_id = $1');
    expect(mockQuery.mock.calls[0][1]).toEqual(['user-buyer-1', 20]);
  });

  it('marks a notification as read only when id and user_id match', async () => {
    const mockQuery = vi.spyOn(db, 'query').mockResolvedValueOnce({
      rows: [],
      rowCount: 1,
      command: 'UPDATE',
      oid: 0,
      fields: [],
    });

    const result = await notificationsService.markAsRead('notif-1', 'user-buyer-1');

    expect(result.id).toBe('notif-1');
    expect(mockQuery.mock.calls[0][0]).toContain('WHERE id = $1 AND user_id = $2');
    expect(mockQuery.mock.calls[0][1]).toEqual(['notif-1', 'user-buyer-1']);
  });

  it('manages in-dashboard notification preferences without push fields', async () => {
    const mockQuery = vi.spyOn(db, 'query').mockResolvedValueOnce({
      rows: [{
        user_id: 'user-buyer-1',
        enquiries: true,
        offers: true,
        orders: true,
        wishlist: false,
        support: true,
        security: true,
      }],
      rowCount: 1,
      command: 'SELECT',
      oid: 0,
      fields: [],
    });

    const prefs = await notificationsService.getPreferences('user-buyer-1');
    expect(prefs.enquiries).toBe(true);
    expect(prefs.wishlist).toBe(false);
    expect(mockQuery.mock.calls[0][0]).toContain('FROM notification_preferences WHERE user_id = $1');
  });
});
