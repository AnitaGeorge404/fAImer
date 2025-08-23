import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  lowQualitySrc?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  lowQualitySrc,
  alt,
  className,
  containerClassName,
  priority = false,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

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
        rootMargin: '100px',
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

  // Generate low quality placeholder
  const generateLowQualitySrc = (originalSrc: string) => {
    if (lowQualitySrc) return lowQualitySrc;
    
    // For demonstration, we'll just use a smaller version
    // In a real app, you'd generate actual low-quality versions
    return originalSrc + '?w=40&q=10';
  };

  const lqSrc = generateLowQualitySrc(src);

  return (
    <div 
      ref={imgRef}
      className={cn('relative overflow-hidden', containerClassName)}
    >
      {/* Low quality placeholder */}
      {isInView && lowQualitySrc && (
        <img
          src={lqSrc}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setLowQualityLoaded(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-0' : 'opacity-100',
            'filter blur-sm scale-105'
          )}
          aria-hidden="true"
        />
      )}

      {/* High quality image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}

      {/* Loading placeholder */}
      {!isInView && (
        <div 
          className={cn(
            'w-full h-full bg-muted animate-pulse',
            className
          )}
        />
      )}
    </div>
  );
};