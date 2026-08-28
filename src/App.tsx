
import React, { useState, useEffect } from "react";
import { AppProvider, useApp, useCurrentSpecialist } from "./context/AppContext";
import { Header } from "./components/Header";
import { LoginScreen } from "./components/LoginScreen";
import { SearchBar } from "./components/SearchBar";
import { CallerDisambiguation } from "./components/CallerDisambiguation";
import { CallerHistoryView } from "./components/CallerHistoryView";
import { NewCallRecordModal } from "./components/NewCallRecordModal";
import { EditCallRecordModal } from "./components/EditCallRecordModal";
import { EditCallerModal } from "./components/EditCallerModal";
import { EmailNotificationModal } from "./components/EmailNotificationModal";
import { NewCallerModal } from "./components/NewCallerModal";
import { CallRecordsFilter } from "./components/CallRecordsFilter";
import { CallRecordsTable } from "./components/CallRecordsTable";
import { ExcelMigratorModal } from "./components/ExcelMigratorModal";
import { ExportModal } from "./components/ExportModal";
import { StatsBar } from "./components/StatsBar";
import { LiveSyncBanner } from "./components/LiveSyncBanner";
import {
  Users,
  MapPin,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Edit3,
} from "lucide-react";

const MainContent: React.FC = () => {
  const {
    activeTab,
    selectedCaller,
    setSelectedCaller,
    searchQuery,
    filteredCallers,
    callers,
    getCallerRecords,
    setIsNewCallerModalOpen,
    setEditingCaller,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [callerPage, setCallerPage] = useState(1);
  const [callerPageSize, setCallerPageSize] = useState(12);

  useEffect(() => {
    setCallerPage(1);
  }, [searchQuery]);

  const totalCallerPages = Math.ceil(filteredCallers.length / callerPageSize) || 1;
  const paginatedCallers = filteredCallers.slice(
    (callerPage - 1) * callerPageSize,
    callerPage * callerPageSize
  );

  if (selectedCaller) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CallerHistoryView caller={selectedCaller} />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {activeTab === "ALL_RECORDS" && (
        <div className="animate-in fade-in">
          <div className="mb-4">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Centralny rejestr udzielonych porad
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pełne zestawienie konsultacji ze wszystkich dyżurów z polami wg oficjalnego wzorca
            </p>
          </div>
          <CallRecordsFilter />
          <CallRecordsTable />
        </div>
      )}

      {activeTab === "STATS" && currentSpecialist.isAdmin && (
        <div className="animate-in fade-in">
          <div className="mb-4">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Pulpit analityczny i raporty PFRON
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Statystyki linii wsparcia, wskaźniki grantowe i podsumowania geograficzne
            </p>
          </div>
          <StatsBar />
        </div>
      )}

      {activeTab === "SEARCH" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="text-center max-w-2xl mx-auto pt-2 pb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Szybka baza historii rozmów
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Wpisz nazwisko lub numer telefonu, aby w <strong>mniej niż 5 sekund</strong> sprawdzić, czy kontakt odbywał się wcześniej i jakie zalecenia otrzymał.
            </p>
          </div>

          <SearchBar />

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
                  <span>Zarejestruj nową osobę</span>
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
                      <span>Załóż nową kartotekę</span>
                    </button>
                  </div>
                )
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedCallers.map((caller) => {
                      const records = getCallerRecords(caller.id);
                      const lastRec = records[0];
                      const lastDateFormatted = lastRec?.callDate
                        ? new Date(lastRec.callDate).toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Brak wpisów";

                      const beneficiaryLabel =
                        caller.beneficiaryTypes && caller.beneficiaryTypes.length > 0
                          ? caller.beneficiaryTypes.join(", ")
                          : "Rodzic";

                      return (
                        <div
                          key={caller.id}
                          onClick={() => setSelectedCaller(caller)}
                          className="bg-white dark:bg-[#242220] border border-slate-200 dark:border-[#3E3A37] hover:border-[#FFB200] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-[#FFB200] transition-colors">
                                  {caller.firstName} {caller.lastName}
                                </span>
                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                  <span className="font-medium text-slate-700 dark:text-slate-300">{caller.city}</span>
                                  <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>
                                  <span>{caller.voivodeship}</span>
                                </div>
                              </div>

                              <span className="bg-[#FFB200]/15 dark:bg-[#FFB200]/20 text-amber-950 dark:text-[#FFDF06] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#FFB200]/30">
                                {records.length} {records.length === 1 ? "porada" : "porady"}
                              </span>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#1A1918] px-2.5 py-1 rounded-xl">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{beneficiaryLabel}</span>
                              <span className="text-[#296B6E] dark:text-teal-400 font-semibold">
                                Orzeczenie: {caller.hasDisabilityCertificate === "tak" ? "Tak" : caller.hasDisabilityCertificate}
                              </span>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#3E3A37] space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <div className="flex items-center">
                                <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
                                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                                  {caller.phoneNumber || "Brak numeru"}
                                </span>
                              </div>

                              <div className="flex items-center text-slate-500 dark:text-slate-400">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
                                <span>Ostatnia porada: <strong className="text-slate-700 dark:text-slate-200">{lastDateFormatted}</strong></span>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-1">
                              {caller.tags &&
                                caller.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] bg-slate-100 dark:bg-[#1A1918] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                          </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#3E3A37] flex items-center justify-between text-xs font-bold transition-all">
                              <div className="flex items-center text-[#296B6E] dark:text-teal-400 group-hover:text-[#FFB200] group-hover:translate-x-0.5 transition-all">
                                <span>Otwórz kartotekę</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCaller(caller);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#2D2A28] dark:hover:text-[#FFB200] hover:bg-amber-100/70 dark:hover:bg-[#2D2A28] transition-colors cursor-pointer"
                                title="Edytuj dane kontaktu"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  {filteredCallers.length > callerPageSize && (
                    <div className="mt-6 bg-white dark:bg-[#242220] rounded-2xl border border-slate-200 dark:border-[#3E3A37] p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Pokazano <strong className="text-slate-800 dark:text-slate-200">{(callerPage - 1) * callerPageSize + 1} - {Math.min(callerPage * callerPageSize, filteredCallers.length)}</strong> z <strong className="text-slate-800 dark:text-slate-200">{filteredCallers.length}</strong> kontaktów
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          disabled={callerPage <= 1}
                          onClick={() => setCallerPage((p) => Math.max(1, p - 1))}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 dark:bg-[#1A1918] hover:bg-slate-100 dark:hover:bg-[#2D2A28] disabled:opacity-40 disabled:hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#3E3A37] transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Poprzednia</span>
                        </button>

                        <div className="flex items-center space-x-1 px-1">
                          {Array.from({ length: totalCallerPages }, (_, i) => i + 1).map((pg) => (
                            <button
                              key={pg}
                              type="button"
                              onClick={() => setCallerPage(pg)}
                              className={"w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer " + (
                                callerPage === pg
                                  ? "bg-[#2D2A28] text-[#FFB200] dark:bg-[#FFB200] dark:text-[#2D2A28] shadow-xs"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A1918]"
                              )}
                            >
                              {pg}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={callerPage >= totalCallerPages}
                          onClick={() => setCallerPage((p) => Math.min(totalCallerPages, p + 1))}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 dark:bg-[#1A1918] hover:bg-slate-100 dark:hover:bg-[#2D2A28] disabled:opacity-40 disabled:hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#3E3A37] transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <span>Następna</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

const AuthGate: React.FC = () => {
  const { currentSpecialist } = useApp();

  if (!currentSpecialist) {
    return <LoginScreen />;
  }

  return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#141312] text-[#2D2A28] dark:text-slate-100 flex flex-col selection:bg-[#FFB200]/30 selection:text-[#2D2A28] transition-colors duration-150">
        <Header />
        <MainContent />

        <NewCallRecordModal />
        <EditCallRecordModal />
        <NewCallerModal />
        <EditCallerModal />
        <ExcelMigratorModal />
        <ExportModal />
        <LiveSyncBanner />
        <EmailNotificationModal />

        <footer className="mt-auto py-6 border-t border-slate-200 dark:border-[#2C2927] bg-white dark:bg-[#1A1817] text-center text-xs text-slate-400 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              UnAIted &bull; <strong>Wspólna baza historii rozmów dla dyżurujących specjalistów</strong>
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Szyfrowanie zgodne z art. 9 RODO (dane medyczne) &bull; Linia PFRON
            </span>
          </div>
        </footer>
      </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AuthGate />
    </AppProvider>
  );
}
