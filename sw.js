// Service Worker — 离线缓存 + Push 通知
const CACHE = "xiaoke-v1";
const URLS = [
  "/",
  "/index.html",
  "/chat.html",
  "/dashboard.html",
  "/reader.html",
  "/stickers.html",
  "/gokomu.html",
  "/persona.html",
  "/css/app.css",
  "/js/app.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});

// Push 通知
self.addEventListener("push", (e) => {
  const data = e.data?.json() || { title: "小克想你啦", body: "来看看我吧~" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png"
    })
  );
});
