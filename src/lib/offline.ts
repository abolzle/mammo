export const SW_CACHE = "mammo-shell-v1";
export const SW_CONTENT_CACHE = "mammo-content-v1";

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch {
    // Offline support is best-effort in unsupported browsers.
  }
}

export async function cachedUrls(): Promise<string[]> {
  if (typeof caches === "undefined") return [];
  const names = await caches.keys();
  const urls: string[] = [];
  for (const name of names) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    for (const req of keys) urls.push(req.url);
  }
  return [...new Set(urls)].sort();
}

export async function updateServiceWorker() {
  const reg = await navigator.serviceWorker.getRegistration();
  await reg?.update();
  return Boolean(reg);
}
