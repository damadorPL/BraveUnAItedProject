import React from "react";
import { CallRecord, RecordEditLog } from "../types";
import { History, X, Clock } from "lucide-react";

interface Props {
  record: CallRecord | null;
  onClose: () => void;
}

export const RecordAuditLogModal: React.FC<Props> = ({ record, onClose }) => {
  if (!record) return null;

  const logs: RecordEditLog[] = record.editLogs || [];

  const callDateStr = record.callDate
    ? new Date(record.callDate).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Brak daty";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-[#FFB200] rounded-xl border border-amber-500/40">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white">Historia edycji i rejestr zmian</h2>
                <span className="text-[11px] bg-[#FFB200]/20 text-[#FFDF06] font-bold px-2 py-0.5 rounded-full border border-[#FFB200]/30">
                  {logs.length} {logs.length === 1 ? "edycja" : logs.length >= 2 && logs.length <= 4 ? "edycje" : "edycji"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Porada z dnia {callDateStr} ({record.specialistName})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)]">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold">Ten wpis nie był jeszcze modyfikowany.</p>
              <p className="mt-0.5 text-[11px]">Wszystkie przyszłe edycje zostaną automatycznie zarejestrowane.</p>
            </div>
          ) : (
            logs.map((log, index) => {
              const editDateStr = new Date(log.editedAt).toLocaleString("pl-PL", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={log.id || index}
                  className="bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#2C2927] rounded-2xl p-4 space-y-3"
                >
                  {/* Log Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-[#2C2927] pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#296B6E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {log.editorName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{log.editorName}</span>
                          <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                            ({log.editorRole})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>{editDateStr}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="text-xs font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/80 dark:border-amber-800/40">
                    {log.summary}
                  </div>

                  {/* Changes List */}
                  <div className="space-y-2 pt-1">
                    {log.changes.map((change, cIdx) => (
                      <div
                        key={cIdx}
                        className="text-xs bg-white dark:bg-[#1E1C1A] p-3 rounded-xl border border-slate-200 dark:border-[#383431] space-y-1.5"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#296B6E] dark:bg-[#FFB200]" />
                          <span>{change.label}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 rounded-lg p-2">
                            <div className="font-bold text-rose-800 dark:text-rose-300 text-[10px] mb-0.5">
                              Poprzednia wartość:
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap line-clamp-4">
                              {change.oldValue}
                            </div>
                          </div>

                          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 rounded-lg p-2">
                            <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[10px] mb-0.5">
                              Nowa wartość:
                            </div>
                            <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap line-clamp-4 font-medium">
                              {change.newValue}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#161514] p-4 border-t border-slate-200 dark:border-[#2C2927] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#2D2A28] hover:bg-[#1E1C1A] dark:bg-[#FFB200] dark:hover:bg-[#E5A000] text-white dark:text-[#2D2A28] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
