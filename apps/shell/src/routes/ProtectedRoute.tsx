import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authStore } from '@bank/shared';
import { useAuth } from '../auth/AuthContext';
import type { LoginLocationState } from '../pages/Login';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const state: LoginLocationState = { from: location, reason: authStore.getLogoutReason() ?? undefined };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}
