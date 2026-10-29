// TIMORA™ Service Worker Push & Notification Click Handlers
// Licensed under TIMORA Smart Timber Marketplace

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: 'TIMORA', body: event.data.text() };
  }

  const title = payload.title || 'TIMORA™ Timber Marketplace';
  const options = {
    body: payload.body || 'You have a new update on Timora.',
    icon: payload.icon || '/images/brand/timora-logo-full-transparent.png',
    badge: payload.badge || '/pwa-192x192.png',
    data: {
      url: payload.url || '/',
      timestamp: payload.timestamp || Date.now(),
      category: payload.category || 'general',
    },
    vibrate: [100, 50, 100],
    tag: payload.category || 'timora-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a Timora window is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
