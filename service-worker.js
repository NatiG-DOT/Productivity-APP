// TimeFlow Service Worker - Final Version
const CACHE_NAME = 'timeflow-final-v1';
const urlsToCache = [
  './',
  './index.html'
];

// Install - cache files immediately
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  self.skipWaiting(); // Take control immediately
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[SW] Cache failed:', err))
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Taking control');
        return self.clients.claim(); // Take control of all pages
      })
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseClone = response.clone();
        
        // Update cache with new response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from TimeFlow',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" fill="%2310b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="120" fill="white">⚡</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="%2310b981"/></svg>',
    vibrate: [200, 100, 200],
    tag: 'timeflow'
  };

  event.waitUntil(
    self.registration.showNotification('TimeFlow', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./')
  );
});
