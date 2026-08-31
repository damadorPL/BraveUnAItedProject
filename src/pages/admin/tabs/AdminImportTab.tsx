import React, { useState, useRef } from "react";
import { useApp } from "../../../context/AppContext";
import {
  downloadExcelTemplate,
  parseExcelFile,
  finalizeImport,
  ParsedMigrationResult,
} from "../../../services/excelMigrator";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

const MAX_LISTED_ITEMS = 8;

export const AdminImportTab: React.FC = () => {
  const { callers, applyBulkImport } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationResult, setMigrationResult] = useState<ParsedMigrationResult | null>(null);
  const [valueResolutions, setValueResolutions] = useState<Record<string, string>>({});
  const [duplicateResolutions, setDuplicateResolutions] = useState<
    Record<string, "merge" | "separate">
  >({});
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setParsing(true);
    setMigrationResult(null);
    setValueResolutions({});
    setDuplicateResolutions({});
    setIsSuccess(false);

    try {
      const result = await parseExcelFile(selectedFile, callers);
      setMigrationResult(result);
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas odczytu pliku Excel.");
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (!migrationResult || migrationResult.stats.validRows === 0) return;

    const { callers: finalCallers, records: finalRecords } = finalizeImport(migrationResult, {
      values: valueResolutions,
      duplicates: duplicateResolutions,
    });
    applyBulkImport(finalCallers, finalRecords);
    setIsSuccess(true);

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handleReset = () => {
    setFile(null);
    setMigrationResult(null);
    setValueResolutions({});
    setDuplicateResolutions({});
    setIsSuccess(false);
    setError(null);
  };

  const stats = migrationResult?.stats;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Import danych z pliku Excel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Migracja i zasilenie bazy kontaktów oraz rejestru porad z arkuszy kalkulacyjnych (.xlsx, .xls, .csv)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => downloadExcelTemplate()}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 dark:bg-[#282522] hover:bg-slate-200 dark:hover:bg-[#34302D] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3E3A37] rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pobierz wzorzec arkusza (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess ? (
        <div className="bg-white dark:bg-[#1E1C1A] border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-8 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-200">
              Migracja została pomyślnie zakończona!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
              Wszystkie poprawne wpisy i kartoteki zostały dodane do bazy danych. Nowe dane są już widoczne w rejestrze i statystykach.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Zaimportuj kolejny plik
          </button>
        </div>
      ) : (
        <>
          {/* Upload / Drag-and-Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-[#FFB200] bg-[#FFB200]/10"
                : "border-slate-300 dark:border-[#383431] hover:border-[#FFB200] bg-white dark:bg-[#1E1C1A]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <Upload className="w-12 h-12 text-[#FFB200] mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {parsing
                ? "Przetwarzanie i analiza pliku..."
                : file
                  ? file.name
                  : "Przeciągnij plik Excel (.xlsx, .xls, .csv) lub kliknij, aby wybrać z dysku"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto">
              System automatycznie dopasuje kolumny, wykryje duplikaty kontaktów oraz znormalizuje województwa i rodzaje poradnictwa.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-rose-800 dark:text-rose-300 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs">Błąd odczytu pliku:</div>
                <div className="text-xs mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {/* Analysis & Summary Report */}
          {migrationResult && stats && (
            <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Podsumowanie analizy pliku
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sprawdź wykryte dane przed zatwierdzeniem importu
                </p>
              </div>

              {/* KPI Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-3.5 text-center">
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.validRows}</div>
                  <div className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">Poprawne wpisy</div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-3.5 text-center">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    +{stats.newCallersCount}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">Nowe kontakty</div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-3.5 text-center">
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {stats.existingCallersMatched}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">Dopasowane osoby</div>
                </div>

                <div className="bg-slate-50 dark:bg-[#282522] border border-slate-200 dark:border-[#3E3A37] rounded-2xl p-3.5 text-center">
                  <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{stats.totalRows}</div>
                  <div className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">Wszystkie wiersze</div>
                </div>
              </div>

              {/* Duplicate Resolution Section */}
              {migrationResult.duplicateReviews.length > 0 && (
                <div className="border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Wykryte potencjalne duplikaty ({migrationResult.duplicateReviews.length})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Poniższe osoby posiadają podobne dane w bazie. Wybierz, czy połączyć historię porad, czy utworzyć osobną kartotekę.
                  </p>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {migrationResult.duplicateReviews.slice(0, MAX_LISTED_ITEMS).map((dup) => (
                      <div
                        key={dup.id}
                        className="bg-white dark:bg-[#1E1C1A] p-3 rounded-xl border border-slate-200 dark:border-[#383431] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {dup.newCallerName}
                          </span>{" "}
                          <span className="text-slate-500">(Wiersze: {dup.rowNumbers.join(", ")})</span>
                          <div className="text-[11px] text-slate-500">
                            Dopasowano do istniejącej kartoteki: <strong>{dup.existingCallerName}</strong>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setDuplicateResolutions((prev) => ({
                                ...prev,
                                [dup.id]: "merge",
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              duplicateResolutions[dup.id] !== "separate"
                                ? "bg-amber-500 text-white"
                                : "bg-slate-100 dark:bg-[#282522] text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            Scal wpisy
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDuplicateResolutions((prev) => ({
                                ...prev,
                                [dup.id]: "separate",
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              duplicateResolutions[dup.id] === "separate"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-[#282522] text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            Utwórz osobno
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#383431]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#282522] hover:bg-slate-200 dark:hover:bg-[#34302D] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Anuluj
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={stats.validRows === 0}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] disabled:opacity-50 text-[#2D2A28] rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Zatwierdź i zaimportuj {stats.validRows} wpisów</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
