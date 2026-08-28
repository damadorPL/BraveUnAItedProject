import React from "react";
import { useApp } from "../context/AppContext";
import { GuidanceType, CallRecord } from "../types";
import {
  ExternalLink,
  Download,
  AlertCircle,
  Share2,
  Users,
  Award,
} from "lucide-react";

export const CallRecordsTable: React.FC = () => {
  const { records, callers, filterState, setSelectedCaller, setIsExportModalOpen } = useApp();

  const callersMap = new Map();
  callers.forEach((c) => callersMap.set(c.id, c));

  const filteredRecords = records.filter((rec) => {
    const caller = callersMap.get(rec.callerId);

    if (filterState.voivodeship && caller && caller.voivodeship !== filterState.voivodeship) {
      return false;
    }

    if (filterState.guidanceType && rec.guidanceType !== filterState.guidanceType) {
      return false;
    }

    if (filterState.beneficiaryType && caller && !caller.beneficiaryTypes?.includes(filterState.beneficiaryType as any)) {
      return false;
    }

    if (filterState.specialistId && rec.specialistId !== filterState.specialistId) {
      return false;
    }

    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const matchDesc = (rec.adviceDescription || "").toLowerCase().includes(q);
      const matchNotes = (rec.notes || "").toLowerCase().includes(q);
      const matchRef = (rec.referredTo || "").toLowerCase().includes(q);
      const matchCaller = caller
        ? (caller.firstName + " " + caller.lastName).toLowerCase().includes(q)
        : false;
      if (!matchDesc && !matchNotes && !matchRef && !matchCaller) {
        return false;
      }
    }

    return true;
  });

  const getGuidanceBadge = (type?: GuidanceType) => {
    switch (type) {
      case "prawno-obywatelskie":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "w zakresie psychologii i rehabilitacji społecznej":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Parent to Parent":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "społeczne":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const handleOpenCaller = (rec: CallRecord) => {
    let targetCaller = callersMap.get(rec.callerId);
    if (!targetCaller) {
      targetCaller = {
        id: rec.callerId || "caller-" + Date.now(),
        firstName: "Dzwoniący",
        lastName: "Konsultacja #" + rec.id.slice(-4),
        phoneNumber: "Brak numeru",
        voivodeship: "mazowieckie",
        city: "Nie podano",
        beneficiaryTypes: ["rodzic"],
        hasDisabilityCertificate: "tak",
        tags: [],
        createdAt: rec.callDate || new Date().toISOString(),
        updatedAt: rec.callDate || new Date().toISOString(),
      };
    }
    setSelectedCaller(targetCaller);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Action Bar & Stats */}
      <div className="flex items-center justify-between">
        <div className="text-slate-600 font-medium">
          Liczba zarejestrowanych porad: <strong className="text-slate-900">{filteredRecords.length}</strong>
        </div>

        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Eksportuj tę listę do CSV</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Brak porad spełniających zadane kryteria filtrowania.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Spróbuj zmienić parametry w filtrze u góry strony.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold">
                  <th className="py-3 px-3.5">Kiedy udzielono</th>
                  <th className="py-3 px-3.5">Osoba dzwoniąca</th>
                  <th className="py-3 px-3.5">Beneficjent i orzeczenie</th>
                  <th className="py-3 px-3.5">Rodzaj poradnictwa i obszar</th>
                  <th className="py-3 px-3.5">Rodzaj porady (opis) i uwagi</th>
                  <th className="py-3 px-3.5">Specjalista i przekazanie</th>
                  <th className="py-3 px-3.5 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((rec) => {
                  const caller = callersMap.get(rec.callerId);
                  const dateStr = rec.callDate
                    ? new Date(rec.callDate).toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Brak daty";

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenCaller(rec)}
                    >
                      {/* 1. Kiedy udzielono */}
                      <td className="py-3 px-3.5 font-medium text-slate-900 whitespace-nowrap">
                        <div>{dateStr}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{rec.durationMinutes || 30} min</div>
                      </td>

                      {/* 2. Osoba dzwoniąca */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {caller ? (
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {caller.firstName} {caller.lastName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {caller.phoneNumber || "Brak numeru"}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {caller.city}, {caller.voivodeship}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900">Dzwoniący</div>
                            <div className="text-[10px] text-slate-400">ID: {rec.callerId}</div>
                          </div>
                        )}
                      </td>

                      {/* 3. Beneficjent & Orzeczenie */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {caller ? (
                          <div>
                            <div className="font-semibold text-slate-800">
                              {caller.beneficiaryTypes?.join(", ") || "Rodzic"}
                            </div>
                            <div className="text-[10px] text-purple-700 font-medium">
                              Orzeczenie: {caller.hasDisabilityCertificate === "tak" ? (caller.disabilityDegree || "Tak") : caller.hasDisabilityCertificate}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* 4. Rodzaj poradnictwa & Obszar */}
                      <td className="py-3 px-3.5 max-w-[200px]">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold border text-[10px] inline-block  ${getGuidanceBadge(
                            rec.guidanceType
                          )}`}
                        >
                          {rec.guidanceType}
                        </span>
                        {rec.guidanceAreas && rec.guidanceAreas.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {rec.guidanceAreas.join(", ")}
                          </div>
                        )}
                      </td>

                      {/* 5. Opis & Uwagi */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <div className="line-clamp-2 text-slate-900 font-medium">
                          {rec.adviceDescription || "Brak opisu."}
                        </div>
                        {rec.notes && (
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            <strong>Uwagi:</strong> {rec.notes}
                          </div>
                        )}
                      </td>

                      {/* 6. Specjalista & Przekazanie */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{rec.specialistName}</div>
                        {rec.referredTo && (
                          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                            <Share2 className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[130px]">{rec.referredTo}</span>
                          </div>
                        )}
                      </td>

                      {/* 7. Akcja */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCaller(rec);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-xl transition-all flex items-center space-x-1.5 ml-auto shadow-xs border border-indigo-100 cursor-pointer"
                        >
                          <span>Kartoteka</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
