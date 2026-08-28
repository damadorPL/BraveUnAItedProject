import React, { useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Search, X, UserPlus, Sparkles, Phone, MapPin } from "lucide-react";

export const SearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filteredCallers,
    setIsNewCallerModalOpen,
    setSelectedCaller,
    callers,
  } = useApp();

  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" or "Ctrl+K" focuses search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sampleSearches = [
    { label: "Kowalska (wielokrotny kontakt)", query: "Kowalska" },
    { label: "Nr tel: 601 234 567", query: "601 234 567" },
    { label: "Zieliński (dorosły w spektrum)", query: "Zieliński" },
    { label: "Dąbrowska (Kraków)", query: "Dąbrowska" },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4 transition-all">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Wpisz imię, nazwisko, numer telefonu lub miejscowość dzwoniącego... (Skrót: /)"
          className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
        />

        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            title="Wyczyść wyszukiwanie"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute right-3 flex items-center space-x-1 text-[11px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded border border-slate-300 pointer-events-none font-mono">
            <span>/</span>
          </div>
        )}
      </div>

      {/* Quick Search Chips & Fast Info */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center mr-1">
            <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Szybki test:
          </span>
          {sampleSearches.map((item) => (
            <button
              key={item.query}
              onClick={() => setSearchQuery(item.query)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                searchQuery === item.query
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                  : "bg-slate-100/70 hover:bg-slate-200/70 text-slate-600 border-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-medium text-slate-400">
          W bazie: <strong className="text-slate-700">{callers.length}</strong> osób dzwoniących
        </div>
      </div>
    </div>
  );
};
