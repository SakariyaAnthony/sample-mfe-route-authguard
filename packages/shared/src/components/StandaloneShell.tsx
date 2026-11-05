import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { httpClient } from '../api/httpClient';
import { getUserMessage } from '../errors/errorService';
import { authStore, useSession } from '../auth/authStore';
import { createQueryClient } from '../query/queryClient';
import type { Session } from '../types/banking';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from './Toaster';

interface StandaloneShellProps {
  moduleName: string;
  children: ReactNode;
}

/**
 * Only used by a remote's own main.tsx when it is opened directly on its port.
 * Lets a team run their module in isolation with a quick dev login, and
 * provides what the real shell normally would (query cache, toasts).
 */
export function StandaloneShell({ moduleName, children }: StandaloneShellProps) {
  const [queryClient] = useState(createQueryClient);
  const user = useSession();
  const [error, setError] = useState<string | null>(null);

  const devLogin = async () => {
    try {
      const { data } = await httpClient.post<Session>('/auth/login', { username: 'john', password: '1234' });
      authStore.setSession(data);
    } catch (err) {
      setError(getUserMessage(err));
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
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
        {user && <ErrorBoundary name={moduleName}>{children}</ErrorBoundary>}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
