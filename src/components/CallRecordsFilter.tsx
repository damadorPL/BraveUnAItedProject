import React from "react";
import { useApp } from "../context/AppContext";
import {
  VOIVODESHIPS,
  GUIDANCE_TYPES,
  BENEFICIARY_TYPES,
} from "../types";
import { Filter, RotateCcw, MapPin, UserCheck, Tag, Users } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

export const CallRecordsFilter: React.FC = () => {
  const { filterState, setFilterState, specialists } = useApp();

  const handleReset = () => {
    setFilterState({
      searchQuery: "",
      voivodeship: "",
      guidanceType: "",
      guidanceArea: "",
      beneficiaryType: "",
      specialistId: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters = Boolean(
    filterState.searchQuery ||
      filterState.voivodeship ||
      filterState.guidanceType ||
      filterState.guidanceArea ||
      filterState.beneficiaryType ||
      filterState.specialistId ||
      filterState.dateFrom ||
      filterState.dateTo
  );

  return (
    <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-4 shadow-sm mb-5 text-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-[#2C2927]">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-bold text-sm">
          <Filter className="w-4 h-4 text-[#296B6E] dark:text-[#FFB200]" />
          <span>Filtrowanie rejestru porad</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Wyczyść filtry</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Voivodeship Filter */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            Województwo:
          </label>
          <select
            value={filterState.voivodeship}
            onChange={(e) => setFilterState((prev) => ({ ...prev, voivodeship: e.target.value }))}
            className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#FFB200] focus:outline-none"
          >
            <option value="">Wszystkie (cała Polska)</option>
            {VOIVODESHIPS.map((v) => (
              <option key={v} value={v} className="dark:bg-[#1E1C1A]">
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Guidance Type Filter */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            Rodzaj poradnictwa:
          </label>
          <select
            value={filterState.guidanceType}
            onChange={(e) => setFilterState((prev) => ({ ...prev, guidanceType: e.target.value }))}
            className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#FFB200] focus:outline-none"
          >
            <option value="">Wszystkie rodzaje</option>
            {GUIDANCE_TYPES.map((t) => (
              <option key={t} value={t} className="dark:bg-[#1E1C1A]">
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Beneficiary Filter */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            Kim jest beneficjent:
          </label>
          <select
            value={filterState.beneficiaryType}
            onChange={(e) => setFilterState((prev) => ({ ...prev, beneficiaryType: e.target.value }))}
            className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#FFB200] focus:outline-none"
          >
            <option value="">Wszyscy beneficjenci</option>
            {BENEFICIARY_TYPES.map((b) => (
              <option key={b} value={b} className="dark:bg-[#1E1C1A]">
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Specialist Filter */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            Dyżurujący specjalista:
          </label>
          <select
            value={filterState.specialistId}
            onChange={(e) => setFilterState((prev) => ({ ...prev, specialistId: e.target.value }))}
            className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#FFB200] focus:outline-none"
          >
            <option value="">Wszyscy specjaliści</option>
            {specialists.map((s) => (
              <option key={s.id} value={s.id} className="dark:bg-[#1E1C1A]">
                {s.name} ({s.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date range + free text search row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#2C2927] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[auto_1fr] gap-3 items-end">
        <div className="w-full sm:w-56">
          <DateRangePicker
            label="Zakres dat porady:"
            dateFrom={filterState.dateFrom}
            dateTo={filterState.dateTo}
            onChange={(from, to) => setFilterState((prev) => ({ ...prev, dateFrom: from, dateTo: to }))}
          />
        </div>

        <input
          type="text"
          value={filterState.searchQuery}
          onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
          placeholder="Szukaj w treści porad, zaleceń lub uwag (np. WZON, IPET, orzeczenie, szkoła)..."
          aria-label="Szukaj w treści porad"
          className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-[#FFB200] focus:outline-none"
        />
      </div>
    </div>
  );
};
