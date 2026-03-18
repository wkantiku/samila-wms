// ===== Samila WMS 3PL — Service Worker v2 (PWA Mobile) =====
const CACHE_NAME = 'samila-wms-v2';
const OFFLINE_URL = '/index.html';

const PRECACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
];

// ── Install: pre-cache shell ──────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ────────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API calls — always network
  if (url.pathname.startsWith('/api/')) return;

  // HTML navigation — Network first, fallback to cached shell (offline support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // JS / CSS / images — Stale-While-Revalidate (fast load + background update)
  const isAsset = /\.(js|css|png|jpg|jpeg|svg|woff2?|ico)$/.test(url.pathname);
  if (isAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request).then(res => {
          if (res && res.status === 200) cache.put(event.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Default: Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
