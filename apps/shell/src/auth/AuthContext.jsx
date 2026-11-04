import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore, AUTH_LOGOUT_EVENT } from '@bank/shared';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (authStore.isAuthenticated() ? authStore.getUser() : null));
  const navigate = useNavigate();

  // Fired by the shared axios interceptor on any 401, from the shell or a remote.
  useEffect(() => {
    const onForcedLogout = (event) => {
      setUser(null);
      navigate('/login', { replace: true, state: { reason: event.detail?.reason } });
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
  }, [navigate]);

  const login = useCallback(async (username, password) => {
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

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      hasPermission: (permission) => Boolean(user?.permissions?.includes(permission)),
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
