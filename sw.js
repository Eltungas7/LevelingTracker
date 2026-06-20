const CACHE = 'sao-quests-v9';

const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './data/classes.js',
  './data/dungeons.js',
  './data/items.js',
  './data/recipes.js',
  './data/achievements.js',
  './data/content.js',
  './data/events.js',
  './data/shop.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES_TO_CACHE)));
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
  const url = new URL(e.request.url);
  const isAppFile = FILES_TO_CACHE.some(f => url.pathname.endsWith(f.replace('./', '/')));
  const isLeahImg = url.pathname.includes('/img/Leah/');
  if (e.request.mode === 'navigate' || isAppFile || isLeahImg) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  }
});

// ── NOTIFICATION SCHEDULING ───────────────────────────────────────
// Stores active setTimeout handles keyed by notification id
const _notifTimers = {};

self.addEventListener('message', event => {
  const { type, notifications } = event.data || {};

  if (type === 'SCHEDULE_NOTIFICATIONS') {
    // Cancel any pending timers
    Object.values(_notifTimers).forEach(t => clearTimeout(t));
    Object.keys(_notifTimers).forEach(k => delete _notifTimers[k]);

    (notifications || []).forEach(n => {
      const delay = Math.round(n.delayMs);
      if (delay < 0 || delay > 86400000) return; // skip past or >24h
      _notifTimers[n.id] = setTimeout(() => {
        self.registration.showNotification(n.title, {
          body:     n.body,
          icon:     './icon.svg',
          badge:    './icon.svg',
          tag:      n.id,
          renotify: true,
          vibrate:  [200, 100, 200],
          data:     { url: './index.html' }
        });
        delete _notifTimers[n.id];
      }, delay);
    });
  }

  if (type === 'CLEAR_NOTIFICATIONS') {
    Object.values(_notifTimers).forEach(t => clearTimeout(t));
    Object.keys(_notifTimers).forEach(k => delete _notifTimers[k]);
  }
});

// Open / focus the app when a notification is tapped
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('index.html') && 'focus' in c) return c.focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});
