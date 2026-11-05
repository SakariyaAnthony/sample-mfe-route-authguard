export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'server'
  | 'unknown';

interface ApiErrorInit {
  status: number;
  message: string;
  kind?: ApiErrorKind;
  data?: unknown;
  correlationId?: string;
  url?: string;
}

// @bank/shared is bundled into every remote, so each bundle has its own ApiError
// class and `instanceof` fails across bundles. A registry symbol works everywhere.
const API_ERROR_BRAND: unique symbol = Symbol.for('bank.ApiError');

export const kindForStatus = (status: number): ApiErrorKind => {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status >= 400 && status < 500) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
};

export class ApiError extends Error {
  readonly [API_ERROR_BRAND] = true;
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly data?: unknown;
  readonly correlationId?: string;
  readonly url?: string;

  constructor({ status, message, kind, data, correlationId, url }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind ?? kindForStatus(status);
    this.data = data;
    this.correlationId = correlationId;
    this.url = url;
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && (error as Record<symbol, unknown>)[API_ERROR_BRAND] === true;

export const toApiError = (error: unknown): ApiError =>
  isApiError(error)
    ? error
    : new ApiError({ status: 0, kind: 'unknown', message: error instanceof Error ? error.message : 'Unexpected error' });
