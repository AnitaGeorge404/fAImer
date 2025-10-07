// Script to clear/unregister service workers - useful for debugging
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      console.log("Unregistering service worker:", registration);
      registration.unregister();
    }
    console.log("All service workers unregistered. Please refresh the page.");
  });
}

// Clear all caches
if ("caches" in window) {
  caches
    .keys()
    .then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          console.log("Deleting cache:", cacheName);
          return caches.delete(cacheName);
        })
      );
    })
    .then(function () {
      console.log("All caches cleared. Please refresh the page.");
    });
}
