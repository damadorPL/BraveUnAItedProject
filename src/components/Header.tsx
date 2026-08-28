import React from "react";
import { useApp } from "../context/AppContext";
import {
  PhoneCall,
  FileSpreadsheet,
  Download,
  UserPlus,
  RotateCcw,
  Search,
  ListFilter,
  BarChart3,
  ChevronDown,
} from "lucide-react";

export const Header: React.FC = () => {
  const {
    currentSpecialist,
    setCurrentSpecialist,
    specialists,
    activeTab,
    setActiveTab,
    selectedCaller,
    setSelectedCaller,
    setIsNewCallerModalOpen,
    setIsExcelModalOpen,
    setIsExportModalOpen,
    resetDatabase,
  } = useApp();

  const handleTabChange = (tab: "SEARCH" | "ALL_RECORDS" | "STATS") => {
    setSelectedCaller(null);
    setActiveTab(tab);
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* 1. Left: Branding */}
          <div
            onClick={() => handleTabChange("SEARCH")}
            className="flex items-center space-x-3 cursor-pointer shrink-0 select-none group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl text-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base tracking-tight text-white whitespace-nowrap">
                  Baza Porad ASD
                </span>
                <span className="text-[10px] font-extrabold bg-indigo-500/25 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/40">
                  PFRON
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xl:block whitespace-nowrap leading-none mt-0.5">
                Wspólna historia rozmów dla dyżurujących specjalistów
              </p>
            </div>
          </div>

          {/* 2. Center: Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange("SEARCH")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "SEARCH" && !selectedCaller
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Kartoteka i szukaj</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ALL_RECORDS")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "ALL_RECORDS" && !selectedCaller
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 shrink-0" />
              <span>Wszystkie wpisy</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("STATS")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "STATS" && !selectedCaller
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>Raporty PFRON</span>
            </button>
          </nav>

          {/* 3. Right: Actions & Specialist Switcher */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* New Caller Primary CTA */}
            <button
              type="button"
              onClick={() => setIsNewCallerModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
              title="Zarejestruj nowy kontakt"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Nowy kontakt</span>
            </button>

            {/* Excel Importer */}
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              title="Migracja z pliku Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline">Import</span>
            </button>

            {/* CSV Exporter */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              title="Eksportuj do CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden lg:inline">Eksport</span>
            </button>

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Czy na pewno chcesz przywrócić początkową bazę danych demo?")) {
                  resetDatabase();
                }
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer shrink-0"
              title="Przywróć dane demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Specialist Profile Selector */}
            <div className="border-l border-slate-800 pl-2 ml-0.5">
              <div className="flex items-center space-x-2 bg-slate-800/90 py-1 px-2.5 rounded-xl border border-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div className="text-left">
                  <div className="text-[9px] text-slate-400 font-bold leading-none">
                    Dyżurujący:
                  </div>
                  <select
                    value={currentSpecialist.id}
                    onChange={(e) => {
                      const found = specialists.find((s) => s.id === e.target.value);
                      if (found) setCurrentSpecialist(found);
                    }}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1 max-w-[150px] sm:max-w-[200px] truncate"
                  >
                    {specialists.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
