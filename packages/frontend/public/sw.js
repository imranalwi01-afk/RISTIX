/// <reference lib="webworker" />

const CACHE_NAME = 'ifrs9-pro-v1';
const STATIC_CACHE = 'ifrs9-static-v1';
const API_CACHE = 'ifrs9-api-v1';
const IMAGE_CACHE = 'ifrs9-images-v1';

const OFFLINE_PAGE = '/offline';

// Static assets to precache (app shell)
const PRECACHE_URLS = [
  '/',
  OFFLINE_PAGE,
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, API_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler with strategy routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return;

  // API requests: StaleWhileRevalidate (5 min max age)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE, 5 * 60 * 1000));
    return;
  }

  // Image requests: CacheFirst (30 day max age)
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/i)
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60 * 1000));
    return;
  }

  // HTML/CSS/JS (app shell): NetworkFirst
  if (
    request.destination === 'document' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.startsWith('/_next/')
  ) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Default: NetworkFirst
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

/**
 * NetworkFirst: try network, fall back to cache, then offline page
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // For navigation requests, return offline page
    if (request.destination === 'document') {
      const offline = await caches.match(OFFLINE_PAGE);
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

/**
 * StaleWhileRevalidate: return cache immediately, update in background
 * @param {number} maxAge - max age in ms before treating cache as stale
 */
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  if (cached) {
    const dateHeader = cached.headers.get('date');
    const cachedTime = dateHeader ? new Date(dateHeader).getTime() : 0;
    if (Date.now() - cachedTime < maxAge) {
      return cached;
    }
  }

  return fetchPromise;
}

/**
 * CacheFirst: return cache, fetch only if missing
 * @param {number} maxAge - max age in ms before cache is considered stale
 */
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await caches.match(request);

  if (cached) {
    const dateHeader = cached.headers.get('date');
    const cachedTime = dateHeader ? new Date(dateHeader).getTime() : 0;
    if (Date.now() - cachedTime < maxAge) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
