const CACHE_NAME = 'uuid-generator-v1';
const ASSETS = [
  '/',
  '/about',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Установка: кладём статику в кеш
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация: удаляем старые версии кеша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // API не кешируем: нужны каждый раз новые UUID
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() =>
        new Response(JSON.stringify({ error: 'Офлайн' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Статика: сначала кеш, потом сеть
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => (req.mode === 'navigate' ? caches.match('/') : undefined));
    })
  );
});
