export const SW_CACHE = "mammo-shell-v2";
export const SW_CONTENT_CACHE = "mammo-content-v2";

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  // The dev server rewrites JS and CSS on every request. A cache-first worker
  // serves a stale shell and drops ?id= on /session/, so the player renders blank.
  if (process.env.NODE_ENV !== "production") {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      // Leaving a dev worker in place is annoying, not fatal.
    }
    return;
  }
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
