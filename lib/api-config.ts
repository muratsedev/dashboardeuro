/**
 * Get the base API URL with smart fallback logic
 * - Browser: returns '' so all /api/* calls go through the Next.js proxy (avoids CORS)
 * - Server: returns the configured URL for direct server-to-server calls
 */
export function getApiUrl(): string {
  // On the client side, use relative URLs so the Next.js rewrite proxy handles the request.
  // This eliminates cross-origin (CORS) failures when the API is on a different domain.
  if (typeof window !== 'undefined') {
    return '';
  }

  // Server-side: call the external API directly (no CORS restrictions).
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return 'https://euronews-001-site1.stempurl.com';
}

/**
 * Get the full API endpoint URL
 * @param path - API path (e.g., '/api/Articles')
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
