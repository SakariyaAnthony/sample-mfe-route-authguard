import axios, { AxiosError } from 'axios';
import { authStore, AUTH_FORBIDDEN_EVENT, AUTH_LOGOUT_EVENT } from '../auth/authStore';
import { reportError } from '../errors/errorService';
import { ApiError, kindForStatus, type ApiErrorKind } from './ApiError';

interface ErrorBody {
  message?: string;
}

const CORRELATION_HEADER = 'X-Correlation-Id';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers[CORRELATION_HEADER] = crypto.randomUUID();
  return config;
});

const kindFor = (error: AxiosError): ApiErrorKind => {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'timeout';
  if (!error.response) return 'network';
  return kindForStatus(error.response.status);
};

const messageFor = (error: AxiosError<ErrorBody>, kind: ApiErrorKind): string => {
  if (kind === 'timeout') return 'The request timed out. Please try again.';
  if (kind === 'network') return 'Unable to reach the server. Check your connection or that the API is running.';
  return error.response?.data?.message || `Request failed with status ${error.response?.status}`;
};

const toError = (error: AxiosError<ErrorBody>): ApiError => {
  const kind = kindFor(error);
  const correlationId = error.config?.headers?.[CORRELATION_HEADER];
  return new ApiError({
    status: error.response?.status ?? 0,
    kind,
    message: messageFor(error, kind),
    data: error.response?.data,
    correlationId: typeof correlationId === 'string' ? correlationId : undefined,
    url: error.config?.url,
  });
};

// Only the request that was sent with the *current* token may end the session.
// That makes parallel 401s fire the logout once, and stops a late 401 from an
// old session from logging out a user who has just signed in again.
const sentWithCurrentToken = (error: AxiosError): boolean => {
  const token = authStore.getToken();
  return Boolean(token) && error.config?.headers?.Authorization === `Bearer ${token}`;
};

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const apiError = toError(error);
    const isLoginCall = error.config?.url?.includes('/auth/login');

    switch (apiError.kind) {
      case 'unauthorized':
        if (!isLoginCall && sentWithCurrentToken(error)) {
          authStore.clear('expired');
          window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT, { detail: { reason: 'expired' } }));
        }
        break;
      case 'forbidden':
        window.dispatchEvent(
          new CustomEvent(AUTH_FORBIDDEN_EVENT, { detail: { message: apiError.message, url: apiError.url } }),
        );
        break;
      case 'server':
      case 'network':
      case 'timeout':
      case 'unknown':
        reportError(apiError, { source: 'api', extra: { url: apiError.url, correlationId: apiError.correlationId } });
        break;
    }

    return Promise.reject(apiError);
  },
);

export const isCancel = (error: unknown): boolean => axios.isCancel(error);
