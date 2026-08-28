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
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div
            onClick={() => handleTabChange("SEARCH")}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md flex items-center justify-center">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Baza porad ASD
                </span>
                <span className="text-xs bg-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/40">
                  PFRON
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Wspólna historia rozmów dla dyżurujących specjalistów
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleTabChange("SEARCH")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "SEARCH" && !selectedCaller
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Kartoteka i szukaj</span>
            </button>

            <button
              onClick={() => handleTabChange("ALL_RECORDS")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "ALL_RECORDS" && !selectedCaller
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Wszystkie wpisy</span>
            </button>

            <button
              onClick={() => handleTabChange("STATS")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "STATS" && !selectedCaller
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Raporty PFRON</span>
            </button>
          </nav>

          {/* Actions & Specialist Switcher */}
          <div className="flex items-center space-x-2.5">
            {/* New Caller Button */}
            <button
              onClick={() => setIsNewCallerModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors cursor-pointer"
              title="Zarejestruj nową osobę dzwoniącą"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nowy Dzwoniący</span>
            </button>

            {/* Excel Importer */}
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Migracja z dotychczasowego pliku Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Import Excel</span>
            </button>

            {/* CSV Exporter */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Eksportuj zestawienie wpisów do pliku CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Eksport CSV</span>
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={() => {
                if (window.confirm("Czy na pewno chcesz przywrócić początkową bazę danych demo?")) {
                  resetDatabase();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
              title="Resetuj dane demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Specialist Profile Selector */}
            <div className="border-l border-slate-700 pl-2.5 ml-1 flex items-center">
              <div className="flex items-center space-x-2 bg-slate-800/90 py-1 px-2.5 rounded-xl border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Dyżur aktywny" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Dyżurujący:
                  </div>
                  <select
                    value={currentSpecialist.id}
                    onChange={(e) => {
                      const found = specialists.find((s) => s.id === e.target.value);
                      if (found) setCurrentSpecialist(found);
                    }}
                    className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer pr-1"
                  >
                    {specialists.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name} ({s.role})
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
