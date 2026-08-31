import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import { CallRecord } from "../types";
import { ReassignReferralModal } from "./ReassignReferralModal";
import {
  Inbox,
  X,
  Phone,
  MapPin,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Users,
  UserCheck,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferredCasesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    getReferredRecordsForSpecialist,
    records,
    specialists,
    callers,
    setSelectedCaller,
    setIsNewRecordModalOpen,
    markReferralStatus,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();
  const navigate = useNavigate();

  const [activeStatusFilter, setActiveStatusFilter] = useState<"ALL" | "OCZEKUJĄCA" | "ZAKOŃCZONA">("OCZEKUJĄCA");
  const [selectedSpecialistScope, setSelectedSpecialistScope] = useState<string>("ALL");
  const [reassigningRecord, setReassigningRecord] = useState<CallRecord | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveStatusFilter("OCZEKUJĄCA");
      setSelectedSpecialistScope("ALL");
    }
  }

  // All referred records across the foundation
  const allReferredRecords = useMemo(() => {
    return records.filter((r) => Boolean(r.referredTo || r.referredSpecialistId));
  }, [records]);

  // Personal cases
  const myCases = useMemo(() => {
    return getReferredRecordsForSpecialist(currentSpecialist.id);
  }, [getReferredRecordsForSpecialist, currentSpecialist.id]);

  // Scope: if not admin, always myCases; if admin, depends on selectedSpecialistScope
  const scopedRecords = useMemo(() => {
    if (!currentSpecialist.isAdmin) return myCases;
    if (selectedSpecialistScope === "ALL") return allReferredRecords;
    if (selectedSpecialistScope === "ME") return myCases;
    return getReferredRecordsForSpecialist(selectedSpecialistScope);
  }, [currentSpecialist.isAdmin, selectedSpecialistScope, myCases, allReferredRecords, getReferredRecordsForSpecialist]);

  // Filtered by status
  const filteredCases = useMemo(() => {
    return scopedRecords.filter((rec) => {
      if (activeStatusFilter === "ALL") return true;
      const st = rec.referredStatus || "OCZEKUJĄCA";
      return st === activeStatusFilter;
    });
  }, [scopedRecords, activeStatusFilter]);

  if (!isOpen) return null;

  const handleOpenCaller = (callerId: string) => {
    const caller = callers.find((c) => c.id === callerId);
    if (caller) {
      setSelectedCaller(caller);
      onClose();
      navigate(`/callers/${callerId}`);
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

  const handleReassignSuccess = (updated: CallRecord) => {
    setSuccessToast(`Pomyślnie przepisano sprawę do: ${updated.referredTo}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const pendingCount = scopedRecords.filter(
    (r) => (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA"
  ).length;
  const completedCount = scopedRecords.filter(
    (r) => r.referredStatus === "ZAKOŃCZONA"
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#FFB200]/20 text-[#FFB200] rounded-2xl border border-[#FFB200]/40">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-lg font-bold text-white">
                  {currentSpecialist.isAdmin
                    ? "Przekazane sprawy i konsultacje (Handoff)"
                    : "Sprawy przekazane do Ciebie"}
                </h2>
                {currentSpecialist.isAdmin && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Tryb administratora
                  </span>
                )}
                <span className="text-xs bg-[#FFB200] text-[#2D2A28] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                  {scopedRecords.length} {scopedRecords.length === 1 ? "sprawa" : "spraw"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentSpecialist.isAdmin
                  ? `Jako administrator możesz przeglądać i zarządzać sprawami przekazanymi w całym zespole Fundacji SYNAPSIS.`
                  : `Zalogowany dyżurujący: ${currentSpecialist.name} (${currentSpecialist.email})`}
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

        {/* Success Banner */}
        {successToast && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-5 py-2.5 text-xs font-bold flex items-center space-x-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-slate-50 dark:bg-[#161514] border-b border-slate-200 dark:border-[#2C2927] px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Status buttons */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            <button
              type="button"
              onClick={() => setActiveStatusFilter("OCZEKUJĄCA")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === "OCZEKUJĄCA"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white dark:bg-[#1E1C1A] text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-200 dark:border-amber-700/50"
              }`}
            >
              Oczekujące na kontakt ({pendingCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === "ALL"
                  ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] shadow-xs"
                  : "bg-white dark:bg-[#1E1C1A] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2A2724] border border-slate-200 dark:border-[#383431]"
              }`}
            >
              Wszystkie ({scopedRecords.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusFilter("ZAKOŃCZONA")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === "ZAKOŃCZONA"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-[#1E1C1A] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/50"
              }`}
            >
              Zakończone ({completedCount})
            </button>
          </div>

          {/* Admin Specialist Scope Selector */}
          {currentSpecialist.isAdmin ? (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={selectedSpecialistScope}
                onChange={(e) => setSelectedSpecialistScope(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#383431] rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
              >
                <option value="ALL">Cały zespół ({allReferredRecords.length} spraw)</option>
                <option value="ME">Tylko moje sprawy ({myCases.length})</option>
                {specialists
                  .filter((s) => s.id !== currentSpecialist.id)
                  .map((spec) => {
                    const count = getReferredRecordsForSpecialist(spec.id).length;
                    return (
                      <option key={spec.id} value={spec.id}>
                        {spec.name} ({count})
                      </option>
                    );
                  })}
              </select>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Powiadomienia e-mail są wysyłane natychmiast po przekazaniu
            </div>
          )}
        </div>

        {/* Body List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-100/50 dark:bg-[#141312] flex-1">
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl border border-slate-200 dark:border-[#383431] p-12 text-center shadow-xs">
              {activeStatusFilter === "OCZEKUJĄCA" ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Brak oczekujących spraw do załatwienia
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                    {selectedSpecialistScope === "ALL"
                      ? "Wszystkie przekazane sprawy w zespole zostały pomyślnie załatwione."
                      : "Wybrany specjalista nie ma obecnie żadnych oczekujących przekazanych konsultacji."}
                  </p>
                </>
              ) : activeStatusFilter === "ZAKOŃCZONA" ? (
                <>
                  <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Brak zakończonych spraw</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                    Żadna z przekazanych konsultacji nie została jeszcze oznaczona jako zakończona.
                  </p>
                </>
              ) : (
                <>
                  <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Brak przekazanych spraw</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                    Brak konsultacji przekazanych w ramach wybranego filtru.
                  </p>
                </>
              )}
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
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            status === "OCZEKUJĄCA"
                              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-700/50"
                              : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50"
                          }`}
                        >
                          {status === "OCZEKUJĄCA" ? "🟡 Oczekuje na kontakt" : "🟢 Załatwiona"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300 mt-1">
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-500 dark:text-slate-400" />
                          <strong className="text-slate-900 dark:text-slate-100 font-mono">
                            {caller?.phoneNumber || "Brak nr"}
                          </strong>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-slate-500 dark:text-slate-400" />
                          {caller?.city || "—"}, {caller?.voivodeship}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      <div>
                        Przekazał/a:{" "}
                        <strong className="text-slate-900 dark:text-slate-100">
                          {rec.specialistName}
                        </strong>
                      </div>
                      {rec.referredTo && (
                        <div>
                          Skierowano do:{" "}
                          <span className="font-bold text-amber-700 dark:text-[#FFB200] bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 text-[11px]">
                            {rec.referredTo}
                          </span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Data przekazania: {new Date(rec.callDate || rec.createdAt).toLocaleDateString("pl-PL")}
                      </div>
                    </div>
                  </div>

                  {/* Referral Note & Advice context */}
                  <div className="space-y-2 text-xs">
                    {rec.referredNote && (
                      <div className="bg-amber-50 dark:bg-[#241E15] border border-amber-200/80 dark:border-amber-600/40 rounded-2xl p-3.5 text-amber-950 dark:text-[#FFB200]">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-[#FFB200] text-[11px] mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFB200]" />
                          <span>Notatka / wytyczne od {rec.specialistName}:</span>
                        </div>
                        <p className="leading-relaxed font-medium">{rec.referredNote}</p>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-[#161514] border border-slate-200 dark:border-[#2C2927] rounded-2xl p-3 text-slate-700 dark:text-slate-300">
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                        Czego dotyczyła wcześniejsza porada:
                      </div>
                      <p className="line-clamp-2 text-slate-900 dark:text-slate-100">{rec.adviceDescription}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-[#2C2927]">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          markReferralStatus(rec.id, status === "OCZEKUJĄCA" ? "ZAKOŃCZONA" : "OCZEKUJĄCA")
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          status === "OCZEKUJĄCA"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                            : "bg-slate-50 dark:bg-[#161514] hover:bg-slate-100 dark:hover:bg-[#2A2724] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431]"
                        }`}
                      >
                        {status === "OCZEKUJĄCA" ? "✓ Oznacz jako załatwioną" : "↺ Przywróć jako oczekującą"}
                      </button>

                      {currentSpecialist.isAdmin && (
                        <button
                          type="button"
                          onClick={() => setReassigningRecord(rec)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-[#FFDF06] border border-amber-200 dark:border-amber-800/60 flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Przepisz sprawę</span>
                        </button>
                      )}
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
