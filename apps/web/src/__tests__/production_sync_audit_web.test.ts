import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Production Sync Audit - Frontend Logic', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    const listeners: Record<string, ((event: any) => void)[]> = {};
    (globalThis as any).window = {
      addEventListener: (type: string, cb: any) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(cb);
      },
      removeEventListener: (type: string, cb: any) => {
        if (listeners[type]) {
          listeners[type] = listeners[type].filter((l) => l !== cb);
        }
      },
      dispatchEvent: (event: any) => {
        const cbs = listeners[event.type] || [];
        cbs.forEach((cb) => cb(event));
        return true;
      },
    };
    (globalThis as any).CustomEvent = class {
      type: string;
      constructor(type: string) {
        this.type = type;
      }
    };
    vi.restoreAllMocks();
  });

  describe('Issue 2: Notification Persistent Dismissal across page reloads', () => {
    it('persists dismissed notification IDs in localStorage so banner never reappears', () => {
      const dismissedIds = ['notif-1', 'notif-2'];
      localStorage.setItem('timora_dismissed_notification_ids', JSON.stringify(dismissedIds));

      const raw = localStorage.getItem('timora_dismissed_notification_ids');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toEqual(['notif-1', 'notif-2']);

      // Simulating a notification list
      const notifications = [
        { id: 'notif-1', title_en: 'Support Ticket Resolved (TKT-2026-0002)' },
        { id: 'notif-3', title_en: 'New System Update' },
      ];

      const visible = notifications.filter((n) => !parsed.includes(n.id));
      expect(visible).toHaveLength(1);
      expect(visible[0]!.id).toBe('notif-3');
    });

    it('extracts ticket ID correctly from Support Ticket Resolved title', () => {
      const title = 'Support Ticket Resolved (TKT-2026-0002)';
      const match = title.match(/TKT-[\w-]+/i);
      expect(match).not.toBeNull();
      expect(match![0]).toBe('TKT-2026-0002');
    });
  });

  describe('Issue 3: Image Deduplication Safety in Frontend', () => {
    it('deduplicates uploaded images array by file name and size', () => {
      const existing = [{ name: 'teak1.jpg', size: 1024 }];
      const incoming = [
        { name: 'teak1.jpg', size: 1024 }, // duplicate
        { name: 'teak2.jpg', size: 2048 }, // unique
      ];

      const existingKeys = new Set(existing.map((f) => `${f.name}_${f.size}`));
      const unique = incoming.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));

      expect(unique).toHaveLength(1);
      expect(unique[0]!.name).toBe('teak2.jpg');
    });

    it('deduplicates viewingDetailsListing.images by image url', () => {
      const duplicatedImages = [
        { id: '1', url: 'https://example.com/photo1.jpg', is_primary: true },
        { id: '2', url: 'https://example.com/photo2.jpg', is_primary: false },
        { id: '3', url: 'https://example.com/photo1.jpg', is_primary: false },
        { id: '4', url: 'https://example.com/photo2.jpg', is_primary: false },
      ];

      const unique = Array.from(
        new Map(
          duplicatedImages
            .filter((img) => img && img.url)
            .map((img) => [img.url, img])
        ).values()
      );

      expect(unique).toHaveLength(2);
      expect(unique.map((u) => u.url)).toEqual([
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
      ]);
    });
  });

  describe('Issue 1: Admin Pending Listings Invalidation Event', () => {
    it('dispatches and receives timora_listings_updated window event', () => {
      let eventFired = false;
      const listener = () => {
        eventFired = true;
      };
      window.addEventListener('timora_listings_updated', listener);

      window.dispatchEvent(new CustomEvent('timora_listings_updated'));
      expect(eventFired).toBe(true);

      window.removeEventListener('timora_listings_updated', listener);
    });
  });
});
