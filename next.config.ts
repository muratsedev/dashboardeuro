import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // For Firebase Hosting - disable static export due to client components with dynamic routes
  images: {
    remotePatterns: [
      // Development configuration
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7065',
        pathname: '/uploads/**',
      },
      // Production configuration - add your production API domain here
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains for flexibility
        pathname: '/uploads/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXT_PUBLIC_API_URL?.replace('https://', '') || '']
        : ['localhost:7065'],
    },
    // Enable faster builds and better caching
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Performance optimizations
  poweredByHeader: false,
  // Configure webpack for better performance
  webpack: (config, { isServer, dev }) => {
    // Optimize for development performance
    if (!isServer) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        // Store cache in a temp directory to improve performance
        cacheDirectory: path.join(process.cwd(), '.next/cache/webpack'),
      };
      
      // Reduce filesystem polling in development
      if (dev) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
          ignored: /node_modules/,
        };
      }
    }
    
    // General optimizations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    return config;
  },
};

export default nextConfig;
