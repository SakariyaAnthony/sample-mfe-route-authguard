import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { LoginLocationState } from '../pages/Login';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const state: LoginLocationState = { from: location };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}
