const CACHE_NAME = 'story-app-v1';
const DATA_CACHE_NAME = 'story-app-data-v1';

// Daftar file statis (App Shell)
// Karena pakai Webpack, kita TIDAK meng-cache file source (/src/...)
// Melainkan file hasil build (/app.bundle.js, /images/..., dll)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/logo.png',
  '/app.bundle.js', // PENTING: Ini berisi semua logika JS & CSS kamu
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. STRATEGI UNTUK API (Data Dinamis)
  // Menargetkan URL API Story Dicoding
  if (url.href.startsWith('https://story-api.dicoding.dev/v1/stories')) {
    
    // Kita hanya menyimpan data saat GET (Mengambil cerita).
    // Jangan cache saat POST (Upload/Login) agar tidak error saat offline.
    if (event.request.method === 'GET') {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          // Network First: Coba ambil dari internet dulu
          return fetch(event.request)
            .then(response => {
              // Jika berhasil online, simpan respon terbaru ke cache
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Jika offline/gagal, ambil dari cache
              return cache.match(event.request);
            });
        })
      );
      return;
    }
  }

  // 2. STRATEGI UNTUK APP SHELL (File Statis)
  // Cache First: Cek cache dulu, kalau tidak ada baru ke internet
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});