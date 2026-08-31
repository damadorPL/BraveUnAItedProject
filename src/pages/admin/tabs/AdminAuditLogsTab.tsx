import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import { RecordEditLog } from "../../../types";
import { api } from "../../../services/api";
import {
  Activity,
  History,
  Clock,
  User,
  Search,
  Filter,
  Eye,
  FileText,
  Calendar,
} from "lucide-react";

export const AdminAuditLogsTab: React.FC = () => {
  const { records } = useApp();
  const [logs, setLogs] = useState<RecordEditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<RecordEditLog | null>(null);

  // Fetch logs from API, fallback to records editLogs
  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const apiLogs = await api.admin.getAuditLogs(200);
        if (apiLogs && apiLogs.length > 0) {
          setLogs(apiLogs);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch audit logs from backend, scanning records:", err);
      }

      // Collect all edit logs from records in state
      const collected: RecordEditLog[] = [];
      for (const r of records) {
        if (r.editLogs && r.editLogs.length > 0) {
          collected.push(...r.editLogs);
        }
      }
      collected.sort((a, b) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime());
      setLogs(collected);
      setLoading(false);
    }

    loadLogs();
  }, [records]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter(
      (l) =>
        l.editorName.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.recordId.toLowerCase().includes(q) ||
        (l.changes && l.changes.some((c) => c.label.toLowerCase().includes(q) || c.newValue.toLowerCase().includes(q)))
    );
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Centralny Dziennik Zmian (Audit Logs)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Śledzenie modyfikacji porad, kartotek i operacji specjalistów w czasie rzeczywistym
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtruj wpisy audytu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p>Brak zarejestrowanych wpisów w dzienniku zmian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#252018] border-b border-slate-200 dark:border-[#383431] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Czas Zdarzenia</th>
                  <th className="py-3.5 px-4">Użytkownik / Rola</th>
                  <th className="py-3.5 px-4">ID Rekordu</th>
                  <th className="py-3.5 px-4">Podsumowanie Zmiany</th>
                  <th className="py-3.5 px-4 text-center">Liczba Pól</th>
                  <th className="py-3.5 px-4 text-right">Szczegóły</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2C2927]">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#24211E] transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{new Date(log.editedAt).toLocaleString("pl-PL")}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.editorName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {log.editorRole}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {log.recordId}
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {log.summary}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {log.changes ? log.changes.length : 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-[#282522] hover:bg-slate-200 dark:hover:bg-[#34302E] text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Pokaż diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 max-w-2xl w-full shadow-xl space-y-4 animate-in fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D2A28] pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Szczegóły modyfikacji rekordu {selectedLog.recordId}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Edytował: <strong>{selectedLog.editorName}</strong> ({selectedLog.editorRole}) • {new Date(selectedLog.editedAt).toLocaleString("pl-PL")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 grow">
              {selectedLog.changes && selectedLog.changes.length > 0 ? (
                selectedLog.changes.map((c, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 dark:bg-[#252018] rounded-2xl p-3.5 border border-slate-200/60 dark:border-[#383431] text-xs space-y-1.5"
                  >
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Pole: {c.label || c.field}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-2 text-rose-800 dark:text-rose-300">
                        <div className="text-[10px] uppercase font-bold text-rose-500 mb-0.5">Wartość przed:</div>
                        <div>{c.oldValue || "—"}</div>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-2 text-emerald-800 dark:text-emerald-300">
                        <div className="text-[10px] uppercase font-bold text-emerald-500 mb-0.5">Wartość po:</div>
                        <div>{c.newValue || "—"}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Brak szczegółowego zestawienia pól.</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#2D2A28] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-[#282522] hover:bg-slate-200 dark:hover:bg-[#34302E] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
