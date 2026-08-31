import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import { SearchBar } from "../components/SearchBar";
import { CallerDisambiguation } from "../components/CallerDisambiguation";
import { ReferredCasesModal } from "../components/ReferredCasesModal";
import { pluralizeOczekujace, pluralizePorady } from "../utils/pluralization";
import {
  Users,
  UserPlus,
  Inbox,
  ArrowRight,
  MessageSquare,
  PlusCircle,
  AlertCircle,
  MapPin,
  Phone,
  Clock,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export const SearchPage: React.FC = () => {
  const {
    callers,
    filteredCallers,
    searchQuery,
    setSelectedCaller,
    setIsNewCallerModalOpen,
    setIsNewRecordModalOpen,
    setEditingCaller,
    getCallerRecords,
    getReferredRecordsForSpecialist,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();
  const navigate = useNavigate();

  const [callerPage, setCallerPage] = useState(1);
  const [callerPageSize, setCallerPageSize] = useState(12);
  const [isReferredModalOpen, setIsReferredModalOpen] = useState(false);

  useEffect(() => {
    setCallerPage(1);
  }, [searchQuery]);

  const totalCallerPages = Math.ceil(filteredCallers.length / callerPageSize) || 1;
  const paginatedCallers = filteredCallers.slice(
    (callerPage - 1) * callerPageSize,
    callerPage * callerPageSize
  );

  const myReferredCases = getReferredRecordsForSpecialist(currentSpecialist.id);
  const pendingCases = myReferredCases.filter(
    (r) => (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA"
  );

  const handleOpenCaller = (callerId: string) => {
    const found = callers.find((c) => c.id === callerId);
    if (found) {
      setSelectedCaller(found);
      navigate(`/callers/${callerId}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Handoff Banner: Pending cases referred to current specialist */}
      {pendingCases.length > 0 && !searchQuery && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#FFB200]/20 to-amber-500/10 dark:from-amber-950/60 dark:via-[#252018] dark:to-amber-950/40 border-2 border-[#FFB200] rounded-3xl p-5 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#FFB200]/30">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-[#FFB200] text-[#2D2A28] rounded-xl shadow-xs">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>Sprawy przekazane do Twojej konsultacji (Handoff)</span>
                  <span className="text-[11px] bg-[#2D2A28] text-[#FFB200] dark:bg-[#FFB200] dark:text-[#2D2A28] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                    {pluralizeOczekujace(pendingCases.length)}
                  </span>
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                  Inni dyżurujący specjaliści przekazali do Ciebie poniższe osoby wymagające konsultacji:
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReferredModalOpen(true)}
              className="text-xs font-bold text-[#2D2A28] dark:text-[#FFDF06] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Wszystkie przekazane ({myReferredCases.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid of Pending Handoff Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingCases.slice(0, 4).map((rec) => {
              const caller = callers.find((c) => c.id === rec.callerId);
              return (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-[#1E1C1A] border border-amber-200 dark:border-[#383431] hover:border-[#FFB200] rounded-2xl p-3.5 shadow-2xs hover:shadow-sm transition-all space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-black text-slate-900 dark:text-white text-xs">
                        {caller ? `${caller.firstName} ${caller.lastName}` : "Kontakt z bazy"}
                      </span>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                        Od: {rec.specialistName}
                      </span>
                    </div>

                    {caller && (
                      <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        <span className="font-mono">{caller.phoneNumber || "Brak nr"}</span>
                        <span>•</span>
                        <span>
                          {caller.city} ({caller.voivodeship})
                        </span>
                      </div>
                    )}

                    {rec.referredNote && (
                      <div className="mt-2 text-[11px] bg-amber-50 dark:bg-[#252018] text-amber-950 dark:text-[#FFB200] p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-1.5 font-medium">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFB200] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{rec.referredNote}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#2C2927] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => caller && handleOpenCaller(caller.id)}
                      className="text-[11px] font-bold text-[#1F5254] dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Otwórz kartotekę
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (caller) {
                          setSelectedCaller(caller);
                          setIsNewRecordModalOpen(true);
                        }
                      }}
                      className="px-3 py-1 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Konsultuj</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto pt-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Szybka baza historii rozmów
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2">
          Wpisz nazwisko lub numer telefonu, aby w <strong>mniej niż 5 sekund</strong> sprawdzić,
          czy kontakt odbywał się wcześniej i jakie zalecenia otrzymał.
        </p>
      </div>

      <SearchBar />

      <ReferredCasesModal
        isOpen={isReferredModalOpen}
        onClose={() => setIsReferredModalOpen(false)}
      />

      {searchQuery && filteredCallers.length > 1 ? (
        <CallerDisambiguation callers={filteredCallers} />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#296B6E]" />
              <span>
                {searchQuery
                  ? "Wyniki wyszukiwania (" + filteredCallers.length + ")"
                  : "Zarejestrowane kontakty (" + callers.length + ")"}
              </span>
            </h2>

            <button
              type="button"
              onClick={() => setIsNewCallerModalOpen(true)}
              className="flex items-center space-x-1 text-xs font-bold text-[#2D2A28] dark:text-[#FFDF06] bg-[#FFB200]/25 dark:bg-[#FFB200]/20 hover:bg-[#FFB200]/45 border border-[#FFB200]/40 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nowy kontakt</span>
            </button>
          </div>

          {filteredCallers.length === 0 ? (
            searchQuery.trim() ? (
              <div className="bg-white dark:bg-[#242220] rounded-3xl border border-slate-200 dark:border-[#3E3A37] p-8 text-center shadow-xs">
                <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Brak kontaktu o nazwisku &quot;{searchQuery.trim()}&quot; w bazie
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Wygląda na to, że jest to pierwszy kontakt tej osoby z poradnią. Możesz natychmiast utworzyć dla niej nową kartotekę.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewCallerModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Załóż nową kartotekę dla &quot;{searchQuery.trim()}&quot;</span>
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#242220] rounded-3xl border border-slate-200 dark:border-[#3E3A37] p-8 text-center shadow-xs space-y-3">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Baza kontaktów jest pusta
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  W systemie nie ma jeszcze zarejestrowanych kontaktów. Możesz od razu założyć pierwszą kartotekę.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewCallerModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Załóż pierwszą kartotekę</span>
                </button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {paginatedCallers.map((caller) => {
                  const callerRecs = getCallerRecords(caller.id);
                  const lastRec = callerRecs[0];

                  return (
                    <div
                      key={caller.id}
                      onClick={() => handleOpenCaller(caller.id)}
                      className="bg-white dark:bg-[#242220] border border-slate-200 dark:border-[#3E3A37] hover:border-[#296B6E] dark:hover:border-[#296B6E] hover:shadow-md rounded-2xl p-4 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#296B6E] dark:group-hover:text-teal-400 transition-colors">
                              {caller.firstName} {caller.lastName}
                            </h3>
                            <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span className="font-mono">{caller.phoneNumber || "Brak nr"}</span>
                            </div>
                          </div>

                          <span className="text-[11px] font-black bg-[#296B6E]/10 dark:bg-[#296B6E]/20 text-[#296B6E] dark:text-teal-300 px-2 py-0.5 rounded-full shrink-0">
                            {pluralizePorady(callerRecs.length)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {caller.city ? `${caller.city}, ` : ""}
                            {caller.voivodeship}
                          </span>
                        </div>

                        {lastRec && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#34302E] text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
                            <span className="flex items-center space-x-1 truncate">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                Ostatnia: {new Date(lastRec.callDate).toLocaleDateString("pl-PL")}
                              </span>
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                              {lastRec.specialistName.split(" ").pop()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2 flex items-center justify-between text-xs font-bold text-[#296B6E] dark:text-teal-400 border-t border-slate-100 dark:border-[#34302E]">
                        <span>Otwórz kartotekę &rarr;</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCaller(caller);
                          }}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#34302E]"
                          title="Edytuj kartotekę"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalCallerPages > 1 && (
                <div className="flex items-center justify-between pt-2 pb-6">
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    Strona <strong>{callerPage}</strong> z <strong>{totalCallerPages}</strong> (
                    {filteredCallers.length} kontaktów)
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={callerPage <= 1}
                      onClick={() => setCallerPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-[#383431] bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={callerPage >= totalCallerPages}
                      onClick={() => setCallerPage((p) => Math.min(totalCallerPages, p + 1))}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-[#383431] bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
