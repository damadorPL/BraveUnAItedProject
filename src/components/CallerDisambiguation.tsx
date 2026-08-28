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
  Award,
  Users,
} from "lucide-react";

interface Props {
  callers: Caller[];
}

export const CallerDisambiguation: React.FC<Props> = ({ callers }) => {
  const { setSelectedCaller, getCallerRecords, setIsNewCallerModalOpen, searchQuery } = useApp();

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 mb-6 shadow-xs">
      {/* Alert Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-amber-500 text-white p-2 rounded-2xl shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
            Znaleziono {callers.length} osoby o pasujących danych (weryfikacja tożsamości)
          </h3>
          <p className="text-xs text-amber-800 mt-0.5">
            Zgodnie z procedurą bezpieczeństwa danych medycznych: <strong>zapytaj dzwoniącego o województwo/miejscowość</strong>, aby nie połączyć błędnie historii dwóch różnych osób.
          </p>
        </div>
      </div>

      {/* Grid of Potential Matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {callers.map((caller) => {
          const records = getCallerRecords(caller.id);
          const lastRecord = records[0];
          const lastDateStr = lastRecord?.callDate
            ? new Date(lastRecord.callDate).toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Brak porad";

          return (
            <div
              key={caller.id}
              onClick={() => setSelectedCaller(caller)}
              className="bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 cursor-pointer transition-all duration-150 shadow-xs hover:shadow-md flex flex-col justify-between group"
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
                      <span className="">{caller.voivodeship}</span>
                    </div>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                    {records.length} {records.length === 1 ? "porada" : "porady"}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span className="font-mono font-medium text-slate-800">{caller.phoneNumber || "Brak numeru"}</span>
                  </div>

                  <div className="flex items-center text-slate-500">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span>Ostatni kontakt: <strong>{lastDateStr}</strong></span>
                  </div>

                  {lastRecord && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2 line-clamp-2">
                      <span className="font-bold text-slate-800">{lastRecord.specialistName}:</span>{" "}
                      {lastRecord.adviceDescription}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                <span>Otwórz tę kartotekę</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Option to create new caller */}
      <div className="mt-4 pt-3 border-t border-amber-200/80 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-amber-900 font-medium">
          Dzwoniący to zupełnie inna osoba o nazwisku &quot;{searchQuery}&quot;?
        </span>
        <button
          type="button"
          onClick={() => setIsNewCallerModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Załóż nową, osobną kartotekę</span>
        </button>
      </div>
    </div>
  );
};
