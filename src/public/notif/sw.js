self.addEventListener('push', (event) => {
  let data = { title: 'Story App', options: { body: 'New notification' } };

  if (event.data) {
    try {
      const payload = JSON.parse(event.data.text());
      data = {
        title: payload.title || data.title,
        options: {
          body: payload.options?.body || payload.body || data.options.body,
          icon: './images/logo.png',
          badge: './images/logo.png',
          vibrate: [100, 50, 100],
          data: {
            url: payload.options?.data?.url || '/',
          },
          actions: [
            { action: 'explore', title: 'Lihat' },
            { action: 'close', title: 'Tutup' }
          ]
        },
      };
    } catch (e) {
      data.options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, data.options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore' || !event.action) {
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});