/* Replaced with the complete emitted asset inventory by the Vite build plugin. */
const VERSION = "6515f2db058722b2";
const PREFIX = "armadillo-impact-";
const CACHE = PREFIX + VERSION;
const PRECACHE = ["./assets/Game-Obi9Z-ef.js","./assets/barlow-condensed-latin-600-normal-BFJEwTuo.woff","./assets/barlow-condensed-latin-600-normal-DepVgxBB.woff2","./assets/barlow-condensed-latin-800-normal-BKzMuPgK.woff2","./assets/barlow-condensed-latin-800-normal-e9GbPXiK.woff","./assets/dm-sans-latin-400-normal-BwCSEQnW.woff","./assets/dm-sans-latin-400-normal-CW0RaeGs.woff2","./assets/dm-sans-latin-500-normal-B9HHJjqV.woff2","./assets/dm-sans-latin-500-normal-Dr3UlScf.woff","./assets/index-C1_bpVws.css","./assets/index-Dc-6-q8A.js","./assets/rapier-Cb-UVTKY.js","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable.png","./icons/icon.svg","./index.html","./manifest.json"];
const absolute = (path) => new URL(path, self.registration.scope).href;

self.addEventListener("install", (event) => {
  // A failed asset download aborts installation, preserving the last good version.
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map(absolute))),
  );
  // Do not skipWaiting: active matches keep their version until all tabs close.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(PREFIX) && name !== CACHE)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      // One coherent build serves navigation as well as versioned JS/WASM assets.
      if (request.mode === "navigate") {
        const shell = await cache.match(absolute("./index.html"));
        if (shell) return shell;
        try {
          return await fetch(request);
        } catch {
          return new Response(
            "The game has not finished downloading. Reconnect and reload once.",
            {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            },
          );
        }
      }
      // Static same-origin build assets are invariant; preview/CDN Vary: Origin must
      // not distinguish precache fetches from module/CSS requests during offline boot.
      const cached = await cache.match(request, {
        ignoreSearch: true,
        ignoreVary: true,
      });
      if (cached) return cached;
      return fetch(request);
    })(),
  );
});
