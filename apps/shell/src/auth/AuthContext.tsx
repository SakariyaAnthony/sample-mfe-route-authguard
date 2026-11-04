import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore, AUTH_LOGOUT_EVENT, type Permission, type User } from '@bank/shared';
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
  const [user, setUser] = useState<User | null>(() => (authStore.isAuthenticated() ? authStore.getUser() : null));
  const navigate = useNavigate();

  // Fired by the shared axios interceptor on any 401, from the shell or a remote.
  useEffect(() => {
    const onForcedLogout = (event: WindowEventMap[typeof AUTH_LOGOUT_EVENT]) => {
      setUser(null);
      navigate('/login', { replace: true, state: { reason: event.detail.reason } });
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
  }, [navigate]);

  const login = useCallback(async (username: string, password: string) => {
    const session = await authService.login(username, password);
    authStore.setSession(session);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    authStore.clear();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

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
