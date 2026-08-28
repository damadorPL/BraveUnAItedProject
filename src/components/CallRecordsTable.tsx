
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { GuidanceType, CallRecord } from "../types";
import { buildCallersMap, filterCallRecords } from "../utils/recordFilters";
import {
  ExternalLink,
  Download,
  AlertCircle,
  Share2,
  Users,
  Award,
  Edit3,
  Lock,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

export const CallRecordsTable: React.FC = () => {
  const {
    records,
    callers,
    filterState,
    setSelectedCaller,
    setIsExportModalOpen,
    setEditingRecord,
    canEditRecord,
    currentSpecialist,
  } = useApp();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    setPage(1);
  }, [filterState]);

  const callersMap = buildCallersMap(callers);

  const filteredRecords = filterCallRecords(records, callersMap, filterState);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

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
        firstName: "Kontakt",
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
                  <th className="py-3 px-3.5">Osoba kontaktowa</th>
                  <th className="py-3 px-3.5">Beneficjent i orzeczenie</th>
                  <th className="py-3 px-3.5">Rodzaj poradnictwa i obszar</th>
                  <th className="py-3 px-3.5">Rodzaj porady (opis) i uwagi</th>
                  <th className="py-3 px-3.5">Specjalista i przekazanie</th>
                  <th className="py-3 px-3.5 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedRecords.map((rec) => {
                  const caller = callersMap.get(rec.callerId);
                  const dateStr = rec.callDate
                    ? new Date(rec.callDate).toLocaleDateString("pl-PL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Brak daty";

                  const beneficiaryStr =
                    caller?.beneficiaryTypes?.join(", ") || "rodzic";

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => handleOpenCaller(rec)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {dateStr}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {rec.contactTypes?.join(", ") || "telefon"} &bull; {rec.durationMinutes || 30} min
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {caller ? (
                          <>
                            <div className="font-bold text-slate-900 group-hover:text-[#296B6E] transition-colors">
                              {caller.firstName} {caller.lastName}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {caller.city} ({caller.voivodeship})
                            </div>
                          </>
                        ) : (
                          <div className="font-bold text-slate-900">Kontakt</div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center text-slate-800 font-medium">
                          <Users className="w-3 h-3 mr-1 text-[#296B6E]" />
                          {beneficiaryStr}
                        </div>
                        <div className="text-[10px] text-purple-700 font-semibold mt-0.5 flex items-center">
                          <Award className="w-3 h-3 mr-1 text-purple-500" />
                          {caller?.hasDisabilityCertificate === "tak"
                            ? "Tak (" + (caller.disabilityDegree || "posiada") + ")"
                            : caller?.hasDisabilityCertificate === "w trakcie"
                            ? "W trakcie"
                            : "Brak"}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 max-w-xs">
                        <span
                          className={"inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border " + getGuidanceBadge(rec.guidanceType)}
                        >
                          {rec.guidanceType}
                        </span>
                        {rec.guidanceAreas && rec.guidanceAreas.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {rec.guidanceAreas.join(", ")}
                          </div>
                        )}
                      </td>

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

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{rec.specialistName}</div>
                        {rec.referredTo && (
                          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                            <Share2 className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[130px]">{rec.referredTo}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {canEditRecord(rec) ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRecord(rec);
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-[#FFB200] text-amber-950 border border-amber-300 rounded-xl transition-all shadow-2xs cursor-pointer"
                              title={currentSpecialist.isAdmin ? "Edytuj wpis jako administrator" : "Edytuj własną poradę"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 text-slate-300"
                              title="Tylko autor lub administrator może edytować ten wpis"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCaller(rec);
                            }}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-[#FFB200] hover:text-[#2D2A28] text-amber-950 font-bold rounded-xl transition-all flex items-center space-x-1 shadow-xs border border-amber-200 cursor-pointer text-xs"
                          >
                            <span>Kartoteka</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredRecords.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 text-slate-500 font-medium">
              <span>
                Pokazano <strong className="text-slate-800">{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredRecords.length)}</strong> z <strong className="text-slate-800">{filteredRecords.length}</strong> porad
              </span>

              <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
                <span>Wierszy na stronę:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Poprzednia</span>
              </button>

              <div className="flex items-center space-x-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setPage(pg)}
                    className={"w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer " + (
                      page === pg
                        ? "bg-[#2D2A28] text-[#FFB200] shadow-xs"
                        : "text-slate-600 hover:bg-slate-200/70"
                    )}
                  >
                    {pg}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              >
                <span>Następna</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
