import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  authStore,
  notify,
  useSession,
  AUTH_FORBIDDEN_EVENT,
  AUTH_LOGOUT_EVENT,
  type Permission,
  type User,
} from '@bank/shared';
import { authService } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fired by the shared axios interceptor on any 401, from the shell or a remote.
  // The interceptor has already cleared the session, so ProtectedRoute does the
  // redirect; here the cache is dropped so the next user never sees this user's data.
  useEffect(() => {
    const onForcedLogout = () => queryClient.clear();
    window.addEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
  }, [queryClient]);

  // A 403 behind a route the UI allowed means the server-side permissions
  // differ from the ones cached in this session.
  useEffect(() => {
    const onForbidden = () =>
      notify('Access was denied. Your permissions may have changed; sign in again to refresh them.', 'warning');
    window.addEventListener(AUTH_FORBIDDEN_EVENT, onForbidden);
    return () => window.removeEventListener(AUTH_FORBIDDEN_EVENT, onForbidden);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const session = await authService.login(username, password);
    authStore.setSession(session);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    authStore.clear();
    queryClient.clear();
    navigate('/login', { replace: true });
  }, [navigate, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      hasPermission: (permission) => Boolean(user?.permissions.includes(permission)),
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/** For components rendered behind ProtectedRoute, where a user always exists. */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser must be used behind <ProtectedRoute>');
  return user;
}
