import React, { useEffect, useState } from "react";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import {
  Inbox,
  X,
  Phone,
  MapPin,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  PlusCircle,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferredCasesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    getReferredRecordsForSpecialist,
    callers,
    setSelectedCaller,
    setIsNewRecordModalOpen,
    markReferralStatus,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [activeFilter, setActiveFilter] = useState<"ALL" | "OCZEKUJĄCA" | "ZAKOŃCZONA">("OCZEKUJĄCA");

  useEffect(() => {
    if (isOpen) setActiveFilter("OCZEKUJĄCA");
  }, [isOpen]);

  if (!isOpen) return null;

  const myCases = getReferredRecordsForSpecialist(currentSpecialist.id);

  const filteredCases = myCases.filter((rec) => {
    if (activeFilter === "ALL") return true;
    const st = rec.referredStatus || "OCZEKUJĄCA";
    return st === activeFilter;
  });

  const handleOpenCaller = (callerId: string) => {
    const caller = callers.find((c) => c.id === callerId);
    if (caller) {
      setSelectedCaller(caller);
      onClose();
    }
  };

  const handleStartConsultation = (callerId: string) => {
    const caller = callers.find((c) => c.id === callerId);
    if (caller) {
      setSelectedCaller(caller);
      setIsNewRecordModalOpen(true);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#FFB200]/20 text-[#FFB200] rounded-2xl border border-[#FFB200]/40">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Sprawy przekazane do Ciebie</h2>
                <span className="text-xs bg-[#FFB200] text-[#2D2A28] font-black px-2.5 py-0.5 rounded-full">
                  {myCases.length} {myCases.length === 1 ? "sprawa" : "sprawy"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Zalogowany dyżurujący: <strong>{currentSpecialist.name}</strong> ({currentSpecialist.email})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 dark:bg-[#161514] border-b border-slate-200 dark:border-[#2C2927] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "ALL"
                  ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] shadow-xs"
                  : "bg-white dark:bg-[#1E1C1A] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2A2724] border border-slate-200 dark:border-[#383431]"
              }`}
            >
              Wszystkie ({myCases.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("OCZEKUJĄCA")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "OCZEKUJĄCA"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white dark:bg-[#1E1C1A] text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-200 dark:border-amber-700/50"
              }`}
            >
              Oczekujące na kontakt ({myCases.filter((r) => (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("ZAKOŃCZONA")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "ZAKOŃCZONA"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-[#1E1C1A] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/50"
              }`}
            >
              Zakończone ({myCases.filter((r) => r.referredStatus === "ZAKOŃCZONA").length})
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Powiadomienia e-mail są wysyłane natychmiast po przekazaniu
          </div>
        </div>

        {/* Body List */}
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-100/50 dark:bg-[#141312] flex-1">
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl border border-slate-200 dark:border-[#383431] p-12 text-center shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Brak oczekujących spraw do załatwienia</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Nie masz obecnie żadnych przekazanych konsultacji wymagających Twojej interwencji.
              </p>
            </div>
          ) : (
            filteredCases.map((rec) => {
              const caller = callers.find((c) => c.id === rec.callerId);
              const status = rec.referredStatus || "OCZEKUJĄCA";

              return (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-3.5"
                >
                  {/* Top Bar: Caller name, Referring specialist, Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#2C2927]">
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {caller ? `${caller.firstName} ${caller.lastName}` : "Kontakt z bazy"}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          status === "OCZEKUJĄCA"
                            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700/50"
                            : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50"
                        }`}>
                          {status === "OCZEKUJĄCA" ? "🟡 Oczekuje na kontakt" : "🟢 Załatwiona"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500" />
                          <strong className="text-slate-800 dark:text-slate-200 font-mono">{caller?.phoneNumber || "Brak nr"}</strong>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500" />
                          {caller?.city || "—"}, {caller?.voivodeship}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                      <div>Przekazał/a: <strong className="text-slate-800 dark:text-slate-200">{rec.specialistName}</strong></div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Data: {new Date(rec.callDate || rec.createdAt).toLocaleDateString("pl-PL")}
                      </div>
                    </div>
                  </div>

                  {/* Referral Note & Advice context */}
                  <div className="space-y-2 text-xs">
                    {rec.referredNote && (
                      <div className="bg-amber-50 dark:bg-[#241E15] border border-amber-200/80 dark:border-amber-600/40 rounded-2xl p-3.5 text-amber-950 dark:text-[#FFB200]">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-[#FFB200] text-[11px] mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-[#FFB200]" />
                          <span>Notatka / wytyczne od {rec.specialistName}:</span>
                        </div>
                        <p className="leading-relaxed font-medium">{rec.referredNote}</p>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-[#161514] border border-slate-200 dark:border-[#2C2927] rounded-2xl p-3 text-slate-700 dark:text-slate-300">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                        Czego dotyczyła wcześniejsza porada:
                      </div>
                      <p className="line-clamp-2 text-slate-800 dark:text-slate-200">{rec.adviceDescription}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-[#2C2927]">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => markReferralStatus(rec.id, status === "OCZEKUJĄCA" ? "ZAKOŃCZONA" : "OCZEKUJĄCA")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          status === "OCZEKUJĄCA"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                            : "bg-slate-50 dark:bg-[#161514] hover:bg-slate-100 dark:hover:bg-[#2A2724] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431]"
                        }`}
                      >
                        {status === "OCZEKUJĄCA" ? "✓ Oznacz jako załatwioną" : "↺ Przywróć jako oczekującą"}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {caller && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenCaller(caller.id)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#161514] hover:bg-slate-50 dark:hover:bg-[#2A2724] text-slate-700 dark:text-slate-200 rounded-xl font-bold border border-slate-200 dark:border-[#383431] text-xs shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>Otwórz kartotekę</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#296B6E] dark:text-[#FFB200]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartConsultation(caller.id)}
                            className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl font-black text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Zarejestruj swoją poradę</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
