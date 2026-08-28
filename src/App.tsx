import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { CallerDisambiguation } from "./components/CallerDisambiguation";
import { CallerHistoryView } from "./components/CallerHistoryView";
import { NewCallRecordModal } from "./components/NewCallRecordModal";
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
  ChevronRight,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Award,
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
  } = useApp();

  // If a caller is currently open, show their complete history timeline
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
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Centralny Rejestr Udzielonych Porad
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pełne zestawienie konsultacji ze wszystkich dyżurów z polami wg oficjalnego wzorca
            </p>
          </div>
          <CallRecordsFilter />
          <CallRecordsTable />
        </div>
      )}

      {activeTab === "STATS" && (
        <div className="animate-in fade-in">
          <div className="mb-4">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Pulpit Analityczny & Raporty PFRON
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Statystyki linii wsparcia, wskaźniki grantowe i podsumowania geograficzne
            </p>
          </div>
          <StatsBar />
        </div>
      )}

      {activeTab === "SEARCH" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Welcome & Fast Search Section */}
          <div className="text-center max-w-2xl mx-auto pt-2 pb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              Szybka Baza Historii Rozmów
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Wpisz nazwisko lub numer telefonu, aby w <strong>mniej niż 5 sekund</strong> sprawdzić, czy dzwoniący kontaktował się wcześniej i jakie zalecenia otrzymał.
            </p>
          </div>

          <SearchBar />

          {/* If search query entered and multiple matches -> Disambiguation */}
          {searchQuery && filteredCallers.length > 1 && (
            <CallerDisambiguation callers={filteredCallers} />
          )}

          {/* Caller Cards List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>
                  {searchQuery
                    ? `Wyniki wyszukiwania (${filteredCallers.length})`
                    : `Ostatnio kontaktujący się dzwoniący (${callers.length})`}
                </span>
              </h2>

              <button
                type="button"
                onClick={() => setIsNewCallerModalOpen(true)}
                className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Zarejestruj nową osobę</span>
              </button>
            </div>

            {filteredCallers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">
                  Brak osoby o nazwisku &quot;{searchQuery}&quot; w bazie
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Wygląda na to, że ta osoba dzwoni na linię poradniczą po raz pierwszy. Możesz natychmiast utworzyć dla niej nową kartotekę.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewCallerModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Załóż nową kartotekę dla &quot;{searchQuery}&quot;</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCallers.map((caller) => {
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
                      className="bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                              {caller.firstName} {caller.lastName}
                            </span>
                            <div className="flex items-center text-xs text-slate-500 mt-1">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              <span className="font-medium text-slate-700">{caller.city}</span>
                              <span className="mx-1 text-slate-300">•</span>
                              <span className="capitalize">{caller.voivodeship}</span>
                            </div>
                          </div>

                          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                            {records.length} {records.length === 1 ? "porada" : "porady"}
                          </span>
                        </div>

                        {/* Beneficiary & Certificate info */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl">
                          <span className="capitalize font-medium text-slate-700">{beneficiaryLabel}</span>
                          <span className="text-purple-700 font-semibold">
                            Orzeczenie: {caller.hasDisabilityCertificate === "tak" ? "Tak" : caller.hasDisabilityCertificate}
                          </span>
                        </div>

                        {/* Phone & Last Date */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            <span className="font-mono font-medium text-slate-800">
                              {caller.phoneNumber || "Brak numeru"}
                            </span>
                          </div>

                          <div className="flex items-center text-slate-500">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            <span>
                              Ostatnia porada: <strong>{lastDateFormatted}</strong>
                            </span>
                          </div>

                          {lastRec && (
                            <div className="mt-2 text-[11px] text-slate-600 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/60">
                              <div className="font-bold text-slate-800 capitalize mb-0.5">
                                {lastRec.guidanceType}
                              </div>
                              <span className="line-clamp-2 text-slate-700 font-medium">
                                {lastRec.adviceDescription}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                        <span>Zobacz pełną kartotekę</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
        <Header />
        <MainContent />

        {/* Global Modals & Notifications */}
        <NewCallRecordModal />
        <NewCallerModal />
        <ExcelMigratorModal />
        <ExportModal />
        <LiveSyncBanner />

        {/* Footer info */}
        <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              UnAIted Hackathon &bull; <strong>Wspólna Baza Historii Rozmów dla Dyżurujących Specjalistów</strong>
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Szyfrowanie zgodne z art. 9 RODO (dane medyczne) &bull; Linia PFRON
            </span>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
