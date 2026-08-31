import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Caller, GuidanceType, Attachment } from "../types";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import {
  Phone,
  MapPin,
  Clock,
  PlusCircle,
  Sparkles,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Award,
  Share2,
  Users,
  FolderOpen,
  Edit3,
  Lock,
  Inbox,
  MessageSquare,
  User,
  History,
} from "lucide-react";
import { AttachmentsManager } from "./AttachmentsManager";
import { RecordAuditLogModal } from "./RecordAuditLogModal";
import { pluralizePorady, pluralizePoradyWHistorii } from "../utils/pluralization";
import { CallRecord } from "../types";

interface Props {
  caller: Caller;
}

export const ContactHistoryView: React.FC<Props> = ({ caller }) => {
  const {
    getCallerRecords,
    setSelectedCaller,
    setIsNewRecordModalOpen,
    livePresenceSpecialist,
    updateCaller,
    addRecordAttachment,
    removeRecordAttachment,
    setEditingRecord,
    setEditingCaller,
    canEditRecord,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [activeViewMode, setActiveViewMode] = useState<"TIMELINE" | "DOCS">("TIMELINE");
  const [auditLogRecord, setAuditLogRecord] = useState<CallRecord | null>(null);

  const navigate = useNavigate();
  const records = getCallerRecords(caller?.id || "");

  const handleBack = () => {
    setSelectedCaller(null);
    navigate("/search");
  };

  const getGuidanceBadgeColor = (type?: GuidanceType) => {
    switch (type) {
      case "prawno-obywatelskie":
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 ring-blue-500/20";
      case "w zakresie psychologii i rehabilitacji społecznej":
        return "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 ring-purple-500/20";
      case "Parent to Parent":
        return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 ring-emerald-500/20";
      case "społeczne":
        return "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 ring-amber-500/20";
      default:
        return "bg-slate-50 dark:bg-[#282522] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] ring-slate-500/20";
    }
  };

  const firstRec = records[0];
  const specialistsInvolved = Array.from(
    new Set(records.map((r) => r.specialistName || "Specjalista"))
  ).join(", ");
  const typesInvolved = Array.from(
    new Set(records.map((r) => r.guidanceType || "Inna"))
  ).join(", ");
  const lastCallDateFormatted = firstRec?.callDate
    ? new Date(firstRec.callDate).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "niedawno";

  if (!caller) {
    return (
      <div className="bg-white dark:bg-[#242220] rounded-2xl border border-slate-200 dark:border-[#3E3A37] p-8 text-center shadow-xs">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 dark:text-white">Nie odnaleziono danych kontaktu</h3>
        <button
          type="button"
          onClick={handleBack}
          className="mt-3 px-4 py-1.5 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#296B6E] dark:hover:text-[#FFB200] bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#383431] shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>← Wróć do rejestru / wyszukiwania</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setEditingCaller(caller)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#1E1C1A] hover:bg-slate-50 dark:hover:bg-[#282522] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#383431] shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-[#296B6E] dark:text-[#FFB200]" />
            <span>Edytuj kartotekę</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewRecordModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Dodaj nową poradę</span>
          </button>
        </div>
      </div>

      {/* Caller Header Card */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Live Presence Alert if another specialist views this card */}
        {livePresenceSpecialist && (
          <div className="mb-4 bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>
                <strong>{livePresenceSpecialist}</strong> również ma otwartą tę kartotekę w czasie rzeczywistym!
              </span>
            </div>
            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">Synchronizacja live</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {caller.firstName || "Anonim"} {caller.lastName || "Dzwoniący"}
              </h1>
              <span className="bg-[#FFB200]/20 text-amber-950 dark:text-[#FFB200] text-xs font-bold px-2.5 py-1 rounded-full border border-[#FFB200]/40">
                {pluralizePoradyWHistorii(records.length)}
              </span>
              <button
                type="button"
                onClick={() => setEditingCaller(caller)}
                className="text-xs text-slate-500 hover:text-[#296B6E] dark:hover:text-[#FFB200] bg-slate-100 dark:bg-[#2A2724] hover:bg-slate-200 dark:hover:bg-[#383431] px-2.5 py-1 rounded-xl font-bold border border-slate-200 dark:border-[#383431] transition-colors flex items-center gap-1 cursor-pointer"
                title="Edytuj dane kontaktu"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#296B6E] dark:text-[#FFB200]" />
                <span>Edytuj</span>
              </button>
            </div>

            {/* Sub-info Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {caller.phoneNumber || "Brak numeru"}
                </span>
              </div>

              <div className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">{caller.city || "Brak miasta"}</span>
                <span className="mx-1 text-slate-400 dark:text-slate-600">•</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{caller.voivodeship || "Polska"}</span>
              </div>

              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-[#296B6E] dark:text-teal-400" />
                <span>
                  Beneficjent: <strong className="text-slate-900 dark:text-slate-100">{beneficiaryStr}</strong>
                </span>
              </div>

              <div className="flex items-center">
                <Award className="w-3.5 h-3.5 mr-1.5 text-purple-700 dark:text-purple-400" />
                <span>
                  Orzeczenie:{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
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
                  className="text-[11px] bg-slate-100 dark:bg-[#2A2724] text-slate-800 dark:text-slate-200 font-bold px-2.5 py-1 rounded-lg border border-slate-300 dark:border-[#383431]"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>

        {/* Pending Referral Alert for Current Specialist */}
        {(() => {
          const currentLastName = currentSpecialist.name.split(" ").pop()?.toLowerCase() || "";
          const pendingRef = records.find(
            (r) =>
              (r.referredSpecialistId === currentSpecialist.id ||
                (!r.referredSpecialistId &&
                  r.referredTo &&
                  r.referredTo.toLowerCase().includes(currentLastName))) &&
              (r.referredStatus === "OCZEKUJĄCA" || !r.referredStatus) &&
              r.referredTo
          );

          if (!pendingRef) return null;

          return (
            <div className="mt-4 bg-amber-500/15 dark:bg-amber-950/60 border-2 border-[#FFB200] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-start space-x-3 min-w-0">
                <div className="p-2 bg-[#FFB200] text-[#2D2A28] rounded-xl shrink-0 mt-0.5 shadow-2xs font-bold">
                  <Inbox className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 dark:text-white text-xs">
                      Sprawa przekazana do Twojej konsultacji
                    </span>
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                      Oczekuje na Twój kontakt
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    Przekazał/a: <strong>{pendingRef.specialistName}</strong>
                    {pendingRef.referredNote && (
                      <span className="block sm:inline sm:ml-1">
                        &bull; Notatka / wytyczne: <em>„{pendingRef.referredNote}”</em>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewRecordModalOpen(true)}
                className="px-3.5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs hover:shadow transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Udziel porady</span>
              </button>
            </div>
          );
        })()}

        {/* 5-Second AI Briefing Box */}
        <div className="mt-5 bg-gradient-to-r from-amber-50/90 via-slate-50 to-teal-50/60 dark:from-[#262015] dark:via-[#1D1B19] dark:to-[#162728] border border-amber-200/80 dark:border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-[#296B6E] text-white p-1.5 rounded-xl shadow-sm shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-[#FFB200]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#2D2A28] dark:text-[#FFB200]">
                Szybki skrót kontekstu dla dyżurującego (5 sekund):
              </div>

              {records.length === 0 ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  Nowo zarejestrowana osoba bez wcześniejszych wpisów.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                  {/* Punkt 1: Historia i konsultanci */}
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#296B6E] dark:bg-[#FFB200] shrink-0 mt-1.5" />
                    <div className="leading-relaxed">
                      <strong className="text-slate-900 dark:text-white font-bold">Historia kontaktu: </strong>
                      <span>
                        Łącznie <strong className="text-amber-950 dark:text-[#FFDF06] font-bold">{pluralizePorady(records.length)}</strong>
                        {specialistsInvolved ? (
                          <>
                            {" "}• Doradzali: <strong className="text-slate-900 dark:text-slate-100">{specialistsInvolved}</strong>
                            {typesInvolved ? <span className="text-slate-600 dark:text-slate-300"> ({typesInvolved})</span> : null}
                          </>
                        ) : null}
                        .
                      </span>
                    </div>
                  </li>

                  {/* Punkt 2: Ostatnia porada */}
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#296B6E] dark:bg-[#FFB200] shrink-0 mt-1.5" />
                    <div className="leading-relaxed">
                      <strong className="text-slate-900 dark:text-white font-bold">
                        Ostatnia porada ({lastCallDateFormatted}):{" "}
                      </strong>
                      <span className="text-slate-900 dark:text-slate-100 font-medium">
                        {firstRec?.adviceDescription || "Brak opisu zgłoszenia."}
                      </span>
                    </div>
                  </li>

                  {/* Punkt 3: Uwagi i zalecenia (jeśli istnieją) */}
                  {firstRec?.notes && (
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#296B6E] dark:bg-[#FFB200] shrink-0 mt-1.5" />
                      <div className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white font-bold">Uwagi i pomoc: </strong>
                        <span className="text-slate-800 dark:text-slate-200">
                          {firstRec.notes}
                        </span>
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs: Timeline vs Caller Documents */}
      <div className="flex items-center justify-between pt-2 border-b border-slate-200 dark:border-[#2C2927] pb-3">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveViewMode("TIMELINE")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === "TIMELINE"
                ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] shadow-sm"
                : "bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282522] border border-slate-200 dark:border-[#383431]"
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
                ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] shadow-sm"
                : "bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282522] border border-slate-200 dark:border-[#383431]"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Dokumentacja kontaktu ({callerAttachmentsCount + totalRecordAttachmentsCount})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Łącznie załączników w kartotece: <strong>{callerAttachmentsCount + totalRecordAttachmentsCount}</strong>
        </div>
      </div>

      {/* View Mode 1: Caller Documents Tab */}
      {activeViewMode === "DOCS" && (
        <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 shadow-sm animate-in fade-in space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Główna dokumentacja kontaktu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Załącz orzeczenia o niepełnosprawności, opinie poradni psychologiczno-pedagogicznych, IPET, wnioski WZON, tabele obserwacji oraz skany zaświadczeń lekarskich (PDF, JPG, PNG, Excel, DOCX, TXT).
            </p>
          </div>

          <AttachmentsManager
            attachments={caller.attachments || []}
            onChange={handleCallerAttachmentsChange}
            specialistName={currentSpecialist.name}
            title="Pliki przypisane bezpośrednio do profilu kontaktu"
            defaultExpanded={true}
          />

          {totalRecordAttachmentsCount > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-[#2C2927]">
              <AttachmentsManager
                attachments={records.flatMap((r) => r.attachments || [])}
                onChange={() => {}}
                specialistName={currentSpecialist.name}
                title="Załączniki dodane przy poszczególnych poradach (edycja przy wpisie na osi czasu)"
                readOnly
                defaultExpanded={true}
              />
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Timeline */}
      {activeViewMode === "TIMELINE" && (
        <>
          {records.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-slate-200 dark:border-[#383431] p-8 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Brak zarejestrowanych porad w tej kartotece</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
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
                const canEdit = canEditRecord(rec);

                return (
                  <div
                    key={rec.id}
                    className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden space-y-3.5"
                  >
                    {/* Top Row: Date, Duration, Specialist */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#2C2927]">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#2A2724] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-[#383431]">
                          {records.length - index}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {dateFormatted}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500" />
                          {rec.durationMinutes || 30} min
                        </span>

                        {rec.contactTypes && rec.contactTypes.map((ct) => (
                          <span key={ct} className="text-[10px] bg-slate-100 dark:bg-[#2A2724] text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded border border-slate-200/60 dark:border-[#383431]">
                            {ct === "telefon" ? "📞 tel" : ct === "e-mail" ? "✉️ mail" : ct}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${getGuidanceBadgeColor(
                            rec.guidanceType
                          )}`}
                        >
                          {rec.guidanceType || "Porada"}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-[#2A2724] text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-[#383431] whitespace-nowrap">
                          <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                          <span className="text-slate-500 dark:text-slate-400 font-normal">Specjalista:</span>
                          <span>{rec.specialistName || "Nieznany"}</span>
                        </span>

                        {rec.editLogs && rec.editLogs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setAuditLogRecord(rec)}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-950 dark:text-[#FFDF06] border border-amber-300 dark:border-amber-600/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            title={`Zobacz historię ${rec.editLogs.length} edycji tego wpisu`}
                          >
                            <History className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFB200]" />
                            <span>Historia zmian ({rec.editLogs.length})</span>
                          </button>
                        )}

                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => setEditingRecord(rec)}
                            className="flex items-center space-x-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-[#FFB200] border border-amber-300 dark:border-amber-600/50 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ml-1"
                            title={currentSpecialist.isAdmin ? "Edytuj tę poradę jako Administrator" : "Edytuj swoją poradę"}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFB200]" />
                            <span>Edytuj</span>
                          </button>
                        ) : (
                          <span
                            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-50 dark:bg-[#23211F] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#383431] rounded-xl text-[11px] font-medium"
                            title="Tylko autor lub administrator może edytować ten wpis"
                          >
                            <Lock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                            <span>Tylko odczyt</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject Targets & Guidance Areas Badges */}
                    {((rec.subjectTargets && rec.subjectTargets.length > 0) ||
                      (rec.guidanceAreas && rec.guidanceAreas.length > 0)) && (
                      <div className="space-y-1.5">
                        {rec.subjectTargets && rec.subjectTargets.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mr-1">
                              Dotyczy:
                            </span>
                            {rec.subjectTargets.map((st) => (
                              <span
                                key={st}
                                className="text-[10px] bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800/50"
                              >
                                {st}
                              </span>
                            ))}
                          </div>
                        )}

                        {rec.guidanceAreas && rec.guidanceAreas.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mr-1">
                              Obszar:
                            </span>
                            {rec.guidanceAreas.map((area) => (
                              <span
                                key={area}
                                className="text-xs bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-semibold px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-800/40"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Problem / Description and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Rodzaj porady (opis, czego dotyczyła) */}
                      <div className="bg-slate-50/80 dark:bg-[#161514] p-3.5 rounded-2xl border border-slate-200/80 dark:border-[#2C2927]">
                        <div className="font-bold text-slate-700 dark:text-slate-300 text-[10px] flex items-center mb-1.5">
                          <FileText className="w-3.5 h-3.5 mr-1 text-slate-500 dark:text-slate-400" />
                          Rodzaj porady (opis zgłoszenia)
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
                          {rec.adviceDescription || "Brak opisu."}
                        </p>
                      </div>

                      {/* Uwagi */}
                      <div className="bg-indigo-50/40 dark:bg-[#181B24] p-3.5 rounded-2xl border border-indigo-100/80 dark:border-indigo-950/60">
                        <div className="font-bold text-indigo-900 dark:text-indigo-300 text-[10px] flex items-center mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                          Uwagi, udzielona pomoc i wskazówki
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {rec.notes || "Brak dodatkowych uwag."}
                        </p>
                      </div>
                    </div>

                    {/* Przekazane do innego specjalisty */}
                    {rec.referredTo && (
                      <div className="bg-amber-50 dark:bg-[#251F14] border border-amber-200 dark:border-amber-600/40 rounded-2xl p-3 text-xs text-amber-950 dark:text-[#FFB200] space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <Share2 className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFB200] shrink-0" />
                            <span>
                              <strong>Przekazano do:</strong> {rec.referredTo}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              (rec.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA"
                                ? "bg-amber-200/70 dark:bg-amber-900/60 text-amber-950 dark:text-[#FFDF06] border-amber-300 dark:border-amber-700"
                                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            }`}
                          >
                            {(rec.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA"
                              ? "🟡 Oczekuje na kontakt"
                              : "🟢 Sprawa załatwiona"}
                          </span>
                        </div>
                        {rec.referredNote && (
                          <div className="text-[11px] text-amber-900 dark:text-amber-200/90 pl-5 flex items-start gap-1 italic">
                            <MessageSquare className="w-3 h-3 text-amber-700 dark:text-[#FFB200] shrink-0 mt-0.5" />
                            <span>„{rec.referredNote}”</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Record Attachments Manager */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#2C2927]">
                      <AttachmentsManager
                        attachments={recAtts}
                        onChange={(newAtts) => handleRecordAttachmentsChange(rec.id, newAtts)}
                        specialistName={currentSpecialist.name}
                        title="Załączniki do tej porady"
                        readOnly={!canEdit}
                        defaultExpanded={false}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Audit Log Modal */}
      <RecordAuditLogModal
        record={auditLogRecord}
        onClose={() => setAuditLogRecord(null)}
      />
    </div>
  );
};
