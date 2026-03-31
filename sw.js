/* ============================================================
   Service Worker — Personal OS Dashboard
   Stratégie : Cache-first pour les assets statiques,
               Network-first pour l'HTML principal.
   Fonctionne entièrement hors ligne après le 1er chargement.
   ============================================================ */

const CACHE_NAME = 'personal-os-v1';

/* Ressources à mettre en cache dès l'installation */
const PRECACHE_URLS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  /* CDN — mis en cache au 1er accès via fetch handler */
];

/* CDN hosts à mettre en cache automatiquement */
const CDN_HOSTS = [
  'unpkg.com',
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/* ---- INSTALL : pré-cache les fichiers locaux ---- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ---- ACTIVATE : supprime les anciens caches ---- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---- FETCH ---- */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Fichiers locaux : network-first (pour maj), fallback cache */
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          /* Mettre à jour le cache avec la version fraîche */
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* CDN : cache-first (vitesse + offline) */
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  /* Anthropic API : toujours réseau (pas de cache pour les requêtes IA) */
  if (url.hostname.includes('anthropic.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* Tout le reste : cache-first */
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

/* ---- NOTIFICATION CLICK : focus l'app ---- */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});
