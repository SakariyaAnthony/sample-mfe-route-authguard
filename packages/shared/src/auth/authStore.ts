import { useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { createGlobalStore } from '../store/createGlobalStore';
import type { Permission, Session, User } from '../types/banking';

export const AUTH_LOGOUT_EVENT = 'auth:logout';

export const AUTH_FORBIDDEN_EVENT = 'auth:forbidden';

export interface AuthLogoutDetail {
  reason: 'expired';
}

export interface AuthForbiddenDetail {
  message: string;
  url?: string;
}

declare global {
  interface WindowEventMap {
    [AUTH_LOGOUT_EVENT]: CustomEvent<AuthLogoutDetail>;
    [AUTH_FORBIDDEN_EVENT]: CustomEvent<AuthForbiddenDetail>;
  }
}

type LogoutReason = AuthLogoutDetail['reason'];

interface SessionState {
  token: string | null;
  user: User | null;
  /** Why the last session ended, so the login redirect can explain it. */
  logoutReason: LogoutReason | null;
}

const EMPTY_SESSION: SessionState = { token: null, user: null, logoutReason: null };

const sessionStore = createGlobalStore('session', () =>
  createStore<SessionState>()(
    persist(() => EMPTY_SESSION, {
      name: 'rib.session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ token, user }) => ({ token, user }),
    }),
  ),
);

/** Imperative access for non-React code (axios interceptors, event handlers). */
export const authStore = {
  getToken(): string | null {
    return sessionStore.getState().token;
  },

  getUser(): User | null {
    return sessionStore.getState().user;
  },

  getLogoutReason(): LogoutReason | null {
    return sessionStore.getState().logoutReason;
  },

  setSession({ token, user }: Pick<Session, 'token' | 'user'>): void {
    sessionStore.setState({ token, user, logoutReason: null });
  },

  clear(reason: LogoutReason | null = null): void {
    sessionStore.setState({ ...EMPTY_SESSION, logoutReason: reason });
  },

  isAuthenticated(): boolean {
    const { token, user } = sessionStore.getState();
    return Boolean(token && user);
  },

  hasPermission(permission: Permission): boolean {
    return Boolean(sessionStore.getState().user?.permissions.includes(permission));
  },
};

/** Current user, or null when signed out. Re-renders when the session changes. */
export function useSession(): User | null {
  return useStore(sessionStore, (state) => (state.token ? state.user : null));
}

export function useHasPermission(permission: Permission): boolean {
  return useStore(sessionStore, (state) => Boolean(state.user?.permissions.includes(permission)));
}
