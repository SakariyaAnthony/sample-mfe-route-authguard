import { Suspense, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary, Loader } from '@bank/shared';
import { Constants, useI18n } from '../i18n';

interface RemoteBoundaryProps {
  name: string;
  children: ReactNode;
}

export function RemoteBoundary({ name, children }: RemoteBoundaryProps) {
  const { pathname } = useLocation();
  const { tFormat } = useI18n();

  return (
    <ErrorBoundary name={name} resetKey={pathname}>
      <Suspense
        fallback={
          <Loader
            text={tFormat(Constants.loadingModuleKey, Constants.loadingModule, { name })}
          />
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
