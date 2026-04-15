// Service Worker for Second Opinion PWA
const CACHE_NAME = 'second-opinion-v2';

// Assets to cache on install (app shell)
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/reset.css',
  '/css/retro.css',
  '/css/components.css',
  '/js/app.js',
  '/js/api.js',
  '/js/state.js',
  '/js/audio.js',
  '/js/player.js',
  '/js/scoreboard.js',
  '/js/screens/title.js',
  '/js/screens/briefing.js',
  '/js/screens/ehr.js',
  '/js/screens/verdict.js',
  '/js/screens/reveal.js',
  '/js/screens/stats.js',
  '/js/screens/instructions.js',
  '/js/components/terminal.js',
  '/js/components/patient-sprite.js',
  '/js/components/chat-panel.js',
  '/js/components/notes-viewer.js',
  '/js/components/obs-chart.js',
  '/js/components/bloods-table.js',
  '/js/components/confidence.js',
  '/js/components/glossary.js',
  '/js/components/game-timer.js',
  '/js/components/doctor-callback.js',
  '/js/components/bleeps.js',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Install — cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first for API calls, cache first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls or SSE streams
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache first for everything else, fall back to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses for next time
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
