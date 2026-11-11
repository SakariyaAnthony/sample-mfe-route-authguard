import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authStore, createQueryClient, isCancel, reportError, setErrorReporter } from '@bank/shared';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { AuthProvider } from './auth/AuthContext';
import { loadLabels, restoreLocaleFromStorage } from './i18n';
import { initTheme } from './theme';
import App from './App';
import './theme/theme.css';

initTheme();

// Restore locale (en/ar) + document dir before first paint; labels are hardcoded for now.
restoreLocaleFromStorage();
void loadLabels().catch(() => {});

// Every bundle (shell and remotes) reports through this one reporter.
// Swap the body for Sentry, Datadog, or a POST to a logging endpoint.
setErrorReporter(({ error, source, module, extra, timestamp }) => {
  console.groupCollapsed(`%c[error] ${module ?? 'shell'} / ${source}`, 'color: #dc3545');
  console.error(error);
  console.info({ timestamp, route: window.location.pathname, userId: authStore.getUser()?.id, ...extra });
  console.groupEnd();
});

// Errors thrown outside React rendering (event handlers, timers, unawaited promises).
// React 18 dev builds also dispatch render errors here before the error boundary
// sees them; deferring lets the boundary report first, with its module name.
window.addEventListener('error', (event) => {
  const error = event.error ?? event.message;
  setTimeout(() => reportError(error, { source: 'window', extra: { filename: event.filename, line: event.lineno } }));
});
window.addEventListener('unhandledrejection', (event) => {
  if (isCancel(event.reason)) return;
  reportError(event.reason, { source: 'window', extra: { unhandledRejection: true } });
});

// The one cache for the whole app. Remotes reach it through the shared
// @tanstack/react-query singleton, so they never create their own.
const queryClient = createQueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
