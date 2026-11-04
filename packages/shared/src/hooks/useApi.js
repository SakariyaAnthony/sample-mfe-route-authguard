import { useCallback, useEffect, useRef, useState } from 'react';
import { isCancel } from '../api/httpClient';

/**
 * Runs a GET-style request on mount (and whenever `deps` change).
 * `request` receives an AbortSignal; the in-flight request is cancelled on
 * unmount or when a newer request starts, so stale responses never land.
 *
 *   const { data, loading, error, refetch } =
 *     useApi((signal) => accountService.getAccount(id, { signal }), [id]);
 */
export function useApi(request, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const controllerRef = useRef(null);

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
      setState((prev) => ({ ...prev, loading: false, error }));
    }
  }, deps);

  useEffect(() => {
    execute();
    return () => controllerRef.current?.abort();
  }, [execute]);

  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }));
  }, []);

  return { ...state, refetch: execute, setData };
}
