import React from "react";
import { useApp } from "../context/AppContext";
import { Radio, X } from "lucide-react";

export const LiveSyncBanner: React.FC = () => {
  const { liveNotification, dismissNotification } = useApp();

  if (!liveNotification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white border border-slate-700 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs">
        <div className="bg-emerald-500 p-1.5 rounded-xl text-white animate-pulse">
          <Radio className="w-4 h-4" />
        </div>

        <div>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span>Synchronizacja w czasie rzeczywistym</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              Live
            </span>
          </div>
          <p className="text-slate-300 text-[11px] mt-0.5">{liveNotification}</p>
        </div>

        <button
          onClick={dismissNotification}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
