import { useEffect } from "react";
import { preloadCriticalAssets, warmCache } from "../utils/cacheUtils";

export function CachePreloader() {
  useEffect(() => {
    // Preload critical assets immediately
    preloadCriticalAssets();

    // Warm the cache when the service worker is ready
    warmCache();
  }, []);

  // This component doesn't render anything
  return null;
}
