import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  GuidanceType,
  GUIDANCE_TYPES,
  GUIDANCE_AREAS_MAP,
  ContactType,
  CONTACT_TYPES,
  SubjectTarget,
  SUBJECT_TARGETS,
} from "../types";
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
    currentSpecialist,
    specialists,
  } = useApp();

  const [guidanceType, setGuidanceType] = useState<GuidanceType>(
    currentSpecialist.guidanceType || "w zakresie psychologii i rehabilitacji społecznej"
  );
  const [guidanceAreas, setGuidanceAreas] = useState<string[]>([]);
  const [contactTypes, setContactTypes] = useState<ContactType[]>(["telefon"]);
  const [subjectTargets, setSubjectTargets] = useState<SubjectTarget[]>(["dziecko"]);
  const [adviceDescription, setAdviceDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [referredTo, setReferredTo] = useState("");
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
      callDate: new Date().toISOString(),
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
  };

  const availableAreas = GUIDANCE_AREAS_MAP[guidanceType] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Nowy wpis poradniczy
              </span>
              <span className="text-xs text-slate-400">
                Dyżurujący: <strong>{currentSpecialist.name}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {selectedCaller.firstName} {selectedCaller.lastName} &bull; {selectedCaller.city} ({selectedCaller.voivodeship})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsNewRecordModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* 1. Rodzaj poradnictwa */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              1. Rodzaj poradnictwa (wybór jednokrotny):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {GUIDANCE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setGuidanceType(type)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border text-left transition-all ${
                    guidanceType === type
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-[10px] opacity-75 uppercase">Rodzaj</div>
                  <div className="capitalize mt-0.5">{type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Obszar, którego dotyczy porada (Kaskadowy wielokrotny) */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3.5">
            <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">
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
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all text-left flex items-center space-x-1.5 ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-slate-300"}`} />
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
              <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[11px]">
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
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors capitalize ${
                        sel
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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
              <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[11px]">
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
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors capitalize ${
                        sel
                          ? "bg-purple-700 text-white border-purple-700"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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
            <label className="block font-bold text-slate-800 mb-1">
              5. Rodzaj porady (krótki opis, czego dotyczyła) <span className="text-red-500">*</span>:
            </label>
            <textarea
              required
              rows={3}
              value={adviceDescription}
              onChange={(e) => setAdviceDescription(e.target.value)}
              placeholder="Wpisz treść i zagadnienie zgłoszone przez osobę dzwoniącą..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 font-medium"
            />
          </div>

          {/* 6. Uwagi */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              6. Uwagi (udzielone zalecenia, wskazówki, notatka):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jakie kroki zalecono, jakie informacje przekazano, wskazówki dla kolejnego dyżuru..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* 7. Przekazane do innego specjalisty & Czas trwania */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                7. Przekazane do innego specjalisty (opcjonalnie):
              </label>
              <input
                type="text"
                value={referredTo}
                onChange={(e) => setReferredTo(e.target.value)}
                placeholder="Np. mec. Anna Nowak (konsultacja orzeczenia WZON)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Czas trwania rozmowy:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 rounded-lg font-bold border transition-colors text-center ${
                      durationMinutes === mins
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsNewRecordModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
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
