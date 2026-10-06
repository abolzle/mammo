const SHELL = "mammo-shell-v1";
const CONTENT = "mammo-content-v1";

const PRECACHE = [
  "/",
  "/learn/",
  "/practice/",
  "/progress/",
  "/session/",
  "/about/",
  "/requirements/",
  "/sources/",
  "/settings/",
  "/reference/",
  "/content/catalog.json",
  "/content/curriculum.json",
  "/content/sources.json",
  "/content/evidence.json",
  "/content/coverage.json",
  "/content/modules/mqsa.json",
  "/assets/mqsa/mlo-label-regions.svg",
  "/assets/mqsa/unit-components.svg",
  "/assets/mqsa/results-timeline.svg",
  "/assets/mqsa/density-categories.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL && k !== CONTENT)
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/content/") || url.pathname.startsWith("/assets/")) {
    event.respondWith(networkFirst(req, CONTENT));
    return;
  }

  event.respondWith(cacheFirst(req, SHELL));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return new Response("Offline and not cached", { status: 503, statusText: "Offline" });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    return new Response("Offline and not cached", { status: 503 });
  }
}
