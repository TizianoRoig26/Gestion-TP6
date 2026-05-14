import { useEffect } from "react";
import { useUiStore } from "../stores/uiStore";
import type { Toast as ToastType } from "../stores/uiStore";

const typeStyles: Record<ToastType["type"], string> = {
  success: "bg-secondary-50 border-secondary-200 text-secondary-600",
  error: "bg-danger-50 border-danger-200 text-danger-600",
  info: "bg-primary-50 border-primary-200 text-primary-600",
  warning: "bg-accent-50 border-accent-200 text-accent-600",
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useUiStore((state) => state.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div
      className={`px-4 py-3 rounded-lg border shadow-sm flex items-center justify-between gap-4 ${typeStyles[toast.type]}`}
    >
      <p className="text-sm">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUiStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
