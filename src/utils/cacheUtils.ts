// Utility functions for managing PWA cache

export async function warmCache() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service workers not supported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    console.log("Service worker ready, cache is warmed");

    // Send message to service worker if needed
    if (registration.active) {
      registration.active.postMessage({ type: "WARM_CACHE" });
    }
  } catch (error) {
    console.error("Failed to warm cache:", error);
  }
}

export async function clearCache() {
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log("All caches cleared");
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }
}

export async function getCacheStatus() {
  if (!("caches" in window)) {
    return { supported: false, caches: [] };
  }

  try {
    const cacheNames = await caches.keys();
    const cacheStatus = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return { name, size: keys.length };
      })
    );

    return { supported: true, caches: cacheStatus };
  } catch (error) {
    console.error("Failed to get cache status:", error);
    return { supported: true, caches: [] };
  }
}

export function preloadCriticalAssets() {
  const criticalAssets = [
    "/assets/quick-crop-wise.png",
    "/assets/quick-mapping.png",
    "/assets/quick-seeding.png",
    "/lovable-uploads/852b0cb2-1c40-4d2d-9582-b65109704e1a.png",
  ];

  criticalAssets.forEach((asset) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = asset;
    document.head.appendChild(link);
  });
}
