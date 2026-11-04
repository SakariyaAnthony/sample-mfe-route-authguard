import { Component, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { Loader } from '@bank/shared';

interface BoundaryProps {
  name: string;
  children: ReactNode;
}

interface BoundaryState {
  error: Error | null;
}

class RemoteErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name}] micro-frontend failed to load`, error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="alert alert-warning">
        <h5 className="alert-heading">{this.props.name} is temporarily unavailable</h5>
        <p className="mb-2">
          The {this.props.name} module could not be loaded. The rest of the app keeps working.
        </p>
        <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}

export function RemoteBoundary({ name, children }: BoundaryProps) {
  return (
    <RemoteErrorBoundary name={name}>
      <Suspense fallback={<Loader text={`Loading ${name} module...`} />}>{children}</Suspense>
    </RemoteErrorBoundary>
  );
}
