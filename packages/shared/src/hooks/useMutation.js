import { useCallback, useState } from 'react';

/**
 * For POST / PATCH / DELETE calls triggered by the user.
 * `mutate` resolves with the response data, or rejects with an ApiError so the
 * caller can react (e.g. navigate on success).
 */
export function useMutation(request) {
  const [state, setState] = useState({ loading: false, error: null });

  const mutate = useCallback(
    async (...args) => {
      setState({ loading: true, error: null });
      try {
        const data = await request(...args);
        setState({ loading: false, error: null });
        return data;
      } catch (error) {
        setState({ loading: false, error });
        throw error;
      }
    },
    [request],
  );

  const reset = useCallback(() => setState({ loading: false, error: null }), []);

  return { ...state, mutate, reset };
}
