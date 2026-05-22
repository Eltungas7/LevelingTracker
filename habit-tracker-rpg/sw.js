const CACHE = 'sao-quests-v2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('./mobile.html')));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // Network-first: always load latest when online, fall back to cache when offline
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put('./mobile.html', clone));
          return r;
        })
        .catch(() => caches.match('./mobile.html'))
    );
  }
});
