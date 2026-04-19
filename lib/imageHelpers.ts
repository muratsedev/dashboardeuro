/**
 * Image helper utilities for dashboard
 * Handles image URL normalization and proxying for CORS avoidance
 */

import { getApiEndpoint } from './api-config';

/**
 * Normalize image URL to use proxy path when needed
 * Converts full backend image URLs to proxy through current API host
 * @param imagePath - Image path from backend (relative or absolute)
 * @returns Normalized URL for use in img src
 */
export function normalizeImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return '';
  
  // If it's a full URL to any known backend host, route through proxy.
  if (imagePath.includes('.stempurl.com/uploads/')) {
    const urlMatch = imagePath.match(/https?:\/\/[^/]+(\/.*)/);
    if (urlMatch) {
      const path = urlMatch[1];
      return `/backend-images${path}`;
    }
  }
  
  // If it's any other full URL, use it directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // For relative paths, use API endpoint
  return getApiEndpoint(`/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`);
}

/**
 * Get image source with proper normalization
 * Use this as the primary function for all img src attributes
 * @param imagePath - Image path from backend
 * @returns Ready-to-use image URL
 */
export function getImageSrc(imagePath: string | undefined): string {
  return normalizeImageUrl(imagePath);
}
