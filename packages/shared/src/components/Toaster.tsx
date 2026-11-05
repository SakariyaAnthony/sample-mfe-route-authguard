import { dismissToast, useToasts } from '../ui/uiStore';

export function Toaster() {
  const toasts = useToasts();

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast show align-items-center border-0 text-bg-${toast.type}`} role="status">
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() => dismissToast(toast.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
