import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Configure for Vercel deployment with external API
  images: {
    remotePatterns: [
      // Development configuration
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7065',
        pathname: '/uploads/**',
      },
      // Production configuration - your cloud API domain
      {
        protocol: 'https',
        hostname: 'eennback-002-site1.atempurl.com',
        pathname: '/uploads/**',
      },
      // Fallback for other HTTPS domains
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/uploads/**',
      },
    ],
  },
  // Add headers for CORS handling with external API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'eennback-002-site1.atempurl.com',
        'localhost:7065'
      ],
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
