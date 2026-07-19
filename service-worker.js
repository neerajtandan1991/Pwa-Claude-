/**
 * Service worker: cache-first app shell, so the app boots and functions
 * (including exports) with zero network connection after the first
 * successful load. Bump CACHE_VERSION whenever app files change to
 * force clients to pick up the new version.
 */

const CACHE_VERSION = "civil-estimator-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/boq-template.js",
  "./js/db.js",
  "./js/calc.js",
  "./js/camera.js",
  "./js/export.js",
  "./js/app.js",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png"
];

const CDN_ASSETS = [
  "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // App shell must succeed
      await cache.addAll(APP_SHELL);
      // CDN assets: best-effort (don't fail install if offline on first run)
      await Promise.all(
        CDN_ASSETS.map(async (url) => {
          try {
            const resp = await fetch(url, { mode: "cors" });
            if (resp.ok) await cache.put(url, resp);
          } catch (e) {
            console.warn("Could not pre-cache (will cache on first successful fetch):", url);
          }
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)));
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const resp = await fetch(req);
        if (resp && resp.ok && (req.url.startsWith(self.location.origin) || CDN_ASSETS.includes(req.url))) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(req, resp.clone());
        }
        return resp;
      } catch (e) {
        if (req.mode === "navigate") {
          const fallback = await caches.match("./index.html");
          if (fallback) return fallback;
        }
        throw e;
      }
    })()
  );
});
