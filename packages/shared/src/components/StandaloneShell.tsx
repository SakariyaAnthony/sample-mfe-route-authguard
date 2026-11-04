import { useState, type ReactNode } from 'react';
import { httpClient } from '../api/httpClient';
import { toApiError } from '../api/ApiError';
import { authStore } from '../auth/authStore';
import type { Session, User } from '../types/banking';

interface StandaloneShellProps {
  moduleName: string;
  children: ReactNode;
}

/**
 * Only used by a remote's own main.tsx when it is opened directly on its port.
 * Lets a team run their module in isolation with a quick dev login.
 */
export function StandaloneShell({ moduleName, children }: StandaloneShellProps) {
  const [user, setUser] = useState<User | null>(authStore.getUser());
  const [error, setError] = useState<string | null>(null);

  const devLogin = async () => {
    try {
      const { data } = await httpClient.post<Session>('/auth/login', { username: 'john', password: '1234' });
      authStore.setSession(data);
      setUser(data.user);
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  return (
    <div className="container py-4">
      <div className="alert alert-info d-flex justify-content-between align-items-center">
        <span>
          <strong>{moduleName}</strong> micro-frontend running standalone.
          {user ? ` Signed in as ${user.name}.` : ' Not signed in.'}
        </span>
        {!user && (
          <button type="button" className="btn btn-sm btn-primary" onClick={devLogin}>
            Dev login (john)
          </button>
        )}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {user && children}
    </div>
  );
}
