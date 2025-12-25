const CACHE_NAME = 'story-app-v1';
const DATA_CACHE_NAME = 'story-app-data-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app.bundle.js',
  '/images/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== DATA_CACHE_NAME
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.href.startsWith('https://story-api.dicoding.dev/v1/stories')) {
    if (event.request.method === 'GET') {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then((cache) =>
          fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch(() => cache.match(event.request))
        )
      );
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('[SW] Push payload is not JSON');
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url === event.notification.data.url &&
            'focus' in client
          ) {
            return client.focus();
          }
        }
        return clients.openWindow(event.notification.data.url);
      })
  );
});
