// Dashboard auth helpers — JWT-based, replaces the old localStorage 'isLoggedIn' flag

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export function saveAuth(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Keep backwards-compat flag so existing layout guard still works
  localStorage.setItem('isLoggedIn', 'true');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('isLoggedIn');
}

/** Call this whenever an API responds with 401 — clears auth and redirects to login. */
export function handleUnauthorized() {
  clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function hasRole(...roles: string[]): boolean {
  const user = getAuthUser();
  if (!user) return false;
  return roles.includes(user.role);
}

export const Roles = {
  Admin: 'Admin',
  Editor: 'Editor',
  ProofReader: 'ProofReader',
  Publisher: 'Publisher',
} as const;
