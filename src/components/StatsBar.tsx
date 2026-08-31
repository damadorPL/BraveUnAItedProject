import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { GuidanceType } from "../types";
import { buildCallersMap, filterCallRecords } from "../utils/recordFilters";
import { computeReportStats } from "../utils/reportStats";
import { pluralizePorady } from "../utils/pluralization";
import { DateRangePicker } from "./DateRangePicker";
import {
  BarChart3,
  PhoneCall,
  Users,
  Clock,
  Scale,
  Brain,
  MapPin,
  Award,
  HeartHandshake,
  Tag,
  RotateCcw,
} from "lucide-react";

interface GuidanceTypeMeta {
  icon: React.ReactNode;
  barClass: string;
}

// Metadane czysto prezentacyjne (ikona, kolor paska) — etykiety sprawozdawcze
// żyją w utils/reportStats.ts, wspólnie z eksportem raportu.
const GUIDANCE_TYPE_META: Record<GuidanceType, GuidanceTypeMeta> = {
  "prawno-obywatelskie": {
    icon: <Scale className="w-3.5 h-3.5 text-blue-600" />,
    barClass: "bg-blue-600",
  },
  "w zakresie psychologii i rehabilitacji społecznej": {
    icon: <Brain className="w-3.5 h-3.5 text-purple-600" />,
    barClass: "bg-purple-600",
  },
  "Parent to Parent": {
    icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />,
    barClass: "bg-emerald-600",
  },
  "społeczne": {
    icon: <Users className="w-3.5 h-3.5 text-indigo-600" />,
    barClass: "bg-indigo-600",
  },
  "inne": {
    icon: <Tag className="w-3.5 h-3.5 text-slate-500" />,
    barClass: "bg-slate-500",
  },
};

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

// Kwartały bieżącego roku — okresy sprawozdawcze PFRON.
function buildQuarterPresets(year: number): { label: string; from: string; to: string }[] {
  return [1, 2, 3, 4].map((q) => ({
    label: "Q" + q + " " + year,
    from: toIsoDate(new Date(year, (q - 1) * 3, 1)),
    to: toIsoDate(new Date(year, q * 3, 0)),
  }));
}

export const StatsBar: React.FC = () => {
  const { records, callers, filterState, setFilterState } = useApp();

  // Memoize callers map and filtered records (Rule 5.1 & 7.4: Cache computations)
  const callersMap = useMemo(() => buildCallersMap(callers), [callers]);
  const filteredRecords = useMemo(
    () => filterCallRecords(records, callersMap, filterState),
    [records, callersMap, filterState]
  );

  const quarterPresets = useMemo(() => buildQuarterPresets(new Date().getFullYear()), []);
  const hasDateRange = Boolean(filterState.dateFrom || filterState.dateTo);
  const hasOtherFilters = Boolean(
    filterState.searchQuery ||
      filterState.voivodeship ||
      filterState.guidanceType ||
      filterState.guidanceArea ||
      filterState.beneficiaryType ||
      filterState.specialistId
  );

  // Wspólna logika liczenia ze sprawozdawczym eksportem (arkusz "Podsumowanie")
  const stats = useMemo(
    () => computeReportStats(filteredRecords, callersMap),
    [filteredRecords, callersMap]
  );
  const totalHours = (stats.totalMinutes / 60).toFixed(1);

  const setDateRange = (from: string, to: string) => {
    setFilterState((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      {/* Reporting period selector */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:justify-between">
          <DateRangePicker
            label="Okres sprawozdawczy:"
            dateFrom={filterState.dateFrom}
            dateTo={filterState.dateTo}
            onChange={(from, to) => setFilterState((prev) => ({ ...prev, dateFrom: from, dateTo: to }))}
          />

          <div className="flex items-center gap-2 flex-wrap">
            {quarterPresets.map((preset) => {
              const isActive =
                filterState.dateFrom === preset.from && filterState.dateTo === preset.to;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDateRange(preset.from, preset.to)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200]"
                      : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
            {hasDateRange && (
              <button
                type="button"
                onClick={() => setDateRange("", "")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-xs text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-100 dark:border-rose-900/50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Cały okres</span>
              </button>
            )}
          </div>
        </div>

        {hasOtherFilters && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#2C2927] text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl px-3 py-2">
            Statystyki uwzględniają także pozostałe aktywne filtry rejestru porad (województwo,
            rodzaj poradnictwa, specjalista, wyszukiwanie itp.).
          </div>
        )}
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              Udzielone porady
            </span>
            <div className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-2xl">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.totalRecords}</div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Porady zarejestrowane w wybranym okresie
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              Beneficjenci objęci poradami
            </span>
            <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-2xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.uniqueBeneficiaries}</div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Unikalne kartoteki z poradami w wybranym okresie
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              Posiadający orzeczenie OzN
            </span>
            <div className="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 p-2.5 rounded-2xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {stats.certifiedBeneficiaries}{" "}
            <span className="text-sm font-normal text-slate-400 dark:text-slate-500">({stats.certifiedPercent}%)</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Wśród beneficjentów objętych poradami
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              Godziny dyżurów
            </span>
            <div className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 p-2.5 rounded-2xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalHours} godz.</div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Suma zarejestrowanego czasu porad (bez porad bez podanego czasu)
          </div>
        </div>
      </div>

      {/* Breakdown by Guidance Type and Regions (Stacked one below another) */}
      <div className="space-y-6">
        {/* Guidance Types Chart Box */}
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3.5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#296B6E] dark:text-[#FFB200]" />
            <span>Struktura rodzajów poradnictwa</span>
          </h3>

          <div className="space-y-3.5">
            {stats.guidanceRows.map(({ type, label, count, percent }) => {
              const meta = GUIDANCE_TYPE_META[type];
              return (
                <div key={type}>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
                    <span className="flex items-center gap-1.5">
                      {meta.icon} {label}
                    </span>
                    <span>
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#2C2927] rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${meta.barClass} h-2.5 rounded-full transition-all duration-500`}
                      style={{
                        width:
                          stats.totalRecords > 0 ? (count / stats.totalRecords) * 100 + "%" : "0%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regions Box */}
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zasięg geograficzny: porady wg województw</span>
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                16 województw
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {stats.voivodeshipRows.map(({ name, count, percent }) => {
                const displayName =
                  name === "brak" ? "Brak danych" : name.charAt(0).toUpperCase() + name.slice(1);

                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs transition-all gap-3 ${
                      count > 0
                        ? "bg-slate-50/80 dark:bg-[#252018]/60 border-slate-200/80 dark:border-[#383431] shadow-2xs"
                        : "bg-transparent border-slate-100/80 dark:border-[#262422] opacity-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          count > 0
                            ? "bg-indigo-600 dark:bg-[#FFB200]"
                            : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      />
                      <span
                        className={`font-semibold whitespace-nowrap ${
                          count > 0
                            ? "text-slate-800 dark:text-slate-100"
                            : "text-slate-400 dark:text-slate-500 font-normal"
                        }`}
                        title={displayName}
                      >
                        {displayName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 ml-auto">
                      <span
                        className={`font-bold font-mono whitespace-nowrap text-xs ${
                          count > 0
                            ? "text-indigo-600 dark:text-[#FFB200]"
                            : "text-slate-400 dark:text-slate-600 font-normal"
                        }`}
                      >
                        {pluralizePorady(count)}
                      </span>
                      {count > 0 && (
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          ({percent}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2C2927] text-[11px] text-slate-400 dark:text-slate-500">
            Linia poradnicza obsługuje zgłoszenia ze wszystkich 16 województw w ramach umowy z PFRON.
          </div>
        </div>
      </div>
    </div>
  );
};
