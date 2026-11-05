import { isApiError, type ApiError } from '../api/ApiError';

export type ErrorSource = 'api' | 'query' | 'mutation' | 'boundary' | 'window';

export interface ErrorContext {
  source: ErrorSource;
  /** Micro-frontend the error came from, when known. */
  module?: string;
  extra?: Record<string, unknown>;
}

export interface ErrorReport extends ErrorContext {
  error: unknown;
  message: string;
  timestamp: string;
}

export type ErrorReporter = (report: ErrorReport) => void;

const DEDUPE_WINDOW_MS = 3000;

const consoleReporter: ErrorReporter = ({ error, source, module, extra }) => {
  console.error(`[${module ? `${module}:` : ''}${source}]`, error, extra ?? '');
};

interface ErrorServiceState {
  reporter: ErrorReporter;
  reported: WeakSet<object>;
  recent: Map<string, number>;
}

// Same reason as createGlobalStore: every bundle has its own copy of this module,
// so the reporter the shell installs must live on globalThis to reach the remotes.
const globalScope = globalThis as typeof globalThis & { __bankErrorService__?: ErrorServiceState };
const state: ErrorServiceState = (globalScope.__bankErrorService__ ??= {
  reporter: consoleReporter,
  reported: new WeakSet(),
  recent: new Map(),
});

export function setErrorReporter(reporter: ErrorReporter): void {
  state.reporter = reporter;
}

const fingerprint = (error: unknown, context: ErrorContext): string => {
  const api = isApiError(error) ? `${error.kind}:${error.status}:${error.url ?? ''}` : '';
  const message = error instanceof Error ? error.message : String(error);
  return `${context.source}|${context.module ?? ''}|${api}|${message}`;
};

const isDuplicate = (error: unknown, context: ErrorContext): boolean => {
  if (typeof error === 'object' && error !== null) {
    if (state.reported.has(error)) return true;
    state.reported.add(error);
  }

  const now = Date.now();
  const key = fingerprint(error, context);
  const last = state.recent.get(key);
  state.recent.set(key, now);
  for (const [k, at] of state.recent) if (now - at > DEDUPE_WINDOW_MS) state.recent.delete(k);
  return last !== undefined && now - last < DEDUPE_WINDOW_MS;
};

/** Logs and reports an error once. Safe to call from any MFE or non-React code. */
export function reportError(error: unknown, context: ErrorContext): void {
  if (isDuplicate(error, context)) return;
  try {
    state.reporter({
      ...context,
      error,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  } catch (reporterError) {
    console.error('[errorService] reporter failed', reporterError);
  }
}

const GENERIC_MESSAGE = 'Something went wrong on our side. Please try again in a moment.';

const API_MESSAGES: Record<ApiError['kind'], string> = {
  network: 'Unable to reach the server. Check your connection and try again.',
  timeout: 'The request took too long. Please try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to do this.',
  notFound: 'The requested item could not be found.',
  validation: 'Please check the details and try again.',
  server: GENERIC_MESSAGE,
  unknown: GENERIC_MESSAGE,
};

// 4xx messages from the API are written for end users ("Insufficient balance",
// "Invalid username or password"); 5xx and transport messages are not.
const SERVER_MESSAGE_KINDS = new Set<ApiError['kind']>(['unauthorized', 'forbidden', 'notFound', 'validation']);

const serverMessage = (error: ApiError): string | undefined => {
  const data = error.data as { message?: unknown } | undefined;
  return typeof data?.message === 'string' && data.message ? data.message : undefined;
};

/** Text that is safe and useful to show to an end user. */
export function getUserMessage(error: unknown): string {
  if (!isApiError(error)) return 'Something went wrong. Please try again.';
  if (SERVER_MESSAGE_KINDS.has(error.kind)) return serverMessage(error) ?? API_MESSAGES[error.kind];
  return API_MESSAGES[error.kind];
}

/** Short ID support can use to find the failed request in server logs. */
export function getErrorReference(error: unknown): string | undefined {
  if (!isApiError(error) || !error.correlationId) return undefined;
  if (error.kind !== 'server' && error.kind !== 'timeout' && error.kind !== 'unknown') return undefined;
  return error.correlationId.slice(0, 8).toUpperCase();
}
