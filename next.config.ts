// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  images: {
    domains: [], // Add any external domains you need
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Responsive sizes
    imageSizes: [16, 32, 64, 96, 128, 256], // Smaller sizes for icons, etc.
    formats: ['image/webp'], // Enable WebP format for better compression
    minimumCacheTTL: 60, // Cache optimized images (in seconds)
    dangerouslyAllowSVG: true, // Allow SVG if needed
    contentDispositionType: 'attachment', // Security feature to prevent hotlinking
  },
  
  // Add rewrites for sitemap and robots.txt
  rewrites: async () => {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots.txt',
      },
    ];
  },
};

export default nextConfig;