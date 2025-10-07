import { useEffect } from 'react';

interface PreloadImage {
  src: string;
  priority?: 'high' | 'low';
}

export const useImagePreloader = (images: PreloadImage[]) => {
  useEffect(() => {
    const preloadImage = (src: string, priority: 'high' | 'low' = 'low') => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    };

    const cleanups: (() => void)[] = [];

    images.forEach(({ src, priority }) => {
      const cleanup = preloadImage(src, priority);
      cleanups.push(cleanup);
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [images]);
};

export const preloadCriticalImages = (imageSrcs: string[]) => {
  imageSrcs.forEach(src => {
    const img = new Image();
    img.loading = 'eager';
    img.src = src;
  });
};