import React, { useState } from "react";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import {
  Attachment,
  Caller,
  Voivodeship,
  VOIVODESHIPS,
  BeneficiaryType,
  BENEFICIARY_TYPES,
  DisabilityCertificateStatus,
  DisabilityDegree,
  DISABILITY_DEGREES,
} from "../types";
import { AttachmentsManager } from "./AttachmentsManager";
import {
  X,
  Phone,
  MapPin,
  Tag,
  CheckCircle2,
  Trash2,
  Award,
  Users,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import { fireConfetti } from "../utils/confetti";

export const EditCallerModal: React.FC = () => {
  const {
    editingCaller,
    setEditingCaller,
    updateCaller,
    deleteCaller,
    selectedCaller,
    setSelectedCaller,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [firstName, setFirstName] = useState(editingCaller?.firstName || "");
  const [lastName, setLastName] = useState(editingCaller?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(editingCaller?.phoneNumber || "");
  const [voivodeship, setVoivodeship] = useState<Voivodeship>(editingCaller?.voivodeship || "mazowieckie");
  const [city, setCity] = useState(editingCaller?.city || "");
  const [beneficiaryTypes, setBeneficiaryTypes] = useState<BeneficiaryType[]>(
    editingCaller?.beneficiaryTypes && editingCaller.beneficiaryTypes.length > 0
      ? editingCaller.beneficiaryTypes
      : ["rodzic"]
  );
  const [hasDisabilityCertificate, setHasDisabilityCertificate] =
    useState<DisabilityCertificateStatus>(editingCaller?.hasDisabilityCertificate || "tak");
  const [disabilityDegree, setDisabilityDegree] = useState<DisabilityDegree>(
    editingCaller?.disabilityDegree || "orzeczenie o niepełnosprawności"
  );
  const [tagInput, setTagInput] = useState((editingCaller?.tags || []).join(", "));
  const [attachments, setAttachments] = useState<Attachment[]>(editingCaller?.attachments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevCallerId, setPrevCallerId] = useState(editingCaller?.id);
  if (editingCaller && prevCallerId !== editingCaller.id) {
    setPrevCallerId(editingCaller.id);
    setFirstName(editingCaller.firstName || "");
    setLastName(editingCaller.lastName || "");
    setPhoneNumber(editingCaller.phoneNumber || "");
    setVoivodeship(editingCaller.voivodeship || "mazowieckie");
    setCity(editingCaller.city || "");
    setBeneficiaryTypes(
      editingCaller.beneficiaryTypes && editingCaller.beneficiaryTypes.length > 0
        ? editingCaller.beneficiaryTypes
        : ["rodzic"]
    );
    setHasDisabilityCertificate(editingCaller.hasDisabilityCertificate || "tak");
    setDisabilityDegree(
      editingCaller.disabilityDegree || "orzeczenie o niepełnosprawności"
    );
    setTagInput((editingCaller.tags || []).join(", "));
    setAttachments(editingCaller.attachments || []);
  }

  if (!editingCaller) return null;

  const toggleBeneficiary = (b: BeneficiaryType) => {
    setBeneficiaryTypes((prev) =>
      prev.includes(b)
        ? prev.length > 1
          ? prev.filter((item) => item !== b)
          : prev
        : [...prev, b]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim()) {
      alert("Proszę podać nazwisko lub identyfikator kontaktu.");
      return;
    }

    setIsSubmitting(true);

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: Caller = {
      ...editingCaller,
      firstName: firstName.trim() || "Anonim",
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim() || "Brak numeru",
      voivodeship,
      city: city.trim() || "Nie podano",
      beneficiaryTypes,
      hasDisabilityCertificate,
      disabilityDegree:
        hasDisabilityCertificate === "tak" ? disabilityDegree : "brak / nie dotyczy",
      tags,
      attachments,
      updatedAt: new Date().toISOString(),
    };

    updateCaller(updated);

    if (selectedCaller?.id === updated.id) {
      setSelectedCaller(updated);
    }

    try {
      fireConfetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setIsSubmitting(false);
    setEditingCaller(null);
  };

  const handleDelete = () => {
    if (!editingCaller) return;
    if (
      window.confirm(
        `Czy na pewno chcesz bezpowrotnie usunąć kartotekę kontaktu "${editingCaller.firstName} ${editingCaller.lastName}" oraz całą przypisaną historię porad?`
      )
    ) {
      deleteCaller(editingCaller.id);
      setEditingCaller(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#FFB200] text-[#2D2A28] p-2 rounded-xl font-bold shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Edycja Kartoteki Kontaktu</h2>
                {currentSpecialist.isAdmin && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Tryb Admina
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Aktualizuj dane osobowe, status orzeczenia oraz tagi osoby kontaktowej
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditingCaller(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Imię (opcjonalnie):
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="np. Anna"
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nazwisko / Identyfikator *
              </label>
              <input
                required
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="np. Kowalska (lub Mama Jasia)"
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
          </div>

          {/* Phone & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Numer telefonu:</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="np. 601 234 567"
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Miejscowość / Miasto:</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="np. Warszawa / Kraków"
                className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
          </div>

          {/* Voivodeship */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Województwo:
            </label>
            <select
              value={voivodeship}
              onChange={(e) => setVoivodeship(e.target.value as Voivodeship)}
              className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none cursor-pointer"
            >
              {VOIVODESHIPS.map((v) => (
                <option key={v} value={v} className="dark:bg-[#1E1C1A]">
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Beneficiary Type (Pills) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#296B6E] dark:text-[#FFB200]" />
              <span>Kim jest beneficjent (można zaznaczyć kilka):</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BENEFICIARY_TYPES.map((b) => {
                const isChecked = beneficiaryTypes.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBeneficiary(b)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center space-x-1.5 cursor-pointer ${
                      isChecked
                        ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] shadow-xs"
                        : "bg-slate-50 dark:bg-[#141312] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                    }`}
                  >
                    <span>{isChecked ? "✓" : "+"}</span>
                    <span className="capitalize">{b}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disability Certificate & Degree */}
          <div className="bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-2xl p-4 space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Posiadanie orzeczenia o niepełnosprawności:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "tak", label: "Tak (posiada)" },
                  { value: "nie", label: "Nie posiada" },
                  { value: "w trakcie", label: "W trakcie procedury" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHasDisabilityCertificate(opt.value as DisabilityCertificateStatus)}
                    className={`py-2 px-2.5 rounded-xl font-bold border transition-colors text-center text-xs cursor-pointer ${
                      hasDisabilityCertificate === opt.value
                        ? "bg-[#2D2A28] dark:bg-[#FFB200] text-[#FFB200] dark:text-[#2D2A28] border-[#2D2A28] dark:border-[#FFB200]"
                        : "bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431] hover:bg-slate-100 dark:hover:bg-[#2A2724]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasDisabilityCertificate === "tak" && (
              <div className="pt-2 border-t border-slate-200 dark:border-[#2C2927] animate-in fade-in">
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Stopień niepełnosprawności (dla osób powyżej 16 r.ż. lub dzieci):
                </label>
                <select
                  value={disabilityDegree}
                  onChange={(e) => setDisabilityDegree(e.target.value as DisabilityDegree)}
                  className="w-full bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none cursor-pointer"
                >
                  {DISABILITY_DEGREES.map((deg) => (
                    <option key={deg} value={deg} className="dark:bg-[#1E1C1A]">
                      {deg}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Tagi i słowa kluczowe (oddzielone przecinkami):</span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="np. Diagnoza WZON, Uczeń LO, Przedszkole integracyjne"
              className="w-full bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FFB200] focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Attachments */}
          <div className="bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-2xl p-4">
            <AttachmentsManager
              attachments={attachments}
              onChange={setAttachments}
              specialistName={currentSpecialist.name}
              title="Załączniki kartoteki (PDF, obrazy, Excel, DOCX)"
              canRemove={currentSpecialist.isAdmin}
            />
            {!currentSpecialist.isAdmin && attachments.length > 0 && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                Usuwanie załączników kartoteki jest dostępne wyłącznie dla Administratora.
              </p>
            )}
          </div>

          {/* Footer Buttons & Admin Delete */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#2C2927] flex items-center justify-between">
            <div>
              {currentSpecialist.isAdmin && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl font-bold border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                  title="Usuń całą kartotekę wraz z historią"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Usuń kartotekę (Admin)</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setEditingCaller(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Zapisz zmiany w kartotece</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
