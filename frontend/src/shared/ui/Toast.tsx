import { useEffect } from "react";
import { useUiStore } from "../stores/uiStore";
import type { Toast as ToastType } from "../stores/uiStore";

const typeStyles: Record<ToastType["type"], string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
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
