import React, { useEffect } from "react";
import { LucideIcon, AlertTriangle, Trash2, HelpCircle, X } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "info" | "primary";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Potwierdź",
  cancelText = "Anuluj",
  variant = "danger",
  icon: IconProp,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const DefaultIcon =
    variant === "danger"
      ? Trash2
      : variant === "warning"
      ? AlertTriangle
      : HelpCircle;

  const Icon = IconProp || DefaultIcon;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400",
          btnConfirm: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus:ring-rose-500",
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400",
          btnConfirm: "bg-[#FFB200] hover:bg-[#E5A000] active:bg-[#CC8F00] text-[#2D2A28] shadow-xs focus:ring-amber-500",
        };
      case "primary":
      case "info":
      default:
        return {
          iconBg: "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400",
          btnConfirm: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs focus:ring-blue-500",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl shrink-0 ${styles.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
          {typeof description === "string" ? (
            <p className="whitespace-pre-line">{description}</p>
          ) : (
            description
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 dark:bg-[#2D2A28] hover:bg-slate-200 dark:hover:bg-[#3E3A37] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${styles.btnConfirm}`}
          >
            {isLoading ? "Przetwarzanie..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
