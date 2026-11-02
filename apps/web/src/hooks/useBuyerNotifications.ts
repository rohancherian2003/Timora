import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export function useBuyerNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'buyer') {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await api.get('/support/notifications');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const unread = res.data.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch {
      // Graceful offline or unauthenticated fallback
    }
  }, [isAuthenticated, user?.role, user?.id]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 25000);
    const handleUpdate = () => fetchCount();

    window.addEventListener('timora_notifications_updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('timora_notifications_updated', handleUpdate);
    };
  }, [fetchCount]);

  return { unreadCount, refreshCount: fetchCount };
}
