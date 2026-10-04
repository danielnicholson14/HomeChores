// Saves the app on the iPad so it runs without Wi-Fi.
// Bump VERSION whenever you upload changed files.
var VERSION = 'choreboard-v2';
var FILES = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Serve the saved copy first; quietly refresh it when online.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSION).then(function (cache) {
      return cache.match(e.request, { ignoreSearch: true }).then(function (cached) {
        var network = fetch(e.request).then(function (res) {
          if (res && res.ok && res.type === 'basic') cache.put(e.request, res.clone());
          return res;
        }).catch(function () { return cached; });
        return cached || network;
      });
    })
  );
});
