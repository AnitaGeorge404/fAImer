import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  quality?: number;
  className?: string;
  fallbackSrc?: string;
  onLoadingComplete?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  sizes = '100vw',
  priority = false,
  placeholder = 'skeleton',
  quality = 75,
  className,
  fallbackSrc,
  onLoadingComplete,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  // Generate WebP and fallback sources
  const getImageSources = (imageSrc: string) => {
    const isAbsolute = imageSrc.startsWith('http') || imageSrc.startsWith('/');
    const basePath = isAbsolute ? imageSrc : `/src/assets/${imageSrc}`;
    
    // Convert extension to WebP if it's a common format
    const webpSrc = basePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    return {
      webp: webpSrc,
      fallback: basePath
    };
  };

  const { webp, fallback } = getImageSources(currentSrc);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoadingComplete?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.();
    }
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(width => `${baseSrc}?w=${width}&q=${quality} ${width}w`)
      .join(', ');
  };

  const renderPlaceholder = () => {
    if (placeholder === 'skeleton') {
      return (
        <Skeleton 
          className={cn('w-full h-full absolute inset-0', className)} 
          {...props}
        />
      );
    }
    return null;
  };

  const renderImage = () => {
    if (!isInView) {
      return renderPlaceholder();
    }

    return (
      <>
        {isLoading && placeholder !== 'none' && renderPlaceholder()}
        
        <picture>
          {/* WebP source for modern browsers */}
          <source
            srcSet={generateSrcSet(webp)}
            sizes={sizes}
            type="image/webp"
          />
          
          {/* Fallback for older browsers */}
          <img
            ref={imgRef}
            src={fallback}
            srcSet={generateSrcSet(fallback)}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
              className
            )}
            style={{
              filter: isLoading && placeholder === 'blur' ? 'blur(5px)' : 'none',
            }}
            {...props}
          />
        </picture>
      </>
    );
  };

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground text-sm',
          className
        )}
        {...props}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div className="relative">
      {renderImage()}
    </div>
  );
};