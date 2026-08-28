import React, { useState, useEffect } from "react";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
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
import { AttachmentsManager } from "./AttachmentsManager";
import { ReferralSelector } from "./ReferralSelector";
import { todayDateInputValue, callDateToIso } from "../services/callDate";
import {
  X,
  PlusCircle,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Paperclip,
  Share2,
  Tag,
  Phone,
  Mail,
  Users,
} from "lucide-react";
import confetti from "canvas-confetti";

export const NewCallRecordModal: React.FC = () => {
  const {
    selectedCaller,
    isNewRecordModalOpen,
    setIsNewRecordModalOpen,
    addNewRecord,
    specialists,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [guidanceType, setGuidanceType] = useState<GuidanceType>(
    currentSpecialist.guidanceType || "w zakresie psychologii i rehabilitacji społecznej"
  );
  const [guidanceAreas, setGuidanceAreas] = useState<string[]>([]);
  const [contactTypes, setContactTypes] = useState<ContactType[]>(["telefon"]);
  const [subjectTargets, setSubjectTargets] = useState<SubjectTarget[]>(["dziecko"]);
  const [adviceDescription, setAdviceDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [referredTo, setReferredTo] = useState("");
  const [referredSpecialistId, setReferredSpecialistId] = useState("");
  const [referredNote, setReferredNote] = useState("");
  const [callDate, setCallDate] = useState<string>(() => todayDateInputValue());
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When specialist changes or guidanceType changes, reset areas if not valid
  useEffect(() => {
    const availableAreas = GUIDANCE_AREAS_MAP[guidanceType] || [];
    if (availableAreas.length > 0 && guidanceAreas.length === 0) {
      setGuidanceAreas([availableAreas[0]]);
    }
  }, [guidanceType]);

  if (!isNewRecordModalOpen || !selectedCaller) return null;

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
      alert("Proszę wpisać krótki opis, czego dotyczyła porada.");
      return;
    }

    setIsSubmitting(true);
    addNewRecord({
      callerId: selectedCaller.id,
      callDate: callDateToIso(callDate),
      specialistId: currentSpecialist.id,
      specialistName: currentSpecialist.name,
      specialistRole: currentSpecialist.role,
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

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (_) {}

    setIsSubmitting(false);
    setIsNewRecordModalOpen(false);

    // Reset form
    setAdviceDescription("");
    setNotes("");
    setReferredTo("");
    setReferredSpecialistId("");
    setReferredNote("");
    setCallDate(todayDateInputValue());
    setAttachments([]);
  };

  const availableAreas = GUIDANCE_AREAS_MAP[guidanceType] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/40">
                Nowy wpis poradniczy
              </span>
              <span className="text-xs text-slate-300">
                Dyżurujący: <strong className="text-white">{currentSpecialist.name}</strong>
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {selectedCaller.firstName} {selectedCaller.lastName} &bull; {selectedCaller.city} ({selectedCaller.voivodeship})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsNewRecordModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* 1. Rodzaj poradnictwa */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              1. Rodzaj poradnictwa (wybór jednokrotny):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {GUIDANCE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setGuidanceType(type)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border text-left transition-all cursor-pointer ${
                    guidanceType === type
                      ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200] shadow-sm"
                      : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                  }`}
                >
                  <div className="capitalize-first">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Obszar, którego dotyczy porada (Kaskadowy wielokrotny) */}
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
                        : "bg-white dark:bg-[#1C1A19] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-amber-50 dark:hover:bg-[#2F271B]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-[#FFB200] dark:bg-[#2D2A28]" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span>{area}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Rodzaj kontaktu & Kogo dotyczy porada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rodzaj kontaktu */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">
                3. Rodzaj kontaktu (wielokrotny):
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

            {/* Kogo dotyczy porada */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">
                4. Kogo dotyczy porada (wielokrotny):
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

          {/* 5. Rodzaj porady (krótki opis, czego dotyczyła) */}
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

          {/* 6. Uwagi */}
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

          {/* 7. Przekazanie do dyżurującego konsultanta */}
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

          {/* Czas trwania */}
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

          {/* 8. Data porady & Załączniki */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="sm:col-span-2 mt-2 pt-2 border-t border-slate-100 dark:border-[#2C2927]">
              <AttachmentsManager attachments={attachments} onChange={setAttachments} specialistName={currentSpecialist.name} title="Załączniki do tej porady (PDF, obrazy, Excel, dokumenty tekstowe)" />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#2C2927] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsNewRecordModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Zapisz poradę w kartotece</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
