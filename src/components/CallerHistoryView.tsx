import React, { useState } from "react";
import { Caller, GuidanceType, Attachment } from "../types";
import { useApp } from "../context/AppContext";
import {
  Phone,
  MapPin,
  Clock,
  PlusCircle,
  Sparkles,
  AlertCircle,
  Tag,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Award,
  Share2,
  Paperclip,
  Users,
  FolderOpen,
} from "lucide-react";
import { AttachmentsManager } from "./AttachmentsManager";

interface Props {
  caller: Caller;
}

export const CallerHistoryView: React.FC<Props> = ({ caller }) => {
  const {
    getCallerRecords,
    setSelectedCaller,
    setIsNewRecordModalOpen,
    livePresenceSpecialist,
    currentSpecialist,
    updateCaller,
    addRecordAttachment,
    removeRecordAttachment,
  } = useApp();

  const [activeViewMode, setActiveViewMode] = useState<"TIMELINE" | "DOCS">("TIMELINE");

  const records = getCallerRecords(caller?.id || "");

  const getGuidanceBadgeColor = (type?: GuidanceType) => {
    switch (type) {
      case "prawno-obywatelskie":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20";
      case "w zakresie psychologii i rehabilitacji społecznej":
        return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20";
      case "Parent to Parent":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20";
      case "społeczne":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20";
    }
  };

  // Safe 5-second Smart Summary
  const generateSummary = () => {
    if (!records || records.length === 0) {
      return "Nowo zarejestrowana osoba bez wcześniejszych wpisów.";
    }
    const firstRec = records[0];
    const desc = (firstRec.adviceDescription || "Brak opisu").substring(0, 110);
    const nts = (firstRec.notes || "Brak uwag").substring(0, 120);

    if (records.length === 1) {
      const spec = firstRec.specialistName || "Specjalista";
      const typeStr = firstRec.guidanceType || "konsultacja";
      return `Osoba dzwoniła 1 raz do specjalisty ${spec} (${typeStr}). Porada dotyczyła: ${desc}...`;
    }

    const specialistsInvolved = Array.from(
      new Set(records.map((r) => r.specialistName || "Specjalista"))
    ).join(", ");
    const typesInvolved = Array.from(
      new Set(records.map((r) => r.guidanceType || "Inna"))
    ).join(", ");

    const callDateStr = firstRec.callDate
      ? new Date(firstRec.callDate).toLocaleDateString("pl-PL")
      : "niedawno";

    return `Osoba dzwoniła łącznie ${records.length} razy. Doradzali: ${specialistsInvolved} (${typesInvolved}). Ostatnia porada udzielona ${callDateStr}: ${desc}. Uwagi: ${nts}...`;
  };

  if (!caller) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Nie odnaleziono danych dzwoniącego</h3>
        <button
          type="button"
          onClick={() => setSelectedCaller(null)}
          className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
        >
          Wróć do listy
        </button>
      </div>
    );
  }

  const beneficiaryStr =
    caller.beneficiaryTypes && caller.beneficiaryTypes.length > 0
      ? caller.beneficiaryTypes.join(", ")
      : "Rodzic / Opiekun";

  const handleCallerAttachmentsChange = (newAtts: Attachment[]) => {
    updateCaller({
      ...caller,
      attachments: newAtts,
    });
  };

  const handleRecordAttachmentsChange = (recordId: string, newAtts: Attachment[]) => {
    const rec = records.find((r) => r.id === recordId);
    if (!rec) return;
    const currentAtts = rec.attachments || [];

    // Find added
    const added = newAtts.filter((a) => !currentAtts.some((c) => c.id === a.id));
    added.forEach((a) => addRecordAttachment(recordId, a));

    // Find removed
    const removed = currentAtts.filter((c) => !newAtts.some((a) => a.id === c.id));
    removed.forEach((a) => removeRecordAttachment(recordId, a.id));
  };

  const callerAttachmentsCount = caller.attachments?.length || 0;
  const totalRecordAttachmentsCount = records.reduce(
    (acc, r) => acc + (r.attachments?.length || 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Return & Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedCaller(null)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>← Wróć do rejestru / wyszukiwania</span>
        </button>

        <button
          type="button"
          onClick={() => setIsNewRecordModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Dodaj nową poradę (Alt + N)</span>
        </button>
      </div>

      {/* Caller Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Live Presence Alert if another specialist views this card */}
        {livePresenceSpecialist && (
          <div className="mb-4 bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>
                <strong>{livePresenceSpecialist}</strong> również ma otwartą tę kartotekę w czasie rzeczywistym!
              </span>
            </div>
            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">Synchronizacja Live</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {caller.firstName || "Anonim"} {caller.lastName || "Dzwoniący"}
              </h1>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                {records.length} {records.length === 1 ? "porada w historii" : "porady w historii"}
              </span>
            </div>

            {/* Sub-info Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600">
              <div className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {caller.phoneNumber || "Brak numeru"}
                </span>
              </div>

              <div className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span className="font-medium text-slate-800">{caller.city || "Brak miasta"}</span>
                <span className="mx-1 text-slate-300">•</span>
                <span className="text-slate-600 font-semibold">{caller.voivodeship || "Polska"}</span>
              </div>

              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                <span>
                  Beneficjent: <strong className="text-slate-800">{beneficiaryStr}</strong>
                </span>
              </div>

              <div className="flex items-center">
                <Award className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                <span>
                  Orzeczenie:{" "}
                  <strong className="text-slate-800">
                    {caller.hasDisabilityCertificate === "tak"
                      ? `Tak (${caller.disabilityDegree || "posiada"})`
                      : caller.hasDisabilityCertificate === "w trakcie"
                      ? "W trakcie procedury"
                      : "Brak"}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            {caller.tags &&
              caller.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>

        {/* 5-Second AI Briefing Box */}
        <div className="mt-5 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-purple-50/70 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-start space-x-2.5">
            <div className="bg-indigo-600 text-white p-1.5 rounded-xl shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-950">
                Szybki skrót kontekstu dla dyżurującego (5 sekund):
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {generateSummary()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs: Timeline vs Caller Documents */}
      <div className="flex items-center justify-between pt-2 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveViewMode("TIMELINE")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === "TIMELINE"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Oś czasu porad ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode("DOCS")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === "DOCS"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Dokumentacja pacjenta / dzwoniącego ({callerAttachmentsCount})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Łącznie załączników w kartotece: <strong>{callerAttachmentsCount + totalRecordAttachmentsCount}</strong>
        </div>
      </div>

      {/* View Mode 1: Caller Documents Tab */}
      {activeViewMode === "DOCS" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-in fade-in space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Główna dokumentacja dzwoniącego</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Załącz orzeczenia o niepełnosprawności, opinie poradni psychologiczno-pedagogicznych, IPET, wnioski WZON, tabele obserwacji oraz skany zaświadczeń lekarskich (PDF, JPG, PNG, Excel, DOCX, TXT).
            </p>
          </div>

          <AttachmentsManager
            attachments={caller.attachments || []}
            onChange={handleCallerAttachmentsChange}
            specialistName={currentSpecialist.name}
            title="Pliki przypisane bezpośrednio do profilu dzwoniącego"
          />
        </div>
      )}

      {/* View Mode 2: Timeline */}
      {activeViewMode === "TIMELINE" && (
        <>
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">Brak zarejestrowanych porad w tej kartotece</h3>
              <p className="text-xs text-slate-400 mt-1">
                Kliknij przycisk powyżej, aby zarejestrować pierwszą poradę z dzisiejszej rozmowy.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((rec, index) => {
                const dateFormatted = rec.callDate
                  ? new Date(rec.callDate).toLocaleString("pl-PL", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Brak daty";

                const recAtts = rec.attachments || [];

                return (
                  <div
                    key={rec.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden space-y-3.5"
                  >
                    {/* Top Row: Date, Duration, Specialist */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                          {records.length - index}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {dateFormatted}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {rec.durationMinutes || 30} min
                        </span>

                        {rec.contactTypes && rec.contactTypes.map((ct) => (
                          <span key={ct} className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                            {ct === "telefon" ? "📞 tel" : ct === "e-mail" ? "✉️ mail" : ct}
                          </span>
                        ))}

                        {rec.subjectTargets && rec.subjectTargets.map((st) => (
                          <span key={st} className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-100">
                            {st}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getGuidanceBadgeColor(
                            rec.guidanceType
                          )}`}
                        >
                          {rec.guidanceType || "Porada"}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                          {rec.specialistName || "Specjalista"} ({rec.specialistRole || "Konsultant"})
                        </span>
                      </div>
                    </div>

                    {/* Guidance Areas Badges */}
                    {rec.guidanceAreas && rec.guidanceAreas.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 mr-1">
                          Obszar:
                        </span>
                        {rec.guidanceAreas.map((area) => (
                          <span
                            key={area}
                            className="text-xs bg-indigo-50/70 text-indigo-900 font-semibold px-2.5 py-0.5 rounded-lg border border-indigo-100"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Problem / Description and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Rodzaj porady (opis, czego dotyczyła) */}
                      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                        <div className="font-bold text-slate-700 text-[10px] flex items-center mb-1.5">
                          <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Rodzaj porady (opis zgłoszenia)
                        </div>
                        <p className="text-slate-900 leading-relaxed whitespace-pre-wrap font-medium">
                          {rec.adviceDescription || "Brak opisu."}
                        </p>
                      </div>

                      {/* Uwagi */}
                      <div className="bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100/80">
                        <div className="font-bold text-indigo-900 text-[10px] flex items-center mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                          Uwagi, udzielona pomoc i wskazówki
                        </div>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {rec.notes || "Brak dodatkowych uwag."}
                        </p>
                      </div>
                    </div>

                    {/* Przekazane do innego specjalisty */}
                    {rec.referredTo && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-950 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Share2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            <strong>Przekazane do:</strong> {rec.referredTo}
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-200/60 font-bold px-2 py-0.5 rounded text-amber-900">
                          Kontynuacja
                        </span>
                      </div>
                    )}

                    {/* Record Attachments Manager */}
                    <div className="pt-2 border-t border-slate-100">
                      <AttachmentsManager
                        attachments={recAtts}
                        onChange={(newAtts) => handleRecordAttachmentsChange(rec.id, newAtts)}
                        specialistName={currentSpecialist.name}
                        title="Załączniki do tej porady"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
