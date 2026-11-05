import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../errors/errorService';

const CHUNK_LOAD_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk [\w-]+ failed/i,
  /remoteEntry/i,
];

/** True when code for a lazy route or remote could not be downloaded, as opposed to crashing while rendering. */
export const isChunkLoadError = (error: Error): boolean =>
  error.name === 'ChunkLoadError' || CHUNK_LOAD_PATTERNS.some((pattern) => pattern.test(error.message));

export interface ErrorFallbackProps {
  error: Error;
  name?: string;
  reset: () => void;
}

interface ErrorBoundaryProps {
  /** Module or area name, used in the fallback and in error reports. */
  name?: string;
  /** Clears a caught error when this value changes, e.g. the current pathname. */
  resetKey?: unknown;
  fallback?: (props: ErrorFallbackProps) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export function ErrorFallback({ error, name, reset }: ErrorFallbackProps) {
  if (isChunkLoadError(error)) {
    return (
      <div className="alert alert-warning" role="alert">
        <h5 className="alert-heading">{name ?? 'This module'} is temporarily unavailable</h5>
        <p className="mb-2">The module could not be loaded. The rest of the app keeps working.</p>
        {/* React.lazy caches the failed import, so only a reload fetches it again. */}
        <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="alert alert-danger" role="alert">
      <h5 className="alert-heading">Something went wrong{name ? ` in ${name}` : ''}</h5>
      <p className="mb-2">This section hit an unexpected error. You can try again or keep using the rest of the app.</p>
      <button type="button" className="btn btn-sm btn-outline-danger me-2" onClick={reset}>
        Try again
      </button>
      <button type="button" className="btn btn-sm btn-link" onClick={() => window.location.reload()}>
        Reload page
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, {
      source: 'boundary',
      module: this.props.name,
      extra: { componentStack: info.componentStack, chunkLoad: isChunkLoadError(error) },
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) this.reset();
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const { fallback = ErrorFallback, name } = this.props;
    return fallback({ error, name, reset: this.reset });
  }
}
