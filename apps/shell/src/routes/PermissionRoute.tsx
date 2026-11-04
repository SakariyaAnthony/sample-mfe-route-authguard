import { Outlet } from 'react-router-dom';
import type { Permission } from '@bank/shared';
import { useAuth } from '../auth/AuthContext';
import Forbidden from '../pages/Forbidden';

export function PermissionRoute({ permission }: { permission: Permission }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <Forbidden permission={permission} />;
  }
  return <Outlet />;
}
