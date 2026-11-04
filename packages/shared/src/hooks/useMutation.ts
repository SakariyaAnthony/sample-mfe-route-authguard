import { useCallback, useState } from 'react';
import { toApiError, type ApiError } from '../api/ApiError';

/**
 * For POST / PATCH / DELETE calls triggered by the user.
 * `mutate` resolves with the response data, or rejects with an ApiError so the
 * caller can react (e.g. navigate on success).
 */
export function useMutation<TArgs extends unknown[], TResult>(request: (...args: TArgs) => Promise<TResult>) {
  const [state, setState] = useState<{ loading: boolean; error: ApiError | null }>({ loading: false, error: null });

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setState({ loading: true, error: null });
      try {
        const data = await request(...args);
        setState({ loading: false, error: null });
        return data;
      } catch (error) {
        const apiError = toApiError(error);
        setState({ loading: false, error: apiError });
        throw apiError;
      }
    },
    [request],
  );

  const reset = useCallback(() => setState({ loading: false, error: null }), []);

  return { ...state, mutate, reset };
}
