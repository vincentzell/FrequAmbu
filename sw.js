const CACHE_NAME = 'frequambu-cache-v2';

// Liste des ressources RÉELLEMENT présentes sur ton GitHub
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icon512_maskable.png',
  'icon512_rounded.png'
];

// Étape 1 : Installation du Service Worker et mise en cache des fichiers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des ressources globales');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Étape 2 : Activation et nettoyage des anciens caches si la version change
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Nettoyage de l\'ancien cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Étape 3 : Interception des requêtes (Stratégie Cache-First avec fallback Réseau)
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Ignorer l'erreur si hors-ligne */});

        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
