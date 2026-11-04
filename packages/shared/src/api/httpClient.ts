import axios, { AxiosError } from 'axios';
import { authStore, AUTH_LOGOUT_EVENT } from '../auth/authStore';
import { ApiError } from './ApiError';

interface ErrorBody {
  message?: string;
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Correlation-Id'] = crypto.randomUUID();
  return config;
});

const messageFor = (error: AxiosError<ErrorBody>): string => {
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!error.response) return 'Unable to reach the server. Check your connection or that the API is running.';
  return error.response.data?.message || `Request failed with status ${error.response.status}`;
};

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status ?? 0;
    const isLoginCall = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isLoginCall) {
      authStore.clear();
      window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT, { detail: { reason: 'expired' } }));
    }

    return Promise.reject(new ApiError({ status, message: messageFor(error), data: error.response?.data }));
  },
);

export const isCancel = (error: unknown): boolean => axios.isCancel(error);
