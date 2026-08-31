import React, { useState } from "react";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import {
  Voivodeship,
  VOIVODESHIPS,
  BeneficiaryType,
  BENEFICIARY_TYPES,
  DisabilityCertificateStatus,
  DisabilityDegree,
  DISABILITY_DEGREES,
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
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { fireConfetti } from "../utils/confetti";

export const NewCallerModal: React.FC = () => {
  const {
    isNewCallerModalOpen,
    setIsNewCallerModalOpen,
    addNewCaller,
    addNewRecord,
    setSelectedCaller,
    searchQuery,
    specialists,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState(() => searchQuery || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [voivodeship, setVoivodeship] = useState<Voivodeship>("mazowieckie");
  const [city, setCity] = useState("");
  const [beneficiaryTypes, setBeneficiaryTypes] = useState<BeneficiaryType[]>(["rodzic"]);
  const [hasDisabilityCertificate, setHasDisabilityCertificate] = useState<DisabilityCertificateStatus>("tak");
  const [disabilityDegree, setDisabilityDegree] = useState<DisabilityDegree>("orzeczenie o niepełnosprawności");
  const [tagInput, setTagInput] = useState("Syn 7 lat, Wczesna diagnoza");

  // Optional: add first call record immediately
  const [addRecordNow, setAddRecordNow] = useState(true);
  const [guidanceType, setGuidanceType] = useState<GuidanceType>(
    currentSpecialist.guidanceType || "w zakresie psychologii i rehabilitacji społecznej"
  );
  const [guidanceAreas, setGuidanceAreas] = useState<string[]>(() => {
    const areas =
      GUIDANCE_AREAS_MAP[currentSpecialist.guidanceType || "w zakresie psychologii i rehabilitacji społecznej"];
    return areas ? [areas[0]] : [];
  });
  const [callDate, setCallDate] = useState<string>(() => todayDateInputValue());
  const [contactTypes, setContactTypes] = useState<ContactType[]>(["telefon"]);
  const [subjectTargets, setSubjectTargets] = useState<SubjectTarget[]>(["dziecko"]);
  const [referredTo, setReferredTo] = useState("");
  const [referredSpecialistId, setReferredSpecialistId] = useState("");
  const [referredNote, setReferredNote] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [adviceDescription, setAdviceDescription] = useState("");
  const [notes, setNotes] = useState("");

  if (!isNewCallerModalOpen) return null;

  const toggleBeneficiary = (b: BeneficiaryType) => {
    setBeneficiaryTypes((prev) =>
      prev.includes(b) ? (prev.length > 1 ? prev.filter((item) => item !== b) : prev) : [...prev, b]
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

  const toggleArea = (area: string) => {
    setGuidanceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleGuidanceTypeChange = (type: GuidanceType) => {
    setGuidanceType(type);
    const areas = GUIDANCE_AREAS_MAP[type] || [];
    setGuidanceAreas(areas.length > 0 ? [areas[0]] : []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim()) {
      alert("Proszę podać nazwisko lub identyfikator kontaktu.");
      return;
    }

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const createdCaller = addNewCaller({
      firstName: firstName.trim() || "Anonim",
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      voivodeship,
      city: city.trim() || "Nie podano",
      beneficiaryTypes,
      hasDisabilityCertificate,
      disabilityDegree: hasDisabilityCertificate === "tak" ? disabilityDegree : "brak / nie dotyczy",
      tags,
    });

    if (addRecordNow && adviceDescription.trim()) {
      const defaultAreas = GUIDANCE_AREAS_MAP[guidanceType] || ["inne"];
      addNewRecord({
        callerId: createdCaller.id,
        callDate: callDateToIso(callDate),
        specialistId: currentSpecialist.id,
        specialistName: currentSpecialist.name,
        specialistRole: currentSpecialist.role,
        contactTypes,
        subjectTargets,
        guidanceType,
        guidanceAreas: guidanceAreas.length > 0 ? guidanceAreas : [defaultAreas[0]],
        adviceDescription: adviceDescription.trim(),
        notes: notes.trim(),
        referredTo: referredTo.trim(),
        referredSpecialistId: referredSpecialistId || undefined,
        referredNote: referredNote.trim() || undefined,
        attachments,
        durationMinutes: 30,
      });
    }

    try {
      fireConfetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setSelectedCaller(createdCaller);
    setIsNewCallerModalOpen(false);

    // Reset
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setCity("");
    setAdviceDescription("");
    setNotes("");
    setCallDate(todayDateInputValue());
    setContactTypes(["telefon"]);
    setSubjectTargets(["dziecko"]);
    setReferredTo("");
    setReferredSpecialistId("");
    setReferredNote("");
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#FFB200] text-[#2D2A28] p-2 rounded-xl font-bold shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Nowy kontakt</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNewCallerModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Imię (opcjonalnie):
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Np. Katarzyna"
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nazwisko lub pseudonim <span className="text-red-500">*</span>:
              </label>
              <input
                required
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Np. Kowalska"
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none font-semibold placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
          </div>

          {/* Contact & Location Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Numer telefonu:
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Np. 601 234 567"
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none font-mono placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Województwo:
              </label>
              <select
                value={voivodeship}
                onChange={(e) => setVoivodeship(e.target.value as Voivodeship)}
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none"
              >
                {VOIVODESHIPS.map((v) => (
                  <option key={v} value={v} className="dark:bg-[#1E1C1A]">
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Miejscowość:
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Np. Warszawa"
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
          </div>

          {/* Kim jest beneficjent (Wielokrotny) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">
              Kim jest beneficjent (wybór wielokrotny):
            </label>
            <div className="flex flex-wrap gap-2">
              {BENEFICIARY_TYPES.map((b) => {
                const isSel = beneficiaryTypes.includes(b);
                return (
                  <button
                    type="button"
                    key={b}
                    onClick={() => toggleBeneficiary(b)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                      isSel
                        ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200] shadow-xs"
                        : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                    }`}
                  >
                    {b === "rodzic" ? "👨‍👩‍👧 Rodzic" : b === "opiekun" ? "🛡️ Opiekun" : b === "osoba dorosła w spektrum" ? "🧠 Osoba dorosła w spektrum" : "Inne"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posiadanie orzeczenia & Stopień niepełnosprawności */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 dark:bg-[#161514] p-3.5 rounded-2xl border border-slate-200 dark:border-[#2C2927]">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Posiadanie orzeczenia o niepełnosprawności:
              </label>
              <select
                value={hasDisabilityCertificate}
                onChange={(e) => setHasDisabilityCertificate(e.target.value as DisabilityCertificateStatus)}
                className="w-full bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none font-semibold"
              >
                <option value="tak" className="dark:bg-[#1E1C1A]">Tak (posiada)</option>
                <option value="nie" className="dark:bg-[#1E1C1A]">Nie (brak)</option>
                <option value="w trakcie" className="dark:bg-[#1E1C1A]">W trakcie diagnozy / procedury</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Stopień niepełnosprawności:
              </label>
              <select
                value={disabilityDegree}
                disabled={hasDisabilityCertificate === "nie"}
                onChange={(e) => setDisabilityDegree(e.target.value as DisabilityDegree)}
                className="w-full bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none disabled:opacity-40"
              >
                {DISABILITY_DEGREES.map((d) => (
                  <option key={d} value={d} className="dark:bg-[#1E1C1A]">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Tagi / słowa kluczowe (po przecinku):
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Np. Syn 7 lat, WZON punkt 7, Szkoła podstawowa"
              className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Section to register first call record immediately */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#2C2927]">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center space-x-2 font-bold text-[#2D2A28] dark:text-[#FFB200] cursor-pointer">
                <input
                  type="checkbox"
                  checked={addRecordNow}
                  onChange={(e) => setAddRecordNow(e.target.checked)}
                  className="rounded text-[#FFB200] focus:ring-[#FFB200] w-4 h-4 cursor-pointer"
                />
                <span>Zarejestruj od razu treść trwającej porady</span>
              </label>
            </div>

            {addRecordNow && (
              <div className="bg-indigo-50/40 dark:bg-[#161514] p-4 rounded-2xl border border-indigo-100 dark:border-[#2C2927] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Kiedy udzielono porady:
                    </label>
                    <input
                      type="date"
                      value={callDate}
                      max={todayDateInputValue()}
                      onChange={(e) => setCallDate(e.target.value)}
                      className="w-full bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Rodzaj poradnictwa:
                    </label>
                    <select
                      value={guidanceType}
                      onChange={(e) => handleGuidanceTypeChange(e.target.value as GuidanceType)}
                      className="w-full bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-xl p-2 text-xs font-bold text-[#2D2A28] dark:text-[#FFB200]"
                    >
                      {GUIDANCE_TYPES.map((t) => (
                        <option key={t} value={t} className="dark:bg-[#1E1C1A]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Obszar, którego dotyczy porada (wybór wielokrotny):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(GUIDANCE_AREAS_MAP[guidanceType] || []).map((area) => {
                      const isSel = guidanceAreas.includes(area);
                      return (
                        <button
                          type="button"
                          key={area}
                          onClick={() => toggleArea(area)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-colors text-left cursor-pointer ${
                            isSel
                              ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200] shadow-xs"
                              : "bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-amber-50 dark:hover:bg-[#2F271B]"
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Rodzaj kontaktu (wielokrotny):
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
                                : "bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                            }`}
                          >
                            {ct === "telefon" ? "📞 Telefon" : ct === "e-mail" ? "✉️ E-mail" : ct === "osobisty" ? "👤 Osobisty" : "Inne"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kogo dotyczy porada (wielokrotny):
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
                                : "bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                            }`}
                          >
                            {st === "dziecko" ? "👶 Dziecko" : st === "osoba dorosła" ? "🧑 Osoba dorosła" : "Inne"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Rodzaj porady (krótki opis, czego dotyczyła):
                  </label>
                  <textarea
                    rows={2}
                    value={adviceDescription}
                    onChange={(e) => setAdviceDescription(e.target.value)}
                    placeholder="Opis sprawy zgłoszonej przez osobę..."
                    className="w-full bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Uwagi i zalecenia:
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Wskazówki, udzielona pomoc..."
                    className="w-full bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                  />
                </div>

                {/* Przekazanie do innego specjalisty */}
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

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#2C2927]">
                  <AttachmentsManager attachments={attachments} onChange={setAttachments} specialistName={currentSpecialist.name} title="Załączniki (PDF, Excel, obrazy, DOCX)" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#2C2927] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsNewCallerModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Utwórz kartotekę</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
