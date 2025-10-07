// Development utilities for testing PWA functionality
// Only use these in development/testing

export async function testOfflineCapability() {
  if (process.env.NODE_ENV !== "development") {
    console.warn("PWA test utilities should only be used in development");
    return;
  }

  console.log("Testing PWA offline capability...");

  try {
    // Test if service worker is registered
    const registration = await navigator.serviceWorker.getRegistration();
    console.log(
      "Service Worker Status:",
      registration ? "Registered" : "Not registered"
    );

    // Test cache status
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      console.log("Available caches:", cacheNames);

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        console.log(`Cache "${cacheName}" contains ${keys.length} items`);
      }
    }

    // Test critical assets availability
    const criticalAssets = [
      "/",
      "/manifest.json",
      "/assets/quick-crop-wise.png",
      "/lovable-uploads/852b0cb2-1c40-4d2d-9582-b65109704e1a.png",
    ];

    console.log("Testing critical asset availability...");
    for (const asset of criticalAssets) {
      try {
        const response = await fetch(asset);
        console.log(`✅ ${asset}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`❌ ${asset}: Failed to fetch`);
      }
    }
  } catch (error) {
    console.error("PWA test failed:", error);
  }
}

export function simulateOffline() {
  if (process.env.NODE_ENV !== "development") {
    console.warn("PWA test utilities should only be used in development");
    return;
  }

  console.log("Simulating offline mode...");

  // Override fetch to simulate network failure
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    console.log("Fetch blocked (simulated offline):", args[0]);
    throw new Error("Simulated network failure");
  };

  // Restore after 10 seconds
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log("Network simulation restored");
  }, 10000);
}

// Call this in development console to test PWA
(window as any).testPWA = testOfflineCapability;
(window as any).simulateOffline = simulateOffline;
