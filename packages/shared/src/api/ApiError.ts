export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor({ status, message, data }: { status: number; message: string; data?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const toApiError = (error: unknown): ApiError =>
  error instanceof ApiError
    ? error
    : new ApiError({ status: 0, message: error instanceof Error ? error.message : 'Unexpected error' });
