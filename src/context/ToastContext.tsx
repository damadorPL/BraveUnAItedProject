import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration: number = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (msg: string, dur?: number) => showToast(msg, "success", dur),
      error: (msg: string, dur?: number) => showToast(msg, "error", dur),
      info: (msg: string, dur?: number) => showToast(msg, "info", dur),
      warning: (msg: string, dur?: number) => showToast(msg, "warning", dur),
    }),
    [showToast]
  );

  const contextValue = useMemo(() => ({ showToast, toast }), [showToast, toast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const typeStyles = {
            success: {
              bg: "bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20",
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
            },
            error: {
              bg: "bg-rose-900/95 text-white border-rose-700 shadow-rose-950/20",
              icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
            },
            warning: {
              bg: "bg-amber-900/95 text-white border-amber-700 shadow-amber-950/20",
              icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
            },
            info: {
              bg: "bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20",
              icon: <Info className="w-5 h-5 text-teal-400 shrink-0" />,
            },
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 ${typeStyles.bg}`}
              role="status"
            >
              <div className="flex items-center gap-3 min-w-0">
                {typeStyles.icon}
                <span className="text-xs sm:text-sm font-semibold leading-snug break-words">
                  {t.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Zamknij powiadomienie"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
