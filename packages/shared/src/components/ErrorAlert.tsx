import type { ApiError } from '../api/ApiError';
import { getErrorReference, getUserMessage } from '../errors/errorService';

interface ErrorAlertProps {
  error: ApiError | null;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  if (!error) return null;
  const reference = getErrorReference(error);
  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
      <div>
        {getUserMessage(error)}
        {reference && <small className="d-block text-danger-emphasis mt-1">Reference: {reference}</small>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
