import React from "react";
import { useApp } from "../context/AppContext";
import { StatsBar } from "../components/StatsBar";
import { Download, BarChart2 } from "lucide-react";

export const StatsPage: React.FC = () => {
  const { setIsExportModalOpen, currentSpecialist } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#FFB200]" />
            <span>Pulpit analityczny i raporty PFRON</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Statystyki linii wsparcia, wskaźniki grantowe i podsumowania geograficzne
          </p>
        </div>

        {currentSpecialist?.isAdmin && (
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#383431] rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Eksportuj raport (CSV / Excel)</span>
          </button>
        )}
      </div>

      <StatsBar />
    </div>
  );
};
