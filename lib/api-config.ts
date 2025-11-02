/**
 * Get the base API URL with smart fallback logic
 * Priority:
 * 1. Environment variable NEXT_PUBLIC_API_URL
 * 2. Production API if deployed (not localhost)
 * 3. Local development API (localhost:7065)
 */
export function getApiUrl(): string {
  // If environment variable is explicitly set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // If running in browser and not on localhost, assume production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.warn('⚠️ NEXT_PUBLIC_API_URL not set in environment variables, using production fallback');
    return 'https://eennback-002-site1.atempurl.com';
  }
  
  // Default to localhost for local development
  return 'https://localhost:7065';
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
