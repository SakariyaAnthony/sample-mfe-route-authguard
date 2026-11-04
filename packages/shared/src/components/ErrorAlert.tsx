import type { ApiError } from '../api/ApiError';

interface ErrorAlertProps {
  error: ApiError | null;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  if (!error) return null;
  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
      <div>
        {error.status ? <strong className="me-2">[{error.status}]</strong> : null}
        {error.message}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
