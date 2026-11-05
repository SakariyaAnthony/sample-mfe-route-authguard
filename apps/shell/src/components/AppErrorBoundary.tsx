import type { ReactNode } from 'react';
import { ErrorBoundary } from '@bank/shared';

/** Last line of defence: replaces a white screen when the shell itself fails to render. */
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Shell"
      fallback={() => (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="card shadow-sm" style={{ maxWidth: 440 }}>
            <div className="card-body p-4 text-center">
              <h4 className="mb-2">Something went wrong</h4>
              <p className="text-secondary mb-4">
                The application hit an unexpected error. Reloading usually fixes it. Your session is kept.
              </p>
              <button type="button" className="btn btn-primary me-2" onClick={() => window.location.reload()}>
                Reload
              </button>
              <a href="/dashboard" className="btn btn-outline-secondary">
                Go to dashboard
              </a>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
