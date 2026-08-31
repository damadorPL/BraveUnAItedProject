import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React ErrorBoundary error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 dark:bg-[#141312]">
          <div className="max-w-md w-full bg-white dark:bg-[#1E1C1A] border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 sm:p-8 text-center shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Wystąpił nieoczekiwany błąd aplikacji
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Przepraszamy, ten widok nie mógł zostać prawidłowo wyświetlony.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-100 dark:bg-[#252018] rounded-xl text-left text-[11px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto max-h-32 border border-slate-200 dark:border-[#383431]">
                {this.state.error.message || "Błąd wykonania skryptu"}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Spróbuj ponownie</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-[#2D2A28] hover:bg-slate-200 dark:hover:bg-[#3E3A37] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Strona główna</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
