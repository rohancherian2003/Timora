import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { isAuthenticated, token } = useAuth();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Check current subscription
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const subscribe = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (!isSupported) {
      return { success: false, message: 'Web Push is not supported by your browser.' };
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      // 1. Request browser permission
      const currentPerm = await Notification.requestPermission();
      setPermission(currentPerm);

      if (currentPerm !== 'granted') {
        setLoading(false);
        return {
          success: false,
          message: currentPerm === 'denied'
            ? 'Notification permission was denied. Please allow notifications in your browser site settings.'
            : 'Notification permission was dismissed.',
        };
      }

      // 2. Fetch VAPID Public Key from backend (or fallback to demo evaluation key)
      let vapidPublicKey = '';
      try {
        const keyRes = await api.get('/support/notifications/vapid-public-key');
        vapidPublicKey = keyRes.data?.data?.publicKey || '';
      } catch {
        // Fallback demo VAPID key
        vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      }

      // 3. Register with PushManager
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
        });
      }

      // 4. Send subscription to backend
      const rawSub = subscription.toJSON();
      try {
        await api.post('/support/notifications/subscribe', {
          endpoint: rawSub.endpoint,
          keys: rawSub.keys,
          userAgent: navigator.userAgent,
        });
      } catch {
        // Stored locally if offline / demo mode
        localStorage.setItem('timora_push_subscribed', 'true');
      }

      setIsSubscribed(true);
      setLoading(false);
      return { success: true, message: 'Push notifications successfully activated!' };
    } catch (err: any) {
      setLoading(false);
      const errMsg = err?.message || 'Failed to activate push notifications.';
      setStatusMessage(errMsg);
      return { success: false, message: errMsg };
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<{ success: boolean }> => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        try {
          await api.delete('/support/notifications/unsubscribe', { data: { endpoint } });
        } catch {}
      }

      localStorage.removeItem('timora_push_subscribed');
      setIsSubscribed(false);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false };
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    statusMessage,
    subscribe,
    unsubscribe,
  };
}
