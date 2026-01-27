/**
 * Get the base API URL with smart fallback logic
 * Priority:
 * 1. Environment variable NEXT_PUBLIC_API_URL
 * 2. Production cloud API (default)
 */
export function getApiUrl(): string {
  // If environment variable is explicitly set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default to cloud production API
  return 'https://eennback-002-site1.atempurl.com';
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
