import React, { useState, useRef, useEffect } from "react";
import { Specialist } from "../types";
import { normalizeText } from "../services/storage";
import { SpecialistAvatar } from "./SpecialistAvatar";
import {
  Share2,
  Mail,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

interface Props {
  specialists: Specialist[];
  currentSpecialist: Specialist;
  selectedSpecialistId: string;
  onSelectSpecialist: (specialist: Specialist | null) => void;
  referralNote: string;
  onChangeNote: (note: string) => void;
}

export const ReferralSelector: React.FC<Props> = ({
  specialists,
  currentSpecialist,
  selectedSpecialistId,
  onSelectSpecialist,
  referralNote,
  onChangeNote,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherSpecialists = specialists.filter((s) => s.id !== currentSpecialist.id);
  const selectedSpec = specialists.find((s) => s.id === selectedSpecialistId);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter specialists based on search query
  const filteredSpecialists = otherSpecialists.filter((spec) => {
    if (!searchTerm.trim()) return true;
    const queryNorm = normalizeText(searchTerm);
    const nameNorm = normalizeText(spec.name);
    const roleNorm = normalizeText(spec.role || "");
    const emailNorm = normalizeText(spec.email || "");
    const titleNorm = normalizeText(spec.title || "");
    const guidanceNorm = normalizeText(spec.guidanceType || "");

    return (
      nameNorm.includes(queryNorm) ||
      roleNorm.includes(queryNorm) ||
      emailNorm.includes(queryNorm) ||
      titleNorm.includes(queryNorm) ||
      guidanceNorm.includes(queryNorm)
    );
  });

  const handleSelect = (spec: Specialist) => {
    onSelectSpecialist(spec);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectSpecialist(null);
    setSearchTerm("");
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div
      ref={containerRef}
      className="bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
          <Share2 className="w-4 h-4 text-[#296B6E] dark:text-[#FFB200]" />
          <span>7. Przekazanie sprawy innemu specjaliście dyżurującemu (opcjonalnie):</span>
        </label>
        {selectedSpecialistId && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Wyczyść przekazanie</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        Wpisz nazwisko, rolę lub specjalizację, aby wybrać dyżurującego konsultanta. Po zapisaniu otrzyma on <strong>automatyczne powiadomienie e-mail</strong> i sprawa trafi do jego kolejki.
      </p>

      {/* When NO specialist is selected -> Search / Autocomplete Input */}
      {!selectedSpec ? (
        <div className="relative">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Wpisz imię, nazwisko lub rolę (np. Anna, Joanna, radca prawny, psycholog)..."
              className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#FFB200] focus:outline-none transition-all shadow-2xs"
            />

            <button
              type="button"
              onClick={() => {
                setIsOpen((prev) => !prev);
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (
            <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in duration-150">
              <div className="p-1.5 space-y-1">
                {filteredSpecialists.length > 0 ? (
                  filteredSpecialists.map((spec) => (
                    <div
                      key={spec.id}
                      onClick={() => handleSelect(spec)}
                      className="p-2.5 rounded-xl hover:bg-amber-50/80 dark:hover:bg-[#2A2724] border border-transparent hover:border-amber-200/80 dark:hover:border-[#FFB200]/30 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <SpecialistAvatar
                          name={spec.name}
                          avatarBg={spec.avatarBg || "bg-amber-600"}
                          avatarUrl={spec.avatarUrl}
                          className="w-7 h-7 rounded-xl font-bold text-xs shrink-0 shadow-2xs"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#2D2A28] dark:group-hover:text-[#FFB200] truncate">
                              {spec.name}
                            </span>
                            {spec.isAdmin && (
                              <span className="text-[9px] bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#1F5254] dark:text-[#FFB200] font-bold truncate">
                            {spec.role}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1 shrink-0 ml-2">
                        <Mail className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span className="hidden sm:inline">{spec.email}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-600 dark:text-slate-400">
                    Brak konsultantów pasujących do zapytania „{searchTerm}”
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* When a Specialist IS SELECTED -> Clean Card Preview */
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-[#FFB200] ring-2 ring-[#FFB200]/20 rounded-2xl p-3.5 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-3 min-w-0">
            <SpecialistAvatar
              name={selectedSpec.name}
              avatarBg={selectedSpec.avatarBg || "bg-amber-600"}
              avatarUrl={selectedSpec.avatarUrl}
              className="w-9 h-9 rounded-xl font-black text-sm shrink-0 shadow-xs"
            />

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-slate-900 dark:text-white text-xs truncate">
                  {selectedSpec.name}
                </span>
                {selectedSpec.isAdmin && (
                  <span className="text-[9px] bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold">
                    Admin
                  </span>
                )}
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  Wybrano
                </span>
              </div>
              <div className="text-[11px] text-[#1F5254] dark:text-[#FFB200] font-bold truncate">
                {selectedSpec.role}
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{selectedSpec.email}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1.5 bg-white dark:bg-[#1E1C1A] hover:bg-slate-100 dark:hover:bg-[#2D2A28] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-300 dark:border-[#383431] transition-all flex items-center gap-1 cursor-pointer shrink-0 ml-2 shadow-2xs"
            title="Zmień konsultanta"
          >
            <X className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Zmień</span>
          </button>
        </div>
      )}

      {/* If a specialist is selected, show Auto Email Notification & Notes Field */}
      {selectedSpec && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#2C2927] space-y-2.5 animate-in fade-in">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-300">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Powiadomienie e-mail zostanie wysłane do <strong>{selectedSpec.name}</strong> na adres:{" "}
                <strong className="font-mono">{selectedSpec.email}</strong>
              </span>
            </div>
            <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-800/60 font-bold px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200 shrink-0">
              Auto E-mail
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
              Notatka / wytyczne dla specjalisty {selectedSpec.name} (opcjonalnie):
            </label>
            <textarea
              rows={2}
              value={referralNote}
              onChange={(e) => onChangeNote(e.target.value)}
              placeholder="Np. Pilna prośba o kontakt telefoniczny w sprawie analizy punktu 7 i 8 orzeczenia WZON..."
              className="w-full bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
