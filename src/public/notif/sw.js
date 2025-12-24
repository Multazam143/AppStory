/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'storyapp-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/images/logo.png',
];

// =======================
// INSTALL
// =======================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// =======================
// ACTIVATE
// =======================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

// =======================
// FETCH
// =======================
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// =======================
// PUSH NOTIFICATION (INI KUNCI 🔥)
// =======================
self.addEventListener('push', (event) => {
  console.log('📩 PUSH EVENT DITERIMA');

  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('❌ Payload bukan JSON', error);
  }

  const title = payload.title || 'Story App';
  const options = {
    body: payload.body || 'Ada story baru ditambahkan!',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    data: {
      url: payload.url || '/#/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// =======================
// CLICK NOTIFICATION
// =======================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
