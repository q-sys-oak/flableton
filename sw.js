/*
 * Offline: the app opens with no signal once it has been opened online. Pages always ask the network
 * first (so an update shows at once) and use the saved copy only when offline; the build's files have
 * their version in their names, so a saved one is never stale. Nothing else is cached here.
 */
const CACHE = "barline-v1";
const SHELL = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // the cloud and anything else: straight to the network
  if (req.mode === "navigate") {
    // network first, so a new version shows at once; the saved page only when offline
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./", copy)); return res; }).catch(() => caches.match("./")));
    return;
  }
  if (url.pathname.includes("/assets/")) {
    // versioned build files: saved once, used from then on
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })));
  }
});
