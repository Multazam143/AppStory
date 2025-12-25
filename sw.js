/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'story-app-v1';
const DATA_CACHE_NAME = 'story-app-data-v1';

// Deteksi base path (localhost vs GitHub Pages)
const BASE_PATH = self.location.pathname.startsWith('/AppStory')
  ? '/AppStory'
  : '';

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/app.bundle.js`,
  `${BASE_PATH}/images/logo.png`,
  `${BASE_PATH}/icons/icon-192x192.png`,
  `${BASE_PATH}/icons/icon-512x512.png`,
];

// =======================
// INSTALL
// =======================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});

// =======================
// ACTIVATE
// =======================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating');

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

// =======================
// FETCH
// =======================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API Story (Network First)
  if (
    url.href.startsWith('https://story-api.dicoding.dev/v1/stories') &&
    event.request.method === 'GET'
  ) {
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

  // App Shell (Cache First)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// =======================
// PUSH NOTIFICATION
// =======================
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    console.error('[SW] Push payload is not JSON');
  }

  const title = payload.title || 'Story App';
  const options = {
    body: payload.body || 'Ada story baru ditambahkan!',
    icon: `${BASE_PATH}/images/logo.png`,
    badge: `${BASE_PATH}/images/logo.png`,
    data: {
      url: payload.url || `${BASE_PATH}/#/`,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// =======================
// NOTIFICATION CLICK
// =======================
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
