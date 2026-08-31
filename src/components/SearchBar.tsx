import React, { useRef } from "react";
import { useApp } from "../context/AppContext";
import { Search, X, Sparkles } from "lucide-react";

export const SearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    callers,
    currentSpecialist,
    showDemoFeatures,
  } = useApp();

  const inputRef = useRef<HTMLInputElement>(null);

  const sampleSearches = [
    { label: "Kowalska (wielokrotny kontakt)", query: "Kowalska" },
    { label: "Nr tel: 601 234 567", query: "601 234 567" },
    { label: "Zieliński (dorosły w spektrum)", query: "Zieliński" },
    { label: "Dąbrowska (Kraków)", query: "Dąbrowska" },
  ];

  // Szybki test jest domyślnie ukryty i widoczny TYLKO dla administratora po włączeniu opcji demo
  const isDemoVisible = Boolean(currentSpecialist?.isAdmin && showDemoFeatures);

  return (
    <div className="w-full bg-white dark:bg-[#242220] rounded-2xl shadow-sm border border-slate-200 dark:border-[#3E3A37] p-4 transition-all">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-500 dark:text-slate-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Wpisz imię, nazwisko, numer telefonu lub miejscowość kontaktu..."
          className="w-full pl-11 pr-24 py-3 bg-slate-50 dark:bg-[#1A1918] border border-slate-300 dark:border-[#3E3A37] rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200] transition-all shadow-inner"
        />

        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#34302E] transition-colors cursor-pointer"
            title="Wyczyść wyszukiwanie"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Quick Search Chips (Admin Demo Mode Only) */}
      {isDemoVisible && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#3E3A37] text-xs text-slate-600 dark:text-slate-300 animate-in fade-in">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-amber-700 dark:text-[#FFDF06] flex items-center mr-1">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-[#FFB200]" /> Szybki test (Tryb demo admina):
            </span>
            {sampleSearches.map((item) => (
              <button
                key={item.query}
                onClick={() => setSearchQuery(item.query)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors border cursor-pointer font-medium ${
                  searchQuery === item.query
                    ? "bg-[#FFB200]/20 text-amber-950 dark:text-[#FFDF06] border-[#FFB200]/60 font-bold"
                    : "bg-slate-100/90 dark:bg-[#1A1918] hover:bg-slate-200 dark:hover:bg-[#2D2A28] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#3E3A37]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            W bazie: <strong className="text-slate-900 dark:text-slate-100 font-bold">{callers.length}</strong> zarejestrowanych kontaktów
          </div>
        </div>
      )}
    </div>
  );
};
