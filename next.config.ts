import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Configure for Vercel deployment with external API
  // Ensure dynamic rendering for dashboard routes (no static export)
  // Removed transpilePackages for CKEditor to prevent build errors
  // Exclude CKEditor from server-side bundling
  serverExternalPackages: ['@ckeditor/ckeditor5-react', '@ckeditor/ckeditor5-build-classic'],
  // Add empty turbopack config to silence warnings
  turbopack: {},
  // Explicitly disable static export mode on all environments
  // This prevents Vercel or any CI from inferring `output: "export"`
  // which breaks dynamic routes in the dashboard.
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: [
        'euronews-001-site1.stempurl.com',
        'localhost:7065',
        'localhost:7066'
      ],
    },
  },
  webpack: (config, { isServer, dev }) => {
    // CKEditor compatibility fixes
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
        os: false,
        crypto: false,
      };
      
      // Optimize for development performance
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
    
    return config;
  },
  images: {
    // Unoptimized images for better compatibility with external API
    unoptimized: true,
    remotePatterns: [
      // Production/Cloud configuration
      {
        protocol: 'https',
        hostname: 'euronews-001-site2.stempurl.com',
        pathname: '/uploads/**',
      },
      // Development configuration - HTTPS (local)
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7066',
        pathname: '/uploads/**',
      },
      // Development configuration - HTTP (local fallback)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '7065',
        pathname: '/uploads/**',
      },
      // Production configuration - your cloud API domain
      {
        protocol: 'https',
        hostname: 'euronews-001-site2.stempurl.com',
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
  
  // Performance optimizations
  poweredByHeader: false,
};

export default nextConfig;
