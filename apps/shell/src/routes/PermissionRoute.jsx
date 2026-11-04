import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Forbidden from '../pages/Forbidden';

export function PermissionRoute({ permission }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <Forbidden permission={permission} />;
  }
  return <Outlet />;
}
