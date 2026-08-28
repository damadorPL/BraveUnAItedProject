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
    });

    if (!exported) return;

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } catch (_) {}

    setIsExportModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Summary of rows to export */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
            <span className="font-semibold text-indigo-950">
              Liczba rekordów do wyeksportowania:
            </span>
            <span className="text-base font-extrabold text-indigo-700 bg-white px-3 py-1 rounded-xl shadow-xs border border-indigo-200">
              {filteredRecords.length}
            </span>
          </div>

          {/* Anonymization Choice */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Tryb Bezpieczeństwa Danych (RODO / PFRON):
            </label>

            <div className="space-y-2.5">
              <div
                onClick={() => setAnonymized(true)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  anonymized
                    ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Raport Anonimizowany dla Grantodawcy (PFRON)</span>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                      Zalecany
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Usuwa imiona, nazwiska, telefony i miejscowość; z opisu porady wycina numery, adresy e-mail i nazwiska z bazy. Zastępuje dane anonimowymi kodami spraw (DZWON-XXXXXX). Zachowuje województwo, kategorię i czas trwania.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setAnonymized(false)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  !anonymized
                    ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="mt-0.5">
                  <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    Pełne Zestawienie Wewnętrzne (Do Użytku Służbowego)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Zawiera pełne imiona, nazwiska, numery telefonów oraz notatki wewnętrzne. Dostępne wyłącznie dla upoważnionych pracowników.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Format Choice */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Format Pliku:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  format === "csv"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>CSV (z kodowaniem UTF-8)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("xlsx")}
                className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  format === "xlsx"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5"
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
