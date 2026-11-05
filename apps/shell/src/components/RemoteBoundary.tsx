import { Suspense, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary, Loader } from '@bank/shared';

interface RemoteBoundaryProps {
  name: string;
  children: ReactNode;
}

export function RemoteBoundary({ name, children }: RemoteBoundaryProps) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary name={name} resetKey={pathname}>
      <Suspense fallback={<Loader text={`Loading ${name} module...`} />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
