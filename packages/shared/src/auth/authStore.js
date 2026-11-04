// Plain storage-backed store (no React context) so the host and every remote,
// each with its own bundle, read the same session.
const TOKEN_KEY = 'rib.token';
const USER_KEY = 'rib.user';

export const AUTH_LOGOUT_EVENT = 'auth:logout';

export const authStore = {
  getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = sessionStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession({ token, user }) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  isAuthenticated() {
    return Boolean(this.getToken() && this.getUser());
  },

  hasPermission(permission) {
    return Boolean(this.getUser()?.permissions?.includes(permission));
  },
};
