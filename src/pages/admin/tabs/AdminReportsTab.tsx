import React from "react";
import { useApp } from "../../../context/AppContext";
import { StatsBar } from "../../../components/StatsBar";
import { Download, BarChart2, FileSpreadsheet, ShieldCheck } from "lucide-react";

export const AdminReportsTab: React.FC = () => {
  const { setIsExportModalOpen } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header section with Export Button */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-[#FFB200] rounded-xl">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Raporty PFRON i pulpit analityczny
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oficjalne zestawienia sprawozdawcze, wskaźniki grantowe, struktura poradnictwa oraz rozkład geograficzny
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Generuj i eksportuj raport (Excel / CSV)</span>
        </button>
      </div>

      {/* Main Stats Bar Component */}
      <StatsBar />
    </div>
  );
};
