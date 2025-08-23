const CACHE_NAME = "project-kisan-v1";
const urlsToCache = ["/", "/manifest.json", "/favicon.ico"];

self.addEventListener("install", function (event) {
  console.log("Service worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log("Opened cache");
        return cache.addAll(
          urlsToCache.filter(
            (url) =>
              url !== "/static/js/bundle.js" && url !== "/static/css/main.css"
          )
        );
      })
      .catch(function (error) {
        console.log("Cache addAll failed:", error);
      })
  );
});

self.addEventListener("fetch", function (event) {
  // Skip cache for development server requests
  if (
    event.request.url.includes("localhost") &&
    (event.request.url.includes("@vite") ||
      event.request.url.includes("node_modules") ||
      event.request.url.includes(".tsx") ||
      event.request.url.includes(".ts") ||
      event.request.url.includes("hot"))
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(function (error) {
        console.log("Fetch failed:", error);
        // Return a fallback response or handle the error gracefully
        return new Response("Network error occurred", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        });
      });
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
