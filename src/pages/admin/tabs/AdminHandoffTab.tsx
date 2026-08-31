import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { CallRecord, Caller } from "../../../types";
import { ReassignReferralModal } from "../../../components/ReassignReferralModal";
import {
  Inbox,
  Search,
  X,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

type SortField = "callDate" | "callerName" | "specialistName" | "referredTo" | "status";
type SortDirection = "asc" | "desc";

export const AdminHandoffTab: React.FC = () => {
  const { records, callers, specialists, setSelectedCaller, markReferralStatus } = useApp();
  const navigate = useNavigate();

  // Reassign Modal State
  const [reassigningRecord, setReassigningRecord] = useState<CallRecord | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OCZEKUJĄCA" | "ZAKOŃCZONA">("ALL");
  const [filterTargetSpecialist, setFilterTargetSpecialist] = useState<string>("ALL");
  const [filterSourceSpecialist, setFilterSourceSpecialist] = useState<string>("ALL");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("callDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Callers lookup Map for quick access
  const callersMap = useMemo(() => {
    const map = new Map<string, Caller>();
    for (let i = 0; i < callers.length; i++) {
      map.set(callers[i].id, callers[i]);
    }
    return map;
  }, [callers]);

  // All referred records
  const allReferredRecords = useMemo(() => {
    return records.filter((r) => Boolean(r.referredTo || r.referredSpecialistId));
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return allReferredRecords.filter((rec) => {
      // 1. Status filter
      const status = rec.referredStatus || "OCZEKUJĄCA";
      if (filterStatus !== "ALL" && status !== filterStatus) return false;

      // 2. Target specialist filter
      if (filterTargetSpecialist !== "ALL") {
        const matchesTargetId = rec.referredSpecialistId === filterTargetSpecialist;
        const targetSpec = specialists.find((s) => s.id === filterTargetSpecialist);
        const matchesTargetName =
          targetSpec &&
          rec.referredTo &&
          rec.referredTo.toLowerCase().includes(targetSpec.name.toLowerCase());
        if (!matchesTargetId && !matchesTargetName) return false;
      }

      // 3. Source specialist filter
      if (filterSourceSpecialist !== "ALL" && rec.specialistId !== filterSourceSpecialist) {
        return false;
      }

      // 4. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const caller = callersMap.get(rec.callerId);
        const callerFullName = caller ? `${caller.firstName} ${caller.lastName}`.toLowerCase() : "";
        const callerPhone = caller?.phoneNumber?.toLowerCase() || "";
        const callerCity = caller?.city?.toLowerCase() || "";
        const specSource = (rec.specialistName || "").toLowerCase();
        const specTarget = (rec.referredTo || "").toLowerCase();
        const note = (rec.referredNote || "").toLowerCase();
        const advice = (rec.adviceDescription || "").toLowerCase();

        const match =
          callerFullName.includes(q) ||
          callerPhone.includes(q) ||
          callerCity.includes(q) ||
          specSource.includes(q) ||
          specTarget.includes(q) ||
          note.includes(q) ||
          advice.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [allReferredRecords, filterStatus, filterTargetSpecialist, filterSourceSpecialist, searchQuery, callersMap, specialists]);

  // Sorted records
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "callDate":
          comparison = (a.callDate || a.createdAt).localeCompare(b.callDate || b.createdAt);
          break;
        case "callerName": {
          const cA = callersMap.get(a.callerId);
          const cB = callersMap.get(b.callerId);
          const nameA = cA ? `${cA.firstName} ${cA.lastName}` : "";
          const nameB = cB ? `${cB.firstName} ${cB.lastName}` : "";
          comparison = nameA.localeCompare(nameB, "pl");
          break;
        }
        case "specialistName":
          comparison = (a.specialistName || "").localeCompare(b.specialistName || "", "pl");
          break;
        case "referredTo":
          comparison = (a.referredTo || "").localeCompare(b.referredTo || "", "pl");
          break;
        case "status":
          comparison = (a.referredStatus || "OCZEKUJĄCA").localeCompare(b.referredStatus || "OCZEKUJĄCA");
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return list;
  }, [filteredRecords, sortField, sortDirection, callersMap]);

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterStatus("ALL");
    setFilterTargetSpecialist("ALL");
    setFilterSourceSpecialist("ALL");
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    filterStatus !== "ALL" ||
    filterTargetSpecialist !== "ALL" ||
    filterSourceSpecialist !== "ALL";

  const totalPending = allReferredRecords.filter(
    (r) => (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA"
  ).length;
  const totalResolved = allReferredRecords.filter(
    (r) => r.referredStatus === "ZAKOŃCZONA"
  ).length;

  const handleOpenCaller = (callerId: string) => {
    const caller = callersMap.get(callerId);
    if (caller) {
      setSelectedCaller(caller);
      navigate(`/callers/${callerId}`);
    }
  };

  const handleReassignSuccess = (updated: CallRecord) => {
    setSuccessToast(`Pomyślnie przepisano sprawę do: ${updated.referredTo}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-600 dark:text-[#FFB200]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-600 dark:text-[#FFB200]" />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-[#FFB200] rounded-2xl border border-amber-200 dark:border-amber-800/60">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Zarządzanie sprawami przekazanymi (Handoff)</span>
              <span className="text-xs bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-[#FFDF06] font-bold px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/80">
                {totalPending} oczekujących
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Przeglądaj przekazane konsultacje w całym zespole, zmieniaj przypisanych specjalistów i monitoruj statusy
            </p>
          </div>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Wszystkie przekazane
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {allReferredRecords.length}
            </h3>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-[#252018] text-slate-700 dark:text-slate-300 rounded-xl">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Oczekujące na kontakt
            </p>
            <h3 className="text-2xl font-black text-amber-950 dark:text-[#FFB200] mt-0.5">
              {totalPending}
            </h3>
          </div>
          <div className="p-3 bg-[#FFB200] text-[#2D2A28] rounded-xl shadow-xs">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Zakończone / załatwione
            </p>
            <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-300 mt-0.5">
              {totalResolved}
            </h3>
          </div>
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
          {/* Search input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj osoby, telefonu, specjalisty, notatki..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="lg:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
            >
              <option value="ALL">Wszystkie statusy</option>
              <option value="OCZEKUJĄCA">🟡 Tylko oczekujące</option>
              <option value="ZAKOŃCZONA">🟢 Tylko załatwione</option>
            </select>
          </div>

          {/* Target Specialist filter */}
          <div className="lg:col-span-4">
            <select
              value={filterTargetSpecialist}
              onChange={(e) => setFilterTargetSpecialist(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
            >
              <option value="ALL">Wszyscy przypisani specjaliści</option>
              {specialists.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  Skierowane do: {spec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Counters & Quick Reset */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-0.5">
          <div className="flex items-center space-x-2">
            <span>
              Wyniki: <strong className="text-slate-900 dark:text-white font-bold">{sortedRecords.length}</strong> z {allReferredRecords.length} spraw
            </span>
            {isFiltered && (
              <span className="bg-amber-100 dark:bg-[#2C2417] text-amber-900 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-md border border-amber-300 dark:border-amber-800">
                Filtrowanie aktywne
              </span>
            )}
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center space-x-1 font-bold text-amber-600 dark:text-[#FFB200] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Wyczyść filtry</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Mobile Card View (< md screens) */}
      <div className="md:hidden space-y-3">
        {paginatedRecords.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-slate-200 dark:border-[#383431] p-8 text-center shadow-xs">
            <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Brak spraw spełniających kryteria
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-2 px-3 py-1 bg-[#FFB200] text-[#2D2A28] rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Wyczyść filtry</span>
              </button>
            )}
          </div>
        ) : (
          paginatedRecords.map((rec) => {
            const caller = callersMap.get(rec.callerId);
            const status = rec.referredStatus || "OCZEKUJĄCA";

            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl p-4 shadow-xs space-y-3"
              >
                {/* Top: Caller & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                      {caller ? `${caller.firstName} ${caller.lastName}` : "Kontakt z bazy"}
                    </span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {caller?.phoneNumber || "Brak nr"} • {caller?.city || "—"} ({caller?.voivodeship})
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      status === "OCZEKUJĄCA"
                        ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-700/50"
                        : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50"
                    }`}
                  >
                    {status === "OCZEKUJĄCA" ? "🟡 Oczekuje" : "🟢 Załatwiona"}
                  </span>
                </div>

                {/* Assignment Box */}
                <div className="bg-slate-50 dark:bg-[#161514] rounded-xl p-2.5 text-xs space-y-1.5 border border-slate-100 dark:border-[#2C2927]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Przekazał/a:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{rec.specialistName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Skierowano do:</span>
                    <span className="font-bold text-amber-700 dark:text-[#FFB200]">{rec.referredTo || "Nie określono"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-200/50 dark:border-[#2C2927]">
                    <span>Data:</span>
                    <span>{new Date(rec.callDate || rec.createdAt).toLocaleDateString("pl-PL")}</span>
                  </div>
                </div>

                {/* Note */}
                {rec.referredNote && (
                  <div className="bg-amber-50/60 dark:bg-[#252018] border border-amber-200/60 dark:border-amber-900/40 p-2.5 rounded-xl text-[11px] text-amber-950 dark:text-[#FFB200]">
                    <div className="font-bold text-[10px] text-amber-900 dark:text-[#FFDF06] mb-0.5">Wytyczne:</div>
                    <p className="line-clamp-2">{rec.referredNote}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-[#2C2927]">
                  <button
                    type="button"
                    onClick={() => caller && handleOpenCaller(caller.id)}
                    className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Kartoteka</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        markReferralStatus(rec.id, status === "OCZEKUJĄCA" ? "ZAKOŃCZONA" : "OCZEKUJĄCA")
                      }
                      title={status === "OCZEKUJĄCA" ? "Oznacz jako załatwioną" : "Przywróć jako oczekującą"}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#282522] hover:bg-slate-200 dark:hover:bg-[#34302E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#383431] transition-colors cursor-pointer"
                    >
                      {status === "OCZEKUJĄCA" ? "✓ Załatwiona" : "↺ Oczekująca"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setReassigningRecord(rec)}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] shadow-xs flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Przepisz</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop Streamlined Table View (>= md screens: 100% width, no horizontal scrollbar) */}
      <div className="hidden md:block bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse table-fixed">
          <thead className="bg-slate-50/90 dark:bg-[#252018] border-b border-slate-200 dark:border-[#383431] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] select-none">
            <tr>
              {/* Beneficjent i kontakt */}
              <th
                onClick={() => handleSort("callerName")}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group whitespace-nowrap w-[27%]"
              >
                <div className="flex items-center space-x-1">
                  <span>Beneficjent i kontakt</span>
                  {renderSortIcon("callerName")}
                </div>
              </th>

              {/* Przebieg przekazania: Kto ➔ Do kogo */}
              <th
                onClick={() => handleSort("referredTo")}
                className="py-3 px-2.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group whitespace-nowrap w-[27%]"
              >
                <div className="flex items-center space-x-1">
                  <span>Przebieg (Od ➔ Do)</span>
                  {renderSortIcon("referredTo")}
                </div>
              </th>

              {/* Wytyczne / Notatka */}
              <th className="py-3 px-2.5 w-[20%]">
                <span>Wytyczne / notatka</span>
              </th>

              {/* Status */}
              <th
                onClick={() => handleSort("status")}
                className="py-3 px-2 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group whitespace-nowrap w-[11%]"
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {renderSortIcon("status")}
                </div>
              </th>

              {/* Akcje */}
              <th className="py-3 px-3 text-right whitespace-nowrap w-[15%]">
                <span>Akcje</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2C2927]">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                  <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Brak spraw przekazanych spełniających kryteria
                  </p>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="mt-2.5 px-3 py-1 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Wyczyść filtry</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec) => {
                const caller = callersMap.get(rec.callerId);
                const status = rec.referredStatus || "OCZEKUJĄCA";

                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#24211E] transition-colors"
                  >
                    {/* Beneficjent i kontakt */}
                    <td className="py-3 px-3.5">
                      <div className="min-w-0 pr-1">
                        <div
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight truncate"
                          title={caller ? `${caller.firstName} ${caller.lastName}` : "Kontakt z bazy"}
                        >
                          {caller ? `${caller.firstName} ${caller.lastName}` : "Kontakt z bazy"}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                          {caller?.phoneNumber || "Brak nr"} • {caller?.city || "—"} ({caller?.voivodeship})
                        </div>
                      </div>
                    </td>

                    {/* Przebieg przekazania: Źródło ➔ Cel */}
                    <td className="py-3 px-2.5">
                      <div className="min-w-0 pr-1 space-y-0.5">
                        <div className="flex items-center space-x-1 text-xs truncate">
                          <span
                            className="font-medium text-slate-700 dark:text-slate-300 truncate"
                            title={rec.specialistName}
                          >
                            {rec.specialistName}
                          </span>
                          <ArrowRight className="w-3 h-3 text-amber-500 shrink-0 inline" />
                          <span
                            className="font-bold text-amber-900 dark:text-[#FFDF06] truncate"
                            title={rec.referredTo || "Nie określono"}
                          >
                            {rec.referredTo || "Nie określono"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(rec.callDate || rec.createdAt).toLocaleDateString("pl-PL")}
                        </div>
                      </div>
                    </td>

                    {/* Wytyczne / Notatka */}
                    <td className="py-3 px-2.5">
                      <div className="min-w-0 pr-1">
                        {rec.referredNote ? (
                          <p
                            className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-medium"
                            title={rec.referredNote}
                          >
                            {rec.referredNote}
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Brak</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      {status === "OCZEKUJĄCA" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
                          🟡 Oczekuje
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
                          🟢 Załatwiona
                        </span>
                      )}
                    </td>

                    {/* Akcje */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        {caller && (
                          <button
                            type="button"
                            onClick={() => handleOpenCaller(caller.id)}
                            title="Otwórz kartotekę kontaktu"
                            className="p-1 rounded-lg text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-[#282522] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            markReferralStatus(rec.id, status === "OCZEKUJĄCA" ? "ZAKOŃCZONA" : "OCZEKUJĄCA")
                          }
                          title={status === "OCZEKUJĄCA" ? "Oznacz jako załatwioną" : "Przywróć jako oczekującą"}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            status === "OCZEKUJĄCA"
                              ? "text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              : "text-slate-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setReassigningRecord(rec)}
                          title="Zmień przypisanego specjalistę (Przepisz sprawę)"
                          className="px-2 py-1 rounded-lg text-xs font-black bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] shadow-xs flex items-center space-x-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Przepisz</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedRecords.length > 0 && (
        <div className="bg-slate-50 dark:bg-[#252018] border border-slate-200 dark:border-[#383431] rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 flex-wrap gap-y-1">
            <span>
              Pozycje{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                {(currentPage - 1) * pageSize + 1}
              </strong>
              -
              <strong className="text-slate-900 dark:text-white font-bold">
                {Math.min(currentPage * pageSize, sortedRecords.length)}
              </strong>{" "}
              z{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                {sortedRecords.length}
              </strong>
            </span>

            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

            <div className="flex items-center space-x-1.5">
              <span>Pokaż:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-lg px-2 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-2.5 py-1 bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2C2927] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center space-x-0.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Poprzednia</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                        : "bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2C2927]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2C2927] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center space-x-0.5 cursor-pointer"
              >
                <span className="hidden sm:inline">Następna</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reassign Referral Modal */}
      {reassigningRecord && (
        <ReassignReferralModal
          isOpen={Boolean(reassigningRecord)}
          record={reassigningRecord}
          onClose={() => setReassigningRecord(null)}
          onSuccess={handleReassignSuccess}
        />
      )}
    </div>
  );
};
