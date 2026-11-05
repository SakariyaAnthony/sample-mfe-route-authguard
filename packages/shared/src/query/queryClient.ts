import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import type { ApiError } from '../api/ApiError';
import { getUserMessage, reportError } from '../errors/errorService';
import { notify } from '../ui/uiStore';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

const MAX_RETRIES = 2;

// Expected outcomes the user can act on, not faults worth reporting.
const isExpected = (error: ApiError): boolean => error.kind === 'unauthorized' || error.kind === 'validation';

// 4xx responses (bad input, 401, 403, 404) will not succeed on a retry.
const shouldRetry = (failureCount: number, error: ApiError): boolean =>
  failureCount < MAX_RETRIES && (error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server');

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!isExpected(error)) reportError(error, { source: 'query', extra: { queryKey: query.queryKey } });
        // A first load already shows an inline ErrorAlert. A failed background
        // refetch keeps the old data on screen, so only a toast tells the user.
        if (query.state.data !== undefined && error.kind !== 'unauthorized') {
          notify(`Could not refresh data: ${getUserMessage(error)}`, 'danger');
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!isExpected(error)) {
          reportError(error, { source: 'mutation', extra: { mutationKey: mutation.options.mutationKey } });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
