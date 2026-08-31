import React, { useState } from "react";
import { useCurrentSpecialist } from "../../context/AppContext";
import { AdminOverviewTab } from "./tabs/AdminOverviewTab";
import { AdminSpecialistsTab } from "./tabs/AdminSpecialistsTab";
import { AdminMergeTab } from "./tabs/AdminMergeTab";
import { AdminAuditLogsTab } from "./tabs/AdminAuditLogsTab";
import { AdminDatabaseTab } from "./tabs/AdminDatabaseTab";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  GitMerge,
  Activity,
  Database,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

type AdminTab = "overview" | "specialists" | "merge" | "audit" | "database";

export const AdminDashboard: React.FC = () => {
  const currentSpecialist = useCurrentSpecialist();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-[#383431]">
        <div className="flex items-center space-x-2 text-xs">
          <Link
            to="/search"
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Baza Porad</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-rose-500" />
            <span>Panel Administratora Systemu</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-full text-[10px] font-black border border-rose-200 dark:border-rose-800">
            Konto Admin: {currentSpecialist.name}
          </span>
        </div>
      </div>

      {/* Main Admin Layout: Sidebar Tabs + Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-3 shadow-xs space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282522] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Pulpit Główny</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("specialists")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "specialists"
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282522] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Specjaliści i Role</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("merge")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "merge"
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282522] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GitMerge className="w-4 h-4 shrink-0" />
              <span>Scalanie Duplikatów</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "audit"
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282522] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>Dziennik Zmian (Audit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("database")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "database"
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282522] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Baza Danych (DB)</span>
            </button>
          </div>
        </aside>

        {/* Tab Content Body */}
        <div className="lg:col-span-9">
          {activeTab === "overview" && <AdminOverviewTab onSelectTab={(tab) => setActiveTab(tab)} />}
          {activeTab === "specialists" && <AdminSpecialistsTab />}
          {activeTab === "merge" && <AdminMergeTab />}
          {activeTab === "audit" && <AdminAuditLogsTab />}
          {activeTab === "database" && <AdminDatabaseTab />}
        </div>
      </div>
    </div>
  );
};
