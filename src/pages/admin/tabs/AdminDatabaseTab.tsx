import React, { useState, useEffect } from "react";
import { useApp } from "../../../context/AppContext";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { api } from "../../../services/api";
import {
  Database,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Zap,
  Layers,
} from "lucide-react";

export const AdminDatabaseTab: React.FC = () => {
  const { resetDatabase, clearDatabase, showDemoFeatures, setShowDemoFeatures } = useApp();

  const [engine, setEngine] = useState<"sqlite" | "postgres">("sqlite");
  const [sqlitePath, setSqlitePath] = useState("data/synapsis.sqlite");
  const [postgresUrl, setPostgresUrl] = useState("postgres://postgres:postgres@localhost:5432/brave_synapsis");
  const [keepSpecialists, setKeepSpecialists] = useState(false);

  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [actionMessage, setActionMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Reusable Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    variant?: "danger" | "warning" | "primary";
    onConfirm: () => void;
  } | null>(null);

  const fetchConfig = async () => {
    try {
      const data = await api.admin.getDbConfig();
      if (data.engine) setEngine(data.engine);
      if (data.sqlitePath) setSqlitePath(data.sqlitePath);
      if (data.postgresUrl) setPostgresUrl(data.postgresUrl);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const data = await api.admin.getDbConfig();
        if (isMounted) {
          if (data.engine) setEngine(data.engine);
          if (data.sqlitePath) setSqlitePath(data.sqlitePath);
          if (data.postgresUrl) setPostgresUrl(data.postgresUrl);
        }
      } catch {
        // Fallback
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTestConnection = async () => {
    setTestResult(null);
    try {
      setLoading(true);
      const res = await api.admin.testDb({
        engine,
        sqlitePath: engine === "sqlite" ? sqlitePath : undefined,
        postgresUrl: engine === "postgres" ? postgresUrl : undefined,
      });
      setTestResult(res);
    } catch (err: any) {
      let msg = err.message || "Błąd podczas testu połączenia.";
      if (msg.includes("Brak tokenu") || msg.includes("Wymagana autoryzacja") || msg.includes("401")) {
        msg = "Wymagana autoryzacja sesji administratora. Zaloguj się ponownie przez ekran logowania.";
      }
      setTestResult({
        success: false,
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyConfig = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      setLoading(true);
      const res = await api.admin.switchDb({
        engine,
        sqlitePath: engine === "sqlite" ? sqlitePath : undefined,
        postgresUrl: engine === "postgres" ? postgresUrl : undefined,
      });
      setActionMessage({ success: res.success, text: res.message });
      await fetchConfig();
    } catch (err: any) {
      let text = err.message || "Błąd przełączania bazy";
      if (text.includes("Brak tokenu") || text.includes("Wymagana autoryzacja") || text.includes("401")) {
        text = "Wymagana autoryzacja sesji administratora. Zaloguj się ponownie przez ekran logowania.";
      }
      setActionMessage({ success: false, text });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = () => {
    setConfirmModal({
      isOpen: true,
      title: "Przywrócenie danych demonstracyjnych",
      variant: "warning",
      confirmText: "Przywróć dane demo",
      description: "Czy na pewno chcesz przywrócić bazę danych do początkowego zestawu testowego (71 porad i kartoteki Fundacji SYNAPSIS)? Wszystkie wprowadzone ręcznie dane zostaną zastąpione danymi wzorcowymi.",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoading(true);
          const res = await api.admin.resetDb();
          resetDatabase();
          setActionMessage({ success: true, text: res.message || "Baza danych została zresetowana." });
          setTimeout(() => setActionMessage(null), 5000);
        } catch (err: any) {
          setActionMessage({ success: false, text: err.message || "Błąd resetowania bazy" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleClearDatabase = () => {
    const promptMsg = keepSpecialists
      ? "Czy na pewno chcesz WYCZYŚCIĆ bazę danych? Wszystkie kartoteki i porady zostaną bezpowrotnie usunięte. Zdefiniowane konta specjalistów oraz konto Administratora zostaną ZACHOWANE."
      : "Czy na pewno chcesz WYCZYŚCIĆ bazę danych do czystego stanu produkcyjnego? Wszystkie kartoteki, porady oraz konta demonstracyjne zostaną usunięte. Główne konto Administratora (admin@synapsis.org.pl) zostanie bezpiecznie zachowane do logowania.";

    setConfirmModal({
      isOpen: true,
      title: "Wyczyszczenie bazy danych",
      variant: "danger",
      confirmText: "Wyczyść bazę danych",
      description: promptMsg,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoading(true);
          const res = await api.admin.clearDb(keepSpecialists);
          clearDatabase(keepSpecialists);
          setActionMessage({ success: true, text: res.message || "Baza danych została wyczyszczona." });
          setTimeout(() => setActionMessage(null), 6000);
        } catch (err: any) {
          let text = err.message || "Błąd czyszczenia bazy danych";
          if (text.includes("Brak tokenu") || text.includes("Wymagana autoryzacja") || text.includes("401")) {
            text = "Wymagana autoryzacja sesji administratora. Zaloguj się ponownie przez ekran logowania.";
          }
          setActionMessage({ success: false, text });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>Konfiguracja baz danych (SQLite i PostgreSQL)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Wybierz aktywny silnik bazy danych, skonfiguruj parametry połączenia lub przywróć dane początkowe
        </p>
      </div>

      {actionMessage && (
        <div
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-semibold animate-in fade-in ${
            actionMessage.success
              ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
          }`}
        >
          {actionMessage.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Active Engine Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setEngine("sqlite")}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
            engine === "sqlite"
              ? "border-[#FFB200] bg-amber-50/20 dark:bg-[#252018] shadow-xs"
              : "border-slate-200 dark:border-[#383431] bg-white dark:bg-[#1E1C1A] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-[#296B6E] dark:text-teal-300">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  SQLite (lokalna baza plikowa)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Zero-config • szybki odczyt lokalny
                </p>
              </div>
            </div>

            <input
              type="radio"
              name="engine"
              checked={engine === "sqlite"}
              onChange={() => setEngine("sqlite")}
              className="text-[#FFB200] focus:ring-[#FFB200] w-4 h-4"
            />
          </div>
        </div>

        <div
          onClick={() => setEngine("postgres")}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
            engine === "postgres"
              ? "border-[#FFB200] bg-amber-50/20 dark:bg-[#252018] shadow-xs"
              : "border-slate-200 dark:border-[#383431] bg-white dark:bg-[#1E1C1A] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  PostgreSQL (relacyjny serwer bazodanowy)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wysoka wydajność • produkcyjna linia wsparcia
                </p>
              </div>
            </div>

            <input
              type="radio"
              name="engine"
              checked={engine === "postgres"}
              onChange={() => setEngine("postgres")}
              className="text-[#FFB200] focus:ring-[#FFB200] w-4 h-4"
            />
          </div>
        </div>
      </div>

      {/* Engine Configuration Form */}
      <form
        onSubmit={handleApplyConfig}
        className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 shadow-xs space-y-4"
      >
        <div className="border-b border-slate-100 dark:border-[#2D2A28] pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Parametry dla silnika: {engine.toUpperCase()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Wprowadź ścieżkę do pliku lub adres URL bazy danych PostgreSQL
          </p>
        </div>

        {engine === "sqlite" ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ścieżka do pliku bazy SQLite
            </label>
            <input
              type="text"
              required
              value={sqlitePath}
              onChange={(e) => setSqlitePath(e.target.value)}
              placeholder="data/synapsis.sqlite"
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-slate-50 dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Plik zostanie automatycznie utworzony ze schematem tabel, jeśli nie istnieje.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                PostgreSQL Connection String (URI)
              </label>
              <input
                type="text"
                required
                value={postgresUrl}
                onChange={(e) => setPostgresUrl(e.target.value)}
                placeholder="postgres://user:password@localhost:5432/brave_synapsis"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-slate-50 dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Wskazówka konfiguracji:</span>
              </p>
              <p>
                Wzorzec: <code>postgres://[użytkownik]:[hasło]@[host]:[port]/[nazwa_bazy]</code>. Po
                połączeniu system automatycznie utworzy tabele relacyjne, indeksy oraz indeksy
                JSONB.
              </p>
            </div>
          </div>
        )}

        {testResult && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
              testResult.success
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between flex-wrap gap-3 border-t border-slate-100 dark:border-[#2D2A28]">
          <button
            type="button"
            disabled={loading}
            onClick={handleTestConnection}
            className="px-4 py-2 bg-slate-100 dark:bg-[#282522] hover:bg-slate-200 dark:hover:bg-[#34302E] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Testuj połączenie</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Zastosuj i przełącz bazę</span>
          </button>
        </div>
      </form>

      {/* Demo Features Settings */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Opcje demonstracyjne i Szybki test w wyszukiwarce</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Włącza pomocnicze chipy szybkiego wyszukiwania przykładowych spraw w głównej wyszukiwarce. Opcja jest domyślnie wyłączona i widoczna wyłącznie dla kont administratora.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {showDemoFeatures ? "Włączone" : "Wyłączone"}
          </span>
          <button
            type="button"
            onClick={() => setShowDemoFeatures(!showDemoFeatures)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              showDemoFeatures ? "bg-[#FFB200]" : "bg-slate-300 dark:bg-slate-700"
            }`}
            role="switch"
            aria-checked={showDemoFeatures}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                showDemoFeatures ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Danger Zone: Operations */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Strefa operacji zaawansowanych i czyszczenia danych
        </h3>

        {/* 1. Clear Demo Data (Production clean slate) */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2.5 text-rose-700 dark:text-rose-400">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-sm font-black">
              Wyczyszczenie bazy / usunięcie danych demonstracyjnych (stan produkcyjny)
            </h3>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
            Usuwa wszystkie 71 wpisów testowych, kartoteki kontaktów oraz załączniki, przygotowując system do bieżącej pracy operacyjnej na linii pomocowej.
          </p>

          <div className="bg-white/80 dark:bg-[#1A1816] border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Gwarancja zachowania dostępu do logowania:</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              Główne konto <strong>Administratora (<code>admin@synapsis.org.pl</code>)</strong> jest trwale chronione i <strong>nigdy nie zostanie usunięte</strong>. Twoja aktywna sesja pozostanie ważna, a po wylogowaniu nadal zalogujesz się dotychczasowym hasłem.
            </p>

            <label className="flex items-center space-x-2 pt-1.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={keepSpecialists}
                onChange={(e) => setKeepSpecialists(e.target.checked)}
                className="w-4 h-4 text-[#FFB200] focus:ring-[#FFB200] rounded"
              />
              <span>Zachowaj zdefiniowane konta dyżurujących specjalistów (usuń tylko historię kontaktów i porady)</span>
            </label>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleClearDatabase}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wyczyść bazę danych (Usuń dane demo)</span>
          </button>
        </div>

        {/* 2. Restore Sample Data */}
        <div className="bg-slate-50 dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <RotateCcw className="w-5 h-5" />
            <h3 className="text-sm font-black">
              Przywrócenie wzorcowego zestawu demonstracyjnego
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Ta operacja przywróci wzorcowy zestaw 71 konsultacji, kartotek beneficjentów oraz kont specjalistów Fundacji SYNAPSIS.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={handleResetDatabase}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Przywróć dane demonstracyjne</span>
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
          confirmText={confirmModal.confirmText}
          isLoading={loading}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};
