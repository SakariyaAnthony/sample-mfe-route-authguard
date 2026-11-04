import { useCallback, useEffect, useRef, useState, type DependencyList, type SetStateAction } from 'react';
import { isCancel } from '../api/httpClient';
import { toApiError, type ApiError } from '../api/ApiError';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Runs a GET-style request on mount (and whenever `deps` change).
 * `request` receives an AbortSignal; the in-flight request is cancelled on
 * unmount or when a newer request starts, so stale responses never land.
 *
 *   const { data, loading, error, refetch } =
 *     useApi((signal) => accountService.getAccount(id, { signal }), [id]);
 */
export function useApi<T>(request: (signal: AbortSignal) => Promise<T>, deps: DependencyList = []) {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null });
  const controllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await request(controller.signal);
      setState({ data, loading: false, error: null });
    } catch (error) {
      if (isCancel(error)) return;
      setState((prev) => ({ ...prev, loading: false, error: toApiError(error) }));
    }
  }, deps);

  useEffect(() => {
    execute();
    return () => controllerRef.current?.abort();
  }, [execute]);

  const setData = useCallback((action: SetStateAction<T | null>) => {
    setState((prev) => ({
      ...prev,
      data: typeof action === 'function' ? (action as (prev: T | null) => T | null)(prev.data) : action,
    }));
  }, []);

  return { ...state, refetch: execute, setData };
}
