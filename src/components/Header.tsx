import React, { useState } from "react";
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
  Inbox,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { ReferredCasesModal } from "./ReferredCasesModal";

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
    getReferredRecordsForSpecialist,
  } = useApp();

  const [isReferredModalOpen, setIsReferredModalOpen] = useState(false);

  const myReferredCases = getReferredRecordsForSpecialist(currentSpecialist.id);
  const pendingReferredCount = myReferredCases.filter(
    (r) => (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA"
  ).length;

  const handleTabChange = (tab: "SEARCH" | "ALL_RECORDS" | "STATS") => {
    setSelectedCaller(null);
    setActiveTab(tab);
  };

  return (
    <header className="bg-[#2D2A28] text-white shadow-md border-b border-[#3E3A37] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* 1. Left: Branding */}
          <div
            onClick={() => handleTabChange("SEARCH")}
            className="flex items-center space-x-3 cursor-pointer shrink-0 select-none group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#FFB200] via-[#FFB200] to-[#E5A000] rounded-xl text-[#2D2A28] shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-black text-base tracking-tight text-white whitespace-nowrap">
                  Baza Porad
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block whitespace-nowrap leading-tight mt-0.5">
                Wspólna historia rozmów dla dyżurujących specjalistów
              </p>
            </div>
          </div>

          {/* 2. Center: Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-[#242220] p-1 rounded-xl border border-[#3E3A37] shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange("SEARCH")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "SEARCH" && !selectedCaller
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#34302E]"
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Kartoteka i szukaj</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ALL_RECORDS")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "ALL_RECORDS" && !selectedCaller
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#34302E]"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 shrink-0" />
              <span>Wszystkie wpisy</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("STATS")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "STATS" && !selectedCaller
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#34302E]"
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
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
              title="Zarejestruj nowy kontakt"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Nowy kontakt</span>
            </button>

            {/* Excel Importer */}
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#242220] hover:bg-[#34302E] text-slate-200 border border-[#3E3A37] transition-colors cursor-pointer whitespace-nowrap"
              title="Migracja z pliku Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline">Import</span>
            </button>

            {/* CSV Exporter */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#242220] hover:bg-[#34302E] text-slate-200 border border-[#3E3A37] transition-colors cursor-pointer whitespace-nowrap"
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#34302E] border border-[#3E3A37] transition-colors cursor-pointer shrink-0"
              title="Przywróć dane demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Specialist Profile Selector */}
            <div className="border-l border-[#3E3A37] pl-2 ml-0.5">
              <div className="flex items-center space-x-2 bg-[#242220] py-1 px-2.5 rounded-xl border border-[#3E3A37]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div className="text-left">
                  <div className="text-[9px] font-bold leading-none flex items-center gap-1">
                    {currentSpecialist.isAdmin ? (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Administrator:</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Dyżurujący:</span>
                    )}
                  </div>
                  <select
                    value={currentSpecialist.id}
                    onChange={(e) => {
                      const found = specialists.find((s) => s.id === e.target.value);
                      if (found) setCurrentSpecialist(found);
                    }}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1 max-w-[170px] sm:max-w-[220px] truncate"
                  >
                    {specialists.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white font-medium">
                        {s.isAdmin ? `🛡️ ${s.name}` : `🟢 ${s.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReferredCasesModal isOpen={isReferredModalOpen} onClose={() => setIsReferredModalOpen(false)} />
    </header>
  );
};
