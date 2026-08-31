import React, { useEffect, useState } from "react";
import { useApp } from "../../../context/AppContext";
import { api } from "../../../services/api";
import {
  Users,
  FileText,
  UserCheck,
  Inbox,
  Database,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";

interface AdminOverviewTabProps {
  onSelectTab: (tab: "reports" | "specialists" | "handoff" | "merge" | "import" | "audit" | "database") => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onSelectTab }) => {
  const { callers, records, specialists, showDemoFeatures, setShowDemoFeatures } = useApp();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const data = await api.admin.getOverview();
        if (isMounted) setStats(data);
      } catch {
        if (isMounted) {
          setStats({
            totalCallers: callers.length,
            totalRecords: records.length,
            totalSpecialists: specialists.length,
            totalPendingReferrals: records.filter(
              (r) =>
                Boolean(r.referredTo || r.referredSpecialistId) &&
                (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA"
            ).length,
            databaseEngine: "sqlite",
            databaseStatus: "connected",
            databaseLocation: "data/synapsis.sqlite",
            recentAuditLogs: [],
          });
        }
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [callers.length, records, specialists.length]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectTab("reports")}
          className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Kartoteki w bazie
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalCallers ?? callers.length}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Zarejestrowane osoby
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-[#296B6E] dark:text-teal-300 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onSelectTab("reports")}
          className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Udzielone porady
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalRecords ?? records.length}
            </h3>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
              Wszystkie dyżury
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onSelectTab("specialists")}
          className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Zespół specjalistów
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalSpecialists ?? specialists.length}
            </h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
              Aktywni konsultanci
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onSelectTab("handoff")}
          className="bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-[#FFB200] transition-colors cursor-pointer group"
        >
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Oczekujące przekazania
            </p>
            <h3 className="text-2xl font-black text-amber-950 dark:text-[#FFB200] mt-1">
              {stats?.totalPendingReferrals ?? records.filter((r) => Boolean(r.referredTo || r.referredSpecialistId) && (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA").length}
            </h3>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-1 group-hover:underline flex items-center gap-1">
              <span>Zarządzaj przekazaniami &rarr;</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-[#FFDF06] flex items-center justify-center shadow-xs">
            <Inbox className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* System Status & Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Status Card */}
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D2A28] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-slate-100 dark:bg-[#282522] rounded-xl text-slate-700 dark:text-slate-200">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Silnik bazy danych
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Obsługa SQLite oraz PostgreSQL
                </p>
              </div>
            </div>

            <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Połączono</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#2D2A28]">
              <span className="text-slate-500 dark:text-slate-400">Aktywny silnik:</span>
              <span className="font-mono font-bold uppercase text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-[#282522] px-2 py-0.5 rounded">
                {stats?.databaseEngine || "sqlite"}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#2D2A28]">
              <span className="text-slate-500 dark:text-slate-400">Ścieżka / połączenie:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[280px]">
                {stats?.databaseLocation || "data/synapsis.sqlite"}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Automatyczna synchronizacja schematu:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Włączona (Drizzle ORM)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("database")}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-50 dark:bg-[#282522] hover:bg-slate-100 dark:hover:bg-[#34302E] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-[#383431]"
          >
            <span>Zarządzaj bazą danych i przełącz silnik</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Security & JWT Card */}
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D2A28] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-[#FFB200]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Bezpieczeństwo i autoryzacja JWT
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ochrona tras administracyjnych i punktów końcowych API
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
              JWT Bearer 24h
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#2D2A28]">
              <span className="text-slate-500 dark:text-slate-400">Standard autoryzacji:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                JSON Web Token (HMAC-SHA256)
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#2D2A28]">
              <span className="text-slate-500 dark:text-slate-400">Ochrona uprawnień administratora:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Aktywna (/admin/*, /api/admin/*)
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Szyfrowanie haseł:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                SHA-256 / bezpieczny hash
              </span>
            </div>

            {/* Demo Mode Toggle for Admins */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-[#2D2A28] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Opcje demo i Szybki test:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Chipy testowe w wyszukiwarce (widoczne tylko dla konta admina)
                </p>
              </div>
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

          <button
            type="button"
            onClick={() => onSelectTab("specialists")}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-50 dark:bg-[#282522] hover:bg-slate-100 dark:hover:bg-[#34302E] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-[#383431]"
          >
            <span>Zarządzaj kontami i uprawnieniami</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Szybkie akcje administracyjne
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <button
            type="button"
            onClick={() => onSelectTab("reports")}
            className="p-4 bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] border border-slate-200 dark:border-[#383431] rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Raporty PFRON
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Pulpit analityczny, wskaźniki i eksport Excel/CSV
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("specialists")}
            className="p-4 bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] border border-slate-200 dark:border-[#383431] rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Zarządzanie specjalistami
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Dodawaj, edytuj role, uprawnienia i resetuj hasła
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("merge")}
            className="p-4 bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] border border-slate-200 dark:border-[#383431] rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-[#FFB200] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Wykrywanie i scalanie duplikatów
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Łącz powtarzające się kartoteki z przeniesieniem historii
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("import")}
            className="p-4 bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] border border-slate-200 dark:border-[#383431] rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Import z pliku Excel
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Zasilaj bazę z zewnętrznych arkuszy kalkulacyjnych
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("audit")}
            className="p-4 bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] border border-slate-200 dark:border-[#383431] rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Dziennik zmian
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Przeglądaj pełną historię modyfikacji porad i kartotek
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
