import React from "react";
import { useApp } from "../context/AppContext";
import { CallRecordsFilter } from "../components/CallRecordsFilter";
import { CallRecordsTable } from "../components/CallRecordsTable";
import { Download } from "lucide-react";

export const RecordsPage: React.FC = () => {
  const { setIsExportModalOpen } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Centralny rejestr udzielonych porad
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pełne zestawienie konsultacji ze wszystkich dyżurów z polami wg oficjalnego wzorca PFRON
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#383431] rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span>Eksportuj rejestr (XLSX / CSV)</span>
        </button>
      </div>

      <CallRecordsFilter />
      <CallRecordsTable />
    </div>
  );
};
