import React from "react";
import { Specialist } from "../types";
import { Share2, Mail, CheckCircle2, User, Info, ArrowRight } from "lucide-react";

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
  const otherSpecialists = specialists.filter((s) => s.id !== currentSpecialist.id);
  const selectedSpec = specialists.find((s) => s.id === selectedSpecialistId);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
          <Share2 className="w-4 h-4 text-indigo-600" />
          <span>7. Przekazanie sprawy innemu specjaliście dyżurującemu (opcjonalnie):</span>
        </label>
        {selectedSpecialistId && (
          <button
            type="button"
            onClick={() => onSelectSpecialist(null)}
            className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold cursor-pointer"
          >
            Wyczyść przekazanie
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-500">
        Wybierz dyżurującego specjalistę, który powinien przejąć lub skonsultować tę sprawę. Po zapisaniu otrzyma on <strong>automatyczne powiadomienie e-mail</strong> oraz sprawa trafi do jego kolejki zadań.
      </p>

      {/* Specialist Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {otherSpecialists.map((spec) => {
          const isSelected = selectedSpecialistId === spec.id;
          return (
            <div
              key={spec.id}
              onClick={() => onSelectSpecialist(isSelected ? null : spec)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                isSelected
                  ? "bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                  : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-indigo-600" : "bg-slate-300"}`} />
                  <span className="font-bold text-slate-900 text-xs truncate">{spec.name}</span>
                </div>
                <div className="text-[11px] text-indigo-700 font-medium mt-0.5 ml-3.5 truncate">
                  {spec.role}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-1 ml-3.5">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-600 truncate">{spec.email}</span>
                </div>
              </div>

              {isSelected && (
                <div className="shrink-0 text-indigo-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* If a specialist is selected, show Email Dispatch preview and Note field */}
      {selectedSpec && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5 animate-in fade-in">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Powiadomienie e-mail zostanie wysłane na: <strong className="font-mono">{selectedSpec.email}</strong>
              </span>
            </div>
            <span className="text-[10px] bg-emerald-200/60 font-bold px-2 py-0.5 rounded text-emerald-900">
              Auto E-mail
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Notatka / wytyczne dla specjalisty {selectedSpec.name} (opcjonalnie):
            </label>
            <textarea
              rows={2}
              value={referralNote}
              onChange={(e) => onChangeNote(e.target.value)}
              placeholder="Np. Pilna prośba o kontakt telefoniczny w sprawie analizy punktu 7 i 8 orzeczenia WZON..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
