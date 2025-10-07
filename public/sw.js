const CACHE_NAME = "faimer-v4";
const ASSETS_CACHE = "faimer-assets-v4";
const API_CACHE = "faimer-api-v4";
const MODEL_CACHE = "faimer-models-v4";

// Essential files for offline functionality
const urlsToCache = ["/", "/manifest.json", "/favicon.ico", "/placeholder.svg"];

// All image assets for farming features
const assetsToCache = [
  // Main app assets
  "/assets/crop-disease.jpg",
  "/assets/irrigation-tips.jpg",
  "/assets/market-update.jpg",
  "/assets/pest-control.jpg",
  "/assets/quick-crop-wise.png",
  "/assets/quick-mapping.png",
  "/assets/quick-seeding.png",
  "/assets/weather-drought-alert.jpg",
  "/assets/weather-storm-alert.jpg",

  // PWA icons and images
  "/lovable-uploads/852b0cb2-1c40-4d2d-9582-b65109704e1a.png",
  "/lovable-uploads/00c4bc0c-067f-4b9e-bdb0-816ecd25ad76.png",
  "/lovable-uploads/02d46ce4-171b-42cd-a9a3-686dbd10e8de.png",
  "/lovable-uploads/0978174b-ae5f-40db-bd58-07833d59465a.png",
  "/lovable-uploads/2836c528-e19c-4aaf-af8c-3a59c6bdbfde.png",
  "/lovable-uploads/33d82a5a-6adb-4fb2-a720-33afcbfb4f47.png",
  "/lovable-uploads/3f6b7ec9-3d85-4141-822f-70464f2c5be4.png",
  "/lovable-uploads/4cf4c0b1-effa-45dd-a1c2-b857aecd3957.png",
  "/lovable-uploads/5da1f9d1-e030-46f1-9d61-291928623066.png",
  "/lovable-uploads/60f927d7-a6b0-4944-bf34-9a7a5394d552.png",
  "/lovable-uploads/635dff41-e60d-46a3-b325-6bd5578cd7f1.png",
  "/lovable-uploads/7d161fd3-22d0-4b69-a7ef-8b8dd812a55b.png",
  "/lovable-uploads/7f72bec9-abf7-4827-8913-70dc3494457c.png",
  "/lovable-uploads/86b21139-1e5c-4315-b423-e9539e553332.png",
  "/lovable-uploads/87bc0776-6ff4-4209-a8b5-8b0c47dc938a.png",
  "/lovable-uploads/afdc9b1b-83d4-4fb1-be61-4f53c9ff0ad1.png",
  "/lovable-uploads/b68830df-4731-4efe-b233-08588e1334b3.png",
  "/lovable-uploads/ea1a065b-d883-4cf8-a40d-b8cfbccfed9f.png",
  "/lovable-uploads/f0dce081-a1df-47f4-9b51-31b86f69b3e4.png",
  "/lovable-uploads/f265217e-9457-499b-a32c-35f5b5c2b345.png",
  "/lovable-uploads/f2bb06a9-32a5-4aa1-bf76-447eb1fb0c64.png",
  "/lovable-uploads/f46a346c-43fa-4c4a-ac6d-c1652fe31702.png",
  "/lovable-uploads/f9697d94-aedf-499f-93d5-7bcfe3319ac7.png",
  "/lovable-uploads/fb9c0289-77d0-4856-9028-76b4f16989dd.png",
];

self.addEventListener("install", function (event) {
  console.log("Service worker installing...");
  event.waitUntil(
    Promise.all([
      // Cache essential files
      caches.open(CACHE_NAME).then(function (cache) {
        console.log("Caching essential files");
        return cache.addAll(urlsToCache);
      }),
      // Cache all assets
      caches.open(ASSETS_CACHE).then(function (cache) {
        console.log("Caching assets");
        return cache.addAll(assetsToCache).catch(function (error) {
          console.log("Some assets failed to cache, continuing:", error);
          // Cache assets individually to avoid failing on missing files
          return Promise.allSettled(
            assetsToCache.map((url) =>
              cache
                .add(url)
                .catch((e) => console.log(`Failed to cache ${url}:`, e))
            )
          );
        });
      }),
      // Initialize model cache
      caches.open(MODEL_CACHE).then(function (cache) {
        console.log("Model cache initialized");
        return Promise.resolve();
      }),
    ]).catch(function (error) {
      console.log("Cache setup failed:", error);
    })
  );
  // Force activation of the new service worker
  self.skipWaiting();
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // Skip cache for development server requests
  if (
    url.hostname === "localhost" &&
    (url.pathname.includes("@vite") ||
      url.pathname.includes("node_modules") ||
      url.pathname.includes(".tsx") ||
      url.pathname.includes(".ts") ||
      url.searchParams.has("t") || // Vite HMR timestamp
      url.pathname.includes("hot"))
  ) {
    return;
  }

  // Cache-first strategy for ML model files
  if (
    url.pathname.match(/\.(json|bin|wasm|onnx)$/) ||
    url.hostname.includes("huggingface.co") ||
    url.pathname.includes("/models/") ||
    url.pathname.includes("Xenova")
  ) {
    event.respondWith(
      caches.open(MODEL_CACHE).then(function (cache) {
        return cache.match(request).then(function (response) {
          if (response) {
            console.log("Serving model file from cache:", url.pathname);
            return response;
          }
          return fetch(request)
            .then(function (networkResponse) {
              if (networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                cache.put(request, responseClone);
                console.log("Cached model file:", url.pathname);
              }
              return networkResponse;
            })
            .catch(function (error) {
              console.log(
                "Network fetch failed for model file:",
                request.url,
                error
              );
              throw error;
            });
        });
      })
    );
    return;
  }

  // Cache-first strategy for images and static assets
  if (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/) ||
    url.pathname.includes("/assets/") ||
    url.pathname.includes("/lovable-uploads/")
  ) {
    event.respondWith(
      caches.match(request).then(function (response) {
        if (response) {
          return response;
        }
        return fetch(request)
          .then(function (networkResponse) {
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(ASSETS_CACHE).then(function (cache) {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(function (error) {
            console.log("Network fetch failed for asset:", request.url, error);
            // Return placeholder for missing images
            if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
              return caches.match("/placeholder.svg");
            }
            throw error;
          });
      })
    );
    return;
  }

  // Network-first strategy for JS, CSS, and other dynamic content
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) ||
    url.pathname.includes("/api/")
  ) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            const cacheToUse = url.pathname.includes("/api/")
              ? API_CACHE
              : CACHE_NAME;
            caches.open(cacheToUse).then(function (cache) {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(function (error) {
          console.log("Network fetch failed:", request.url, error);
          // Try to serve from cache as fallback
          return caches.match(request).then(function (cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }
            // For API requests, return a meaningful offline response
            if (url.pathname.includes("/api/")) {
              return new Response(
                JSON.stringify({
                  error: "Offline",
                  message: "This feature requires internet connection",
                }),
                {
                  status: 503,
                  headers: { "Content-Type": "application/json" },
                }
              );
            }
            throw error;
          });
        })
    );
    return;
  }

  // Cache-first strategy for navigation and other requests
  event.respondWith(
    caches.match(request).then(function (response) {
      if (response) {
        return response;
      }
      return fetch(request)
        .then(function (networkResponse) {
          // Cache successful navigation responses
          if (networkResponse.status === 200 && request.mode === "navigate") {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(function (error) {
          console.log("Fetch failed:", error);
          // Return cached homepage for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/").then(function (cachedHome) {
              if (cachedHome) {
                return cachedHome;
              }
              return new Response(
                `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>fAImer - Offline</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline { color: #666; }
                  </style>
                </head>
                <body>
                  <h1>fAImer</h1>
                  <p class="offline">You are currently offline. Please check your internet connection.</p>
                  <p>Cached content will be available when you return online.</p>
                </body>
              </html>
            `,
                {
                  status: 200,
                  headers: { "Content-Type": "text/html" },
                }
              );
            });
          }
          return new Response("Network error occurred", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          });
        });
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("Service worker activating...");
  const currentCaches = [CACHE_NAME, ASSETS_CACHE, API_CACHE, MODEL_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            // Delete old caches that aren't in our current cache list
            if (!currentCaches.includes(cacheName)) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service worker activated and ready to control pages");
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Background sync for when connection is restored
self.addEventListener("sync", function (event) {
  if (event.tag === "background-sync") {
    console.log("Background sync triggered");
    event.waitUntil(
      // You can add logic here to sync pending data when connection is restored
      Promise.resolve()
    );
  }
});

// Message handler for communication with the main thread
self.addEventListener("message", function (event) {
  console.log("Service worker received message:", event.data);

  if (event.data && event.data.type === "WARM_CACHE") {
    console.log("Warming cache on request");

    // Send confirmation back to main thread
    event.ports[0]?.postMessage({
      type: "CACHE_WARMED",
      message: "Cache warming completed",
    });
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Push notification support (if needed later)
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    console.log("Push notification received:", data);

    event.waitUntil(
      self.registration.showNotification(data.title || "fAImer", {
        body: data.body || "New update available",
        icon: "/lovable-uploads/852b0cb2-1c40-4d2d-9582-b65109704e1a.png",
        badge: "/lovable-uploads/852b0cb2-1c40-4d2d-9582-b65109704e1a.png",
        data: data,
      })
    );
  }
});
