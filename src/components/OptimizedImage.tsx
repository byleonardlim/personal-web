import React, { useState } from 'react';
import Image from 'next/image';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Process image source to ensure proper path handling
 */
const processImageSrc = (sourcePath: string): string => {
  // Handle remote images (http or https)
  if (sourcePath.startsWith('http://') || sourcePath.startsWith('https://')) {
    return sourcePath;
  }
  
  // Clean up local paths
  let processedPath = sourcePath;
  
  // Ensure path starts with a slash and remove any public prefix
  processedPath = processedPath.replace(/^\/public\//, '/').replace(/^public\//, '/');
  
  // Add leading slash if missing
  if (!processedPath.startsWith('/')) {
    processedPath = '/' + processedPath;
  }
  
  // Remove any trailing slashes
  processedPath = processedPath.replace(/\/+$/, '');
  
  return processedPath;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 1200,
  height = 630,
  priority = false,
  className = '',
  objectFit = 'cover'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const processedSrc = processImageSrc(src);
  
  return (
    <div className="relative w-full h-auto">
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-md" />
      )}
      
      {/* Error state */}
      {hasError ? (
        <div className="bg-white rounded-md px-8 py-16 shadow-lg text-center min-h-[200px] flex flex-col items-center justify-center">
          <div className="text-sm text-gray-500">
            <div className="mb-2 font-medium">Image not available</div>
            <div className="text-xs opacity-75">Original path: {src}</div>
          </div>
        </div>
      ) : (
        // Optimized image with Next.js Image component
        <div className={`relative overflow-hidden rounded-md ${className}`}>
          <Image
            src={processedSrc}
            alt={alt || 'Case study image'}
            width={width}
            height={height}
            priority={priority}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{ 
              objectFit,
              width: '100%', 
              height: 'auto',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out' 
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 1200px"
            className="rounded-md"
          />
        </div>
      )}
    </div>
  );
};