import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  downloadExcelTemplate,
  parseExcelFile,
  finalizeImport,
  ParsedMigrationResult,
} from "../services/excelMigrator";
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  SkipForward,
  Wand2,
  HelpCircle,
  UserX,
} from "lucide-react";
import { fireConfetti } from "../utils/confetti";

const MAX_LISTED_ITEMS = 8;

export const ExcelMigratorModal: React.FC = () => {
  const { isExcelModalOpen, setIsExcelModalOpen, callers, applyBulkImport } = useApp();

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

  if (!isExcelModalOpen) return null;

  const handleFile = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setParsing(true);
    setMigrationResult(null);
    setValueResolutions({});
    setDuplicateResolutions({});

    try {
      const result = await parseExcelFile(selectedFile, callers);
      setMigrationResult(result);
    } catch (err: any) {
      setError(err.message || "Błąd podczas odczytu pliku Excel.");
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
      fireConfetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {}

    setTimeout(() => {
      setIsExcelModalOpen(false);
      setIsSuccess(false);
      setMigrationResult(null);
      setFile(null);
      setValueResolutions({});
      setDuplicateResolutions({});
    }, 2200);
  };

  const stats = migrationResult?.stats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Migrator danych z pliku Excel / CSV</h2>
              <p className="text-xs text-slate-300">
                Import dotychczasowego arkusza fundacji i automatyczne zasilenie kartotek
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExcelModalOpen(false)}
            aria-label="Zamknij okno importu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Download Template Banner */}
          <div className="bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs">Potrzebujesz wzorca kolumn?</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Pobierz oficjalny szablon Excel z poprawnymi nagłówkami i przykładowymi wpisami.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadExcelTemplate()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#1E1C1A] hover:bg-slate-100 dark:hover:bg-[#2A2724] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#383431] rounded-xl font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Pobierz szablon (.xlsx)</span>
            </button>
          </div>

          {/* Success Screen */}
          {isSuccess ? (
            <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">Migracja zakończona sukcesem!</h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                Dane zostały scalone z bazą. Wszystkie kartoteki i historia porad są już zsynchronizowane.
              </p>
            </div>
          ) : (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-[#FFB200] bg-[#FFB200]/10"
                    : "border-slate-300 dark:border-[#383431] hover:border-[#FFB200] bg-slate-50/50 dark:bg-[#141312]"
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

                <Upload className="w-10 h-10 text-amber-600 dark:text-[#FFB200] mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {parsing
                    ? "Analizowanie pliku..."
                    : file
                      ? file.name
                      : "Przeciągnij plik Excel (.xlsx, .csv) lub kliknij, aby wybrać"}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  Obsługiwane formaty: Microsoft Excel (.xlsx, .xls), CSV z separatorem średnik/przecinek. Maks. 10 MB.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 text-rose-800 dark:text-rose-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Błąd parsowania pliku:</div>
                    <div>{error}</div>
                  </div>
                </div>
              )}

              {/* Migration Stats, Report & Review */}
              {migrationResult && stats && (
                <div className="space-y-4">
                  {/* Stat Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3 text-center">
                      <div className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400">{stats.validRows}</div>
                      <div className="text-[11px] text-indigo-950 dark:text-indigo-200 font-semibold">Poprawnych wpisów</div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-3 text-center">
                      <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        +{stats.newCallersCount}
                      </div>
                      <div className="text-[11px] text-emerald-950 dark:text-emerald-200 font-semibold">Nowych kontaktów</div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-xl p-3 text-center">
                      <div className="text-xl font-extrabold text-amber-700 dark:text-amber-400">{stats.skippedCount}</div>
                      <div className="text-[11px] text-amber-950 dark:text-amber-200 font-semibold">Pominiętych wierszy</div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 rounded-xl p-3 text-center">
                      <div className="text-xl font-extrabold text-purple-700 dark:text-purple-400">{stats.reviewCount}</div>
                      <div className="text-[11px] text-purple-950 dark:text-purple-200 font-semibold">Do weryfikacji</div>
                    </div>
                  </div>

                  {/* Skipped rows */}
                  {migrationResult.skippedRows.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-900 dark:text-amber-300 mb-1.5">
                        <SkipForward className="w-3.5 h-3.5" />
                        <span>Pominięte wiersze (do poprawy w pliku źródłowym):</span>
                      </div>
                      <ul className="space-y-0.5 text-amber-900 dark:text-amber-300 text-[11px] list-disc list-inside">
                        {migrationResult.skippedRows.slice(0, MAX_LISTED_ITEMS).map((s) => (
                          <li key={s.rowNumber}>
                            Wiersz {s.rowNumber}: {s.reasons.join(", ")}
                          </li>
                        ))}
                      </ul>
                      {migrationResult.skippedRows.length > MAX_LISTED_ITEMS && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                          …i {migrationResult.skippedRows.length - MAX_LISTED_ITEMS} kolejnych.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Auto-corrections */}
                  {migrationResult.corrections.length > 0 && (
                    <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 rounded-xl p-3">
                      <div className="flex items-center space-x-1.5 font-bold text-sky-900 dark:text-sky-300 mb-1.5">
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Automatycznie poprawione literówki ({migrationResult.corrections.length}):</span>
                      </div>
                      <ul className="space-y-0.5 text-sky-900 dark:text-sky-300 text-[11px] list-disc list-inside">
                        {migrationResult.corrections.slice(0, MAX_LISTED_ITEMS).map((c, i) => (
                          <li key={i}>
                            Wiersz {c.rowNumber} · {c.fieldLabel}: „{c.from}" → <b>{c.to}</b>
                          </li>
                        ))}
                      </ul>
                      {migrationResult.corrections.length > MAX_LISTED_ITEMS && (
                        <div className="text-[11px] text-sky-700 dark:text-sky-400 mt-1">
                          …i {migrationResult.corrections.length - MAX_LISTED_ITEMS} kolejnych.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uncertain values review */}
                  {migrationResult.valueReviews.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center space-x-1.5 font-bold text-purple-900 dark:text-purple-300">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Niejednoznaczne wartości: potwierdź dopasowanie</span>
                      </div>
                      {migrationResult.valueReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-white dark:bg-[#141312] border border-purple-100 dark:border-purple-900/40 rounded-lg p-2.5 flex flex-wrap items-center gap-2"
                        >
                          <div className="grow min-w-[180px]">
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Wiersz {rev.rowNumber} · {rev.fieldLabel}
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-white">„{rev.rawValue}"</div>
                          </div>
                          <select
                            aria-label={`Dopasowanie dla wiersza ${rev.rowNumber}, pole ${rev.fieldLabel}`}
                            value={valueResolutions[rev.id] ?? rev.suggested ?? rev.fallback}
                            onChange={(e) =>
                              setValueResolutions((prev) => ({ ...prev, [rev.id]: e.target.value }))
                            }
                            className="border border-purple-200 dark:border-purple-800/60 rounded-lg px-2 py-1.5 bg-white dark:bg-[#1E1C1A] text-slate-800 dark:text-slate-200 font-semibold max-w-[260px]"
                          >
                            {rev.options.map((opt) => (
                              <option key={opt} value={opt} className="dark:bg-[#1E1C1A]">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Possible duplicate callers */}
                  {migrationResult.duplicateReviews.length > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center space-x-1.5 font-bold text-rose-900 dark:text-rose-300">
                        <UserX className="w-3.5 h-3.5" />
                        <span>Możliwe duplikaty kartotek (podobne nazwiska):</span>
                      </div>
                      {migrationResult.duplicateReviews.map((dup) => (
                        <div key={dup.id} className="bg-white dark:bg-[#141312] border border-rose-100 dark:border-rose-900/40 rounded-lg p-2.5">
                          <div className="text-slate-900 dark:text-white">
                            Z pliku: <b>{dup.newCallerName}</b>
                            {dup.rowNumbers.length > 0 && (
                              <span className="text-slate-500 dark:text-slate-400"> (wiersz {dup.rowNumbers.join(", ")})</span>
                            )}{" "}
                            (w bazie istnieje: <b>{dup.existingCallerName}</b>)
                          </div>
                          <div className="flex items-center gap-4 mt-1.5">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name={`dup-${dup.id}`}
                                checked={(duplicateResolutions[dup.id] ?? "merge") === "merge"}
                                onChange={() =>
                                  setDuplicateResolutions((prev) => ({ ...prev, [dup.id]: "merge" }))
                                }
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                To ta sama osoba: scal z istniejącą kartoteką
                              </span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name={`dup-${dup.id}`}
                                checked={duplicateResolutions[dup.id] === "separate"}
                                onChange={() =>
                                  setDuplicateResolutions((prev) => ({
                                    ...prev,
                                    [dup.id]: "separate",
                                  }))
                                }
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">To inna osoba: utwórz nową</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview Table */}
                  {migrationResult.previewRows.length > 0 && (
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-2">
                        Podgląd pierwszych rekordów z pliku:
                      </div>
                      <div className="border border-slate-200 dark:border-[#383431] rounded-xl overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 dark:bg-[#141312] text-slate-700 dark:text-slate-300 font-bold">
                            <tr>
                              <th className="py-2 px-3">Osoba kontaktowa</th>
                              <th className="py-2 px-3">Województwo</th>
                              <th className="py-2 px-3">Rodzaj poradnictwa</th>
                              <th className="py-2 px-3">Obszar</th>
                              <th className="py-2 px-3">Opis</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-[#2C2927] text-slate-600 dark:text-slate-300">
                            {migrationResult.previewRows.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#252220]">
                                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{r.callerName}</td>
                                <td className="py-2 px-3">{r.voivodeship}</td>
                                <td className="py-2 px-3 font-bold">{r.guidanceType}</td>
                                <td className="py-2 px-3">{r.area}</td>
                                <td className="py-2 px-3">{r.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#2C2927] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Zamknij
            </button>
            {migrationResult && !isSuccess && (
              <button
                type="button"
                onClick={handleApply}
                disabled={migrationResult.stats.validRows === 0}
                className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] disabled:opacity-40 disabled:cursor-not-allowed text-[#2D2A28] rounded-xl font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Zatwierdź i scal z bazą ({migrationResult.stats.validRows} wpisów)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
