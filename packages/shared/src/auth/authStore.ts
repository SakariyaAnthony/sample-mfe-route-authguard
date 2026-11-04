import type { Permission, Session, User } from '../types/banking';

// Plain storage-backed store (no React context) so the host and every remote,
// each with its own bundle, read the same session.
const TOKEN_KEY = 'rib.token';
const USER_KEY = 'rib.user';

export const AUTH_LOGOUT_EVENT = 'auth:logout';

export interface AuthLogoutDetail {
  reason: 'expired';
}

declare global {
  interface WindowEventMap {
    [AUTH_LOGOUT_EVENT]: CustomEvent<AuthLogoutDetail>;
  }
}

export const authStore = {
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const raw = sessionStorage.getItem(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  setSession({ token, user }: Pick<Session, 'token' | 'user'>): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getUser());
  },

  hasPermission(permission: Permission): boolean {
    return Boolean(this.getUser()?.permissions.includes(permission));
  },
};
