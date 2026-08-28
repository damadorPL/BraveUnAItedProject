import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { exportRecordsData } from "../services/exportService";
import { buildCallersMap, filterCallRecords } from "../utils/recordFilters";
import {
  X,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, records, callers, filterState } = useApp();

  const [anonymized, setAnonymized] = useState(true);
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");

  if (!isExportModalOpen) return null;

  const filteredRecords = filterCallRecords(records, buildCallersMap(callers), filterState);

  const handleExport = () => {
    const exported = exportRecordsData(filteredRecords, callers, {
      anonymized,
      format,
      filenamePrefix: "Baza_Porad_PFRON",
      period: {
        from: filterState.dateFrom || undefined,
        to: filterState.dateTo || undefined,
      },
    });

    if (!exported) return;

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } catch (_) {}

    setIsExportModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Eksport danych i raportów</h2>
              <p className="text-xs text-slate-400">
                Pobierz zestawienie porad do pliku arkusza kalkulacyjnego
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Summary of rows to export */}
          <div className="bg-indigo-50 dark:bg-[#141312] border border-indigo-100 dark:border-[#2C2927] rounded-2xl p-4 flex items-center justify-between">
            <span className="font-semibold text-indigo-950 dark:text-indigo-200">
              Liczba rekordów do wyeksportowania:
            </span>
            <span className="text-base font-extrabold text-indigo-700 dark:text-[#FFB200] bg-white dark:bg-[#1E1C1A] px-3 py-1 rounded-xl shadow-xs border border-indigo-200 dark:border-[#383431]">
              {filteredRecords.length}
            </span>
          </div>

          {/* Anonymization Choice */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-2">
              Tryb Bezpieczeństwa Danych (RODO / PFRON):
            </label>

            <div className="space-y-2.5">
              <div
                onClick={() => setAnonymized(true)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  anonymized
                    ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 dark:bg-[#141312] border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                }`}
              >
                <div className="mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Raport Anonimizowany dla Grantodawcy (PFRON)</span>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                      Zalecany
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Usuwa imiona, nazwiska, telefony i miejscowość; z opisu porady wycina numery, adresy e-mail i nazwiska z bazy. Zastępuje dane anonimowymi kodami spraw (DZWON-XXXXXX). Zachowuje województwo, kategorię i czas trwania.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setAnonymized(false)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  !anonymized
                    ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 ring-2 ring-amber-500/20"
                    : "bg-slate-50 dark:bg-[#141312] border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                }`}
              >
                <div className="mt-0.5">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Pełne Zestawienie Wewnętrzne (Do Użytku Służbowego)
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Zawiera pełne imiona, nazwiska, numery telefonów oraz notatki wewnętrzne. Dostępne wyłącznie dla upoważnionych pracowników.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Format Choice */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-2">
              Format Pliku:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  format === "csv"
                    ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200] shadow-sm"
                    : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>CSV (z kodowaniem UTF-8)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("xlsx")}
                className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  format === "xlsx"
                    ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200] shadow-sm"
                    : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel (.xlsx)</span>
              </button>
            </div>
            {format === "xlsx" && (
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Plik Excel zawiera dodatkowy arkusz „Podsumowanie” — raport statystyczny wybranego
                okresu sprawozdawczego (liczba porad, beneficjenci, struktura poradnictwa, zasięg
                wg województw).
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#2C2927] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz Plik</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
