const CACHE_NAME = 'petal-couture-v1.0.0';
const RUNTIME_CACHE = 'petal-couture-runtime';
const IMAGE_CACHE = 'petal-couture-images';

// Files to cache immediately
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/flower.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('💾 Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('⚙️ Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== IMAGE_CACHE) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Ready to serve');
            return self.clients.claim();
        })
    );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle different resource types with appropriate strategies
    if (request.destination === 'image') {
        // Cache-first strategy for images
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                return cachedResponse || fetch(request).then(response => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(IMAGE_CACHE).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                }).catch(() => new Response('Image not available offline', { status: 503 }));
            })
        );
    } else {
        // Network-first for other resources with cache fallback
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    // Cache successful responses
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        const cacheName = request.destination === 'document' ? CACHE_NAME : RUNTIME_CACHE;
                        caches.open(cacheName).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Fallback to cache on network failure
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                console.log('📦 Serving from cache:', request.url);
                                return cachedResponse;
                            }
                            // Return offline page for documents
                            if (request.destination === 'document') {
                                return caches.match('/index.html');
                            }
                            return new Response('Resource not available offline', { status: 503 });
                        });
                })
        );
    }
});

// Background sync (for future use - e.g., syncing cart data)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

function syncOrders() {
    console.log('🔄 Syncing orders...');
    // Implement order sync logic here
    return Promise.resolve();
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from Petal Couture',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'petal-couture-notification',
        requireInteraction: false
    };
    
    event.waitUntil(
        self.registration.showNotification('🌸 Petal Couture', options)
    );
});