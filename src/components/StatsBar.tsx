import React from "react";
import { useApp } from "../context/AppContext";
import { GUIDANCE_TYPES, GuidanceType, VOIVODESHIPS } from "../types";
import { buildCallersMap, filterCallRecords } from "../utils/recordFilters";
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
  CalendarDays,
  RotateCcw,
} from "lucide-react";

interface GuidanceTypeMeta {
  label: string;
  icon: React.ReactNode;
  barClass: string;
}

// Metadane prezentacyjne dla każdego rodzaju poradnictwa z GUIDANCE_TYPES —
// nowy rodzaj w types/index.ts od razu pojawi się na wykresie (z fallbackiem).
const GUIDANCE_TYPE_META: Record<GuidanceType, GuidanceTypeMeta> = {
  "prawno-obywatelskie": {
    label: "Prawno-obywatelskie (WZON, szkoła, ZUS, prawo)",
    icon: <Scale className="w-3.5 h-3.5 text-blue-600" />,
    barClass: "bg-blue-600",
  },
  "w zakresie psychologii i rehabilitacji społecznej": {
    label: "W zakresie psychologii i rehabilitacji społecznej",
    icon: <Brain className="w-3.5 h-3.5 text-purple-600" />,
    barClass: "bg-purple-600",
  },
  "Parent to Parent": {
    label: "Parent to Parent (doradztwo rodzicielskie)",
    icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />,
    barClass: "bg-emerald-600",
  },
  "społeczne": {
    label: "Społeczne (diagnostyka, wsparcie terapeutyczne)",
    icon: <Users className="w-3.5 h-3.5 text-indigo-600" />,
    barClass: "bg-indigo-600",
  },
  "inne": {
    label: "Inne",
    icon: <Tag className="w-3.5 h-3.5 text-slate-500" />,
    barClass: "bg-slate-500",
  },
};

function poradyLabel(count: number): string {
  if (count === 1) return "porada";
  const dziesiatki = count % 10;
  const setki = count % 100;
  if (dziesiatki >= 2 && dziesiatki <= 4 && !(setki >= 12 && setki <= 14)) return "porady";
  return "porad";
}

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

  const callersMap = buildCallersMap(callers);
  // Statystyki liczone na tym samym zbiorze, który widzi rejestr i eksport.
  const filteredRecords = filterCallRecords(records, callersMap, filterState);

  const quarterPresets = buildQuarterPresets(new Date().getFullYear());
  const hasDateRange = Boolean(filterState.dateFrom || filterState.dateTo);
  const hasOtherFilters = Boolean(
    filterState.searchQuery ||
      filterState.voivodeship ||
      filterState.guidanceType ||
      filterState.guidanceArea ||
      filterState.beneficiaryType ||
      filterState.specialistId
  );

  // Bez fabrykowania czasu: sumujemy tylko faktycznie zarejestrowane minuty.
  const totalMinutes = filteredRecords.reduce(
    (acc, r) => acc + (typeof r.durationMinutes === "number" && r.durationMinutes > 0 ? r.durationMinutes : 0),
    0
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Beneficjenci objęci poradami w wybranym zakresie (unikalne kartoteki).
  const beneficiaryIds = new Set(filteredRecords.map((r) => r.callerId));
  const beneficiaries = [...beneficiaryIds]
    .map((id) => callersMap.get(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const certCount = beneficiaries.filter((c) => c.hasDisabilityCertificate === "tak").length;

  const guidanceCounts = new Map<GuidanceType, number>();
  filteredRecords.forEach((r) => {
    guidanceCounts.set(r.guidanceType, (guidanceCounts.get(r.guidanceType) || 0) + 1);
  });

  // Liczba porad (nie kartotek) per województwo — pełna lista dla raportu PFRON.
  const voivodeshipCounts = new Map<string, number>();
  filteredRecords.forEach((r) => {
    const voivodeship = callersMap.get(r.callerId)?.voivodeship || "brak";
    voivodeshipCounts.set(voivodeship, (voivodeshipCounts.get(voivodeship) || 0) + 1);
  });
  const voivodeshipRows = VOIVODESHIPS.filter(
    (v) => v !== "brak" || (voivodeshipCounts.get("brak") || 0) > 0
  ).map((v) => ({ name: v, count: voivodeshipCounts.get(v) || 0 }));

  const setDateRange = (from: string, to: string) => {
    setFilterState((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      {/* Reporting period selector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:justify-between">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label
                htmlFor="stats-date-from"
                className="block font-semibold text-slate-600 mb-1 flex items-center gap-1"
              >
                <CalendarDays className="w-3 h-3 text-slate-400" />
                Okres sprawozdawczy od:
              </label>
              <input
                id="stats-date-from"
                type="date"
                value={filterState.dateFrom}
                max={filterState.dateTo || undefined}
                onChange={(e) => setFilterState((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="stats-date-to"
                className="block font-semibold text-slate-600 mb-1 flex items-center gap-1"
              >
                <CalendarDays className="w-3 h-3 text-slate-400" />
                do:
              </label>
              <input
                id="stats-date-to"
                type="date"
                value={filterState.dateTo}
                min={filterState.dateFrom || undefined}
                onChange={(e) => setFilterState((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

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
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Cały okres</span>
              </button>
            )}
          </div>
        </div>

        {hasOtherFilters && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            Statystyki uwzględniają także pozostałe aktywne filtry rejestru porad (województwo,
            rodzaj poradnictwa, specjalista, wyszukiwanie itp.).
          </div>
        )}
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-[11px]">
              Udzielone porady
            </span>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{filteredRecords.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Porady zarejestrowane w wybranym okresie
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-[11px]">
              Beneficjenci objęci poradami
            </span>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{beneficiaryIds.size}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Unikalne kartoteki z poradami w wybranym okresie
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-[11px]">
              Posiadający orzeczenie OzN
            </span>
            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-2xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {certCount}{" "}
            <span className="text-sm font-normal text-slate-400">
              ({beneficiaries.length > 0 ? Math.round((certCount / beneficiaries.length) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Wśród beneficjentów objętych poradami
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-[11px]">
              Godziny dyżurów
            </span>
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalHours} godz.</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Suma zarejestrowanego czasu porad (bez porad bez podanego czasu)
          </div>
        </div>
      </div>

      {/* Breakdown by Guidance Type and Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guidance Types Chart Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Struktura rodzajów poradnictwa</span>
          </h3>

          <div className="space-y-3.5">
            {GUIDANCE_TYPES.map((type) => {
              const meta = GUIDANCE_TYPE_META[type];
              const count = guidanceCounts.get(type) || 0;
              const percent =
                filteredRecords.length > 0 ? Math.round((count / filteredRecords.length) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      {meta.icon} {meta.label}
                    </span>
                    <span>
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${meta.barClass} h-2 rounded-full transition-all duration-500`}
                      style={{
                        width:
                          filteredRecords.length > 0
                            ? (count / filteredRecords.length) * 100 + "%"
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regions Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Zasięg geograficzny — porady wg województw</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5">
            {voivodeshipRows.map(({ name, count }) => (
              <div
                key={name}
                className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0"
              >
                <span className={count > 0 ? "font-semibold text-slate-800" : "text-slate-400"}>
                  {name === "brak" ? "brak danych" : name}
                </span>
                <span
                  className={
                    count > 0 ? "font-bold text-indigo-600" : "text-slate-300 font-medium"
                  }
                >
                  {count} {poradyLabel(count)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Linia poradnicza obsługuje zgłoszenia ze wszystkich 16 województw w ramach umowy z PFRON.
          </div>
        </div>
      </div>
    </div>
  );
};
