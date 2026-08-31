import React, { useState } from "react";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import { ConfirmModal } from "./ConfirmModal";
import {
  GuidanceType,
  GUIDANCE_TYPES,
  GUIDANCE_AREAS_MAP,
  ContactType,
  CONTACT_TYPES,
  SubjectTarget,
  SUBJECT_TARGETS,
  Attachment,
} from "../types";
import {
  X,
  Clock,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Edit3,
  History,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { AttachmentsManager } from "./AttachmentsManager";
import { ReferralSelector } from "./ReferralSelector";
import { todayDateInputValue, callDateToIso } from "../services/callDate";

export const EditCallRecordModal: React.FC = () => {
  const {
    editingRecord,
    setEditingRecord,
    updateRecord,
    deleteRecord,
    specialists,
    callers,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [formError, setFormError] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [guidanceType, setGuidanceType] = useState<GuidanceType>(
    editingRecord?.guidanceType || "w zakresie psychologii i rehabilitacji społecznej"
  );
  const [guidanceAreas, setGuidanceAreas] = useState<string[]>(editingRecord?.guidanceAreas || []);
  const [contactTypes, setContactTypes] = useState<ContactType[]>(editingRecord?.contactTypes || ["telefon"]);
  const [subjectTargets, setSubjectTargets] = useState<SubjectTarget[]>(editingRecord?.subjectTargets || ["dziecko"]);
  const [adviceDescription, setAdviceDescription] = useState(editingRecord?.adviceDescription || "");
  const [notes, setNotes] = useState(editingRecord?.notes || "");
  const [referredTo, setReferredTo] = useState(editingRecord?.referredTo || "");
  const [referredSpecialistId, setReferredSpecialistId] = useState(editingRecord?.referredSpecialistId || "");
  const [referredNote, setReferredNote] = useState(editingRecord?.referredNote || "");
  const [callDate, setCallDate] = useState<string>(() => {
    if (editingRecord?.callDate) {
      try {
        return new Date(editingRecord.callDate).toISOString().slice(0, 10);
      } catch {
        return todayDateInputValue();
      }
    }
    return todayDateInputValue();
  });
  const [attachments, setAttachments] = useState<Attachment[]>(editingRecord?.attachments || []);
  const [durationMinutes, setDurationMinutes] = useState(editingRecord?.durationMinutes || 45);
  const [specialistId, setSpecialistId] = useState(editingRecord?.specialistId || currentSpecialist.id);
  const [showEditLogs, setShowEditLogs] = useState(false);

  const [prevRecordId, setPrevRecordId] = useState(editingRecord?.id);
  if (editingRecord && prevRecordId !== editingRecord.id) {
    setPrevRecordId(editingRecord.id);
    setGuidanceType(editingRecord.guidanceType || "w zakresie psychologii i rehabilitacji społecznej");
    setGuidanceAreas(editingRecord.guidanceAreas || []);
    setContactTypes(editingRecord.contactTypes || ["telefon"]);
    setSubjectTargets(editingRecord.subjectTargets || ["dziecko"]);
    setAdviceDescription(editingRecord.adviceDescription || "");
    setNotes(editingRecord.notes || "");
    setReferredTo(editingRecord.referredTo || "");
    setReferredSpecialistId(editingRecord.referredSpecialistId || "");
    setReferredNote(editingRecord.referredNote || "");
    setAttachments(editingRecord.attachments || []);
    setDurationMinutes(editingRecord.durationMinutes || 30);
    setSpecialistId(editingRecord.specialistId || currentSpecialist.id);

    if (editingRecord.callDate) {
      try {
        const d = new Date(editingRecord.callDate);
        setCallDate(d.toISOString().slice(0, 10));
      } catch {
        setCallDate(todayDateInputValue());
      }
    }
  }

  if (!editingRecord) return null;

  const caller = callers.find((c) => c.id === editingRecord.callerId);

  const toggleArea = (area: string) => {
    setGuidanceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const toggleContactType = (type: ContactType) => {
    setContactTypes((prev) =>
      prev.includes(type) ? (prev.length > 1 ? prev.filter((t) => t !== type) : prev) : [...prev, type]
    );
  };

  const toggleSubjectTarget = (target: SubjectTarget) => {
    setSubjectTargets((prev) =>
      prev.includes(target) ? (prev.length > 1 ? prev.filter((t) => t !== target) : prev) : [...prev, target]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adviceDescription.trim()) {
      setFormError("Proszę wpisać krótki opis, czego dotyczyła porada.");
      return;
    }
    setFormError(null);

    const assignedSpec = specialists.find((s) => s.id === specialistId) || currentSpecialist;

    updateRecord({
      ...editingRecord,
      callDate: callDateToIso(callDate),
      specialistId: assignedSpec.id,
      specialistName: assignedSpec.name,
      specialistRole: assignedSpec.role,
      contactTypes,
      subjectTargets,
      guidanceType,
      guidanceAreas: guidanceAreas.length > 0 ? guidanceAreas : ["inne"],
      adviceDescription: adviceDescription.trim(),
      notes: notes.trim(),
      referredTo: referredTo.trim(),
      referredSpecialistId: referredSpecialistId || undefined,
      referredNote: referredNote.trim() || undefined,
      attachments,
      durationMinutes,
    });

    setEditingRecord(null);
  };

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const availableAreas = GUIDANCE_AREAS_MAP[guidanceType] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-400/40">
                <Edit3 className="w-3 h-3" />
                <span>Edycja wpisu porady</span>
              </span>
              {currentSpecialist.isAdmin && (
                <span className="text-xs bg-rose-500/30 text-rose-300 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-rose-500/40">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Uprawnienia administratora</span>
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {caller ? `${caller.firstName} ${caller.lastName} • ${caller.city} (${caller.voivodeship})` : "Edycja porady"}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setEditingRecord(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {formError && (
            <div className="flex items-center space-x-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-2xl text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Specjalista (Admin can reassign) */}
          {currentSpecialist.isAdmin && (
            <div className="bg-amber-50/80 dark:bg-[#241E15] border border-amber-200 dark:border-amber-600/40 rounded-2xl p-3.5 space-y-2">
              <div>
                <span className="font-bold text-amber-950 dark:text-[#FFB200] block text-xs">Autor wpisu (przypisany specjalista):</span>
                <span className="text-[11px] text-amber-800 dark:text-amber-300">Jako administrator możesz zmienić autora tej konsultacji.</span>
              </div>
              <div className="relative">
                <select
                  value={specialistId}
                  onChange={(e) => setSpecialistId(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-[#1E1C1A] border border-amber-300 dark:border-amber-600/50 rounded-xl pl-3 pr-9 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  {specialists.map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-[#1E1C1A]">
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* 1. Rodzaj poradnictwa */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              1. Rodzaj poradnictwa (wybór jednokrotny):
            </label>
            <div className="flex flex-wrap gap-2">
              {GUIDANCE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setGuidanceType(type)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border whitespace-nowrap transition-all cursor-pointer ${
                    guidanceType === type
                      ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200] shadow-sm"
                      : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Guidance Area (Cascading multi-select) */}
          <div className="bg-amber-50/60 dark:bg-[#241E15] border border-amber-200/80 dark:border-amber-600/40 rounded-2xl p-3.5">
            <label className="block text-xs font-bold text-[#2D2A28] dark:text-[#FFB200] mb-2">
              2. Obszar, którego dotyczy porada (wybór wielokrotny powiązany z &quot;{guidanceType}&quot;):
            </label>
            <div className="flex flex-wrap gap-2">
              {availableAreas.map((area) => {
                const isSelected = guidanceAreas.includes(area);
                return (
                  <button
                    type="button"
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all text-left flex items-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200] shadow-xs font-bold"
                        : "bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-amber-50 dark:hover:bg-[#2F271B]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-[#FFB200] dark:bg-[#2D2A28]" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span>{area}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Contact Type & 4. Subject Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Type */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">
                3. Rodzaj kontaktu:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CONTACT_TYPES.map((ct) => {
                  const sel = contactTypes.includes(ct);
                  return (
                    <button
                      type="button"
                      key={ct}
                      onClick={() => toggleContactType(ct)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                        sel
                          ? "bg-slate-900 dark:bg-[#FFB200] text-white dark:text-[#2D2A28] border-slate-900 dark:border-[#FFB200]"
                          : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                      }`}
                    >
                      {ct === "telefon" ? "📞 Telefon" : ct === "e-mail" ? "✉️ E-mail" : ct === "osobisty" ? "👤 Osobisty" : "Inne"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Target */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">
                4. Kogo dotyczy porada:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECT_TARGETS.map((st) => {
                  const sel = subjectTargets.includes(st);
                  return (
                    <button
                      type="button"
                      key={st}
                      onClick={() => toggleSubjectTarget(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                        sel
                          ? "bg-purple-700 dark:bg-purple-600 text-white border-purple-700 dark:border-purple-600"
                          : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                      }`}
                    >
                      {st === "dziecko" ? "👶 Dziecko" : st === "osoba dorosła" ? "🧑 Osoba dorosła" : "Inne"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Advice Description */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              5. Rodzaj porady (krótki opis, czego dotyczyła) <span className="text-red-500">*</span>:
            </label>
            <textarea
              required
              rows={3}
              value={adviceDescription}
              onChange={(e) => setAdviceDescription(e.target.value)}
              placeholder="Wpisz treść i zagadnienie zgłoszone podczas kontaktu..."
              className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400 font-medium"
            />
          </div>

          {/* 6. Notes */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              6. Uwagi (udzielone zalecenia, wskazówki, notatka):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jakie kroki zalecono, jakie informacje przekazano, wskazówki dla kolejnego dyżuru..."
              className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>

          {/* 7. Referral & Duration */}
          <div className="space-y-3">
            <ReferralSelector
              specialists={specialists}
              currentSpecialist={currentSpecialist}
              selectedSpecialistId={referredSpecialistId}
              onSelectSpecialist={(spec) => {
                if (spec) {
                  setReferredSpecialistId(spec.id);
                  setReferredTo(spec.name);
                } else {
                  setReferredSpecialistId("");
                  setReferredTo("");
                }
              }}
              referralNote={referredNote}
              onChangeNote={setReferredNote}
            />

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Czas trwania rozmowy:
              </label>
              <div className="grid grid-cols-4 gap-1.5 max-w-xs">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 rounded-lg font-bold border transition-colors text-center cursor-pointer ${
                      durationMinutes === mins
                        ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200]"
                        : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 8. Data porady */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              8. Kiedy udzielono porady:
            </label>
            <input
              type="date"
              value={callDate}
              max={todayDateInputValue()}
              onChange={(e) => setCallDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none"
            />
          </div>

          {/* 9. Attachments */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#2C2927]">
            <AttachmentsManager
              attachments={attachments}
              onChange={setAttachments}
              specialistName={currentSpecialist.name}
              title="Załączniki do tej porady (PDF, obrazy, Excel, dokumenty)"
            />
          </div>

          {/* 10. Previous edit history audit log */}
          {editingRecord.editLogs && editingRecord.editLogs.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-[#2C2927]">
              <button
                type="button"
                onClick={() => setShowEditLogs((v) => !v)}
                className="w-full flex items-center justify-between p-2.5 bg-amber-50/70 dark:bg-[#1C1814] hover:bg-amber-100/60 dark:hover:bg-[#262018] border border-amber-200 dark:border-amber-700/40 rounded-2xl transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center space-x-2 font-bold text-amber-950 dark:text-[#FFDF06]">
                  <History className="w-4 h-4 text-amber-700 dark:text-[#FFB200]" />
                  <span>Historia poprzednich edycji ({editingRecord.editLogs.length})</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-amber-900 dark:text-amber-300 font-semibold">
                  <span>{showEditLogs ? "Zwiń" : "Rozwiń historię"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showEditLogs ? "rotate-180" : "rotate-0"}`} />
                </div>
              </button>

              {showEditLogs && (
                <div className="mt-2.5 space-y-2.5 max-h-56 overflow-y-auto pr-1 animate-in fade-in">
                  {editingRecord.editLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white dark:bg-[#141312] border border-slate-200 dark:border-[#2C2927] rounded-xl p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] border-b border-slate-100 dark:border-[#24211E] pb-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {log.editorName} ({log.editorRole})
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {new Date(log.editedAt).toLocaleString("pl-PL", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                        {log.summary}
                      </div>
                      <div className="space-y-1 pt-0.5">
                        {log.changes.map((c, i) => (
                          <div key={i} className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#1B1917] p-1.5 rounded-lg">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{c.label}:</span>{" "}
                            <span className="text-rose-600 dark:text-rose-400 line-through mr-1">{c.oldValue}</span>
                            <span>➔</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold ml-1">{c.newValue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#2C2927] flex items-center justify-between">
            {currentSpecialist.isAdmin ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl font-bold transition-colors cursor-pointer text-xs border border-rose-200 dark:border-rose-900/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Usuń tę poradę z bazy</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Zapisz zmiany w poradzie</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Record Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          title="Usuwanie porady"
          variant="danger"
          confirmText="Usuń poradę"
          description="Czy na pewno chcesz bezpowrotnie usunąć ten wpis porady z bazy danych? Tej operacji nie można cofnąć."
          onConfirm={() => {
            setIsConfirmDeleteOpen(false);
            deleteRecord(editingRecord.id);
            setEditingRecord(null);
          }}
          onClose={() => setIsConfirmDeleteOpen(false)}
        />
      )}
    </div>
  );
};
