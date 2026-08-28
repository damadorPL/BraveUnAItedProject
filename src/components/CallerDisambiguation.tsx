import React from "react";
import { Caller } from "../types";
import { useApp } from "../context/AppContext";
import {
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  UserPlus,
} from "lucide-react";

interface Props {
  callers: Caller[];
}

export const CallerDisambiguation: React.FC<Props> = ({ callers }) => {
  const { setSelectedCaller, getCallerRecords, setIsNewCallerModalOpen, searchQuery } = useApp();

  return (
    <div className="bg-amber-50/70 dark:bg-[#251F14] border border-amber-200 dark:border-amber-600/40 rounded-3xl p-5 mb-6 shadow-xs">
      {/* Alert Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-amber-500 text-white p-2 rounded-2xl shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950 dark:text-[#FFB200] flex items-center gap-2">
            Znaleziono {callers.length} osoby o pasujących danych (weryfikacja tożsamości)
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
            Zgodnie z procedurą bezpieczeństwa danych medycznych: <strong>zapytaj o województwo/miejscowość osoby kontaktowej</strong>, aby nie połączyć błędnie historii dwóch różnych osób.
          </p>
        </div>
      </div>

      {/* Grid of Potential Matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {callers.map((caller) => {
          const records = getCallerRecords(caller.id);
          const lastRecord = records[0];
          const lastDateStr = lastRecord?.callDate
            ? new Date(lastRecord.callDate).toLocaleDateString("pl-PL", {
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
              className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] hover:border-[#FFB200] dark:hover:border-[#FFB200] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-[#FFB200] transition-colors">
                      {caller.firstName} {caller.lastName}
                    </span>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{caller.city}</span>
                      <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>
                      <span className="">{caller.voivodeship}</span>
                    </div>
                  </div>

                  <span className="bg-[#FFB200]/20 text-amber-950 dark:text-[#FFB200] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#FFB200]/40">
                    {records.length} {records.length === 1 ? "porada" : "porady"}
                  </span>
                </div>

                {/* Beneficiary & Certificate info */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#141312] px-2.5 py-1 rounded-xl">
                  <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{beneficiaryLabel}</span>
                  <span className="text-purple-700 dark:text-purple-300 font-semibold">
                    Orzeczenie: {caller.hasDisabilityCertificate === "tak" ? "Tak" : caller.hasDisabilityCertificate}
                  </span>
                </div>

                {/* Phone & Last Date */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#2C2927] space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      {caller.phoneNumber || "Brak numeru"}
                    </span>
                  </div>

                  <div className="flex items-center text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
                    <span>
                      Ostatnia porada: <strong>{lastDateStr}</strong>
                    </span>
                  </div>

                  {lastRecord && (
                    <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 bg-indigo-50/40 dark:bg-[#161514] p-2.5 rounded-xl border border-indigo-100/60 dark:border-[#2C2927]">
                      <div className="font-bold text-slate-800 dark:text-slate-200 capitalize mb-0.5">
                        {lastRecord.guidanceType}
                      </div>
                      <span className="line-clamp-2 text-slate-700 dark:text-slate-300 font-medium">
                        {lastRecord.adviceDescription}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2.5 flex items-center justify-between text-xs font-bold text-[#296B6E] dark:text-[#FFB200] group-hover:underline">
                <span>Zobacz pełną kartotekę</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Option to create new caller */}
      <div className="mt-4 pt-3 border-t border-amber-200/80 dark:border-amber-600/40 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
          To zupełnie inny kontakt o nazwisku &quot;{searchQuery}&quot;?
        </span>
        <button
          type="button"
          onClick={() => setIsNewCallerModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#1E1C1A] hover:bg-amber-100/60 dark:hover:bg-[#2C2417] text-amber-900 dark:text-[#FFB200] border border-amber-300 dark:border-amber-600/50 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Załóż nową, osobną kartotekę</span>
        </button>
      </div>
    </div>
  );
};
