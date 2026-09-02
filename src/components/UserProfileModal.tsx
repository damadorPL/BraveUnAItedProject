import React, { useState, useRef } from "react";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import { Specialist, GUIDANCE_TYPES, GuidanceType } from "../types";
import { User, Mail, ShieldCheck, Check, X, Briefcase, Award, Palette, Camera, Upload, Trash2 } from "lucide-react";
import { SpecialistAvatar } from "./SpecialistAvatar";
import { validateAvatarFile, processAvatarImage } from "../utils/fileUtils";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { updateSpecialist } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [name, setName] = useState(currentSpecialist?.name || "");
  const [email, setEmail] = useState(currentSpecialist?.email || "");
  const [title, setTitle] = useState(currentSpecialist?.title || "");
  const [role, setRole] = useState(currentSpecialist?.role || "");
  const [guidanceType, setGuidanceType] = useState<GuidanceType>(currentSpecialist?.guidanceType || "prawno-obywatelskie");
  const [avatarBg, setAvatarBg] = useState(currentSpecialist?.avatarBg || "bg-blue-600");
  const [avatarUrl, setAvatarUrl] = useState(currentSpecialist?.avatarUrl || "");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && currentSpecialist) {
      setName(currentSpecialist.name || "");
      setEmail(currentSpecialist.email || "");
      setTitle(currentSpecialist.title || "");
      setRole(currentSpecialist.role || "");
      setGuidanceType(currentSpecialist.guidanceType || "prawno-obywatelskie");
      setAvatarBg(currentSpecialist.avatarBg || "bg-blue-600");
      setAvatarUrl(currentSpecialist.avatarUrl || "");
      setAvatarError(null);
    }
  }

  if (!isOpen) return null;

  const colorOptions = [
    { label: "Bursztynowy (Synapsis)", class: "bg-amber-600" },
    { label: "Morski turkus", class: "bg-teal-600" },
    { label: "Błękitny", class: "bg-blue-600" },
    { label: "Granatowy", class: "bg-indigo-600" },
    { label: "Fioletowy", class: "bg-purple-600" },
    { label: "Szmaragdowy", class: "bg-emerald-600" },
    { label: "Grafitowy", class: "bg-slate-700" },
  ];

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    try {
      setAvatarUrl(await processAvatarImage(file));
      setAvatarError(null);
    } catch {
      setAvatarError("Nie udało się przetworzyć zdjęcia. Spróbuj wybrać inny plik.");
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const updated: Specialist = {
      ...currentSpecialist,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      title: title.trim() || "Specjalista",
      role: role.trim() || "Konsultant",
      guidanceType,
      avatarBg,
      avatarUrl: avatarUrl || undefined,
    };

    updateSpecialist(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-lg overflow-hidden flex flex-col my-8"
      >
        {/* Header */}
        <div className="bg-[#2D2A28] px-6 py-4 flex items-center justify-between text-white border-b border-[#3E3A37]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB200] text-[#2D2A28] flex items-center justify-center font-bold shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Mój profil i konto</span>
                {currentSpecialist.isAdmin && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-300">
                Edycja Twoich danych, specjalizacji oraz adresu e-mail do powiadomień
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {savedSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Profil i adres e-mail zostały pomyślnie zaktualizowane!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Imię i nazwisko / Tytuł naukowy *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. mgr Joanna Mrożek"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Adres e-mail (do powiadomień o przekazanych sprawach) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#296B6E] dark:text-teal-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. j.mrozek@synapsis.org.pl"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200]"
              />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Na ten adres e-mail otrzymasz powiadomienia, gdy inny dyżurujący przekaże do Ciebie sprawę kontaktu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Tytuł zawodowy
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="np. Psycholog / Prawnik"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Rola / Specjalizacja
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="np. Psycholog dziecięcy"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#4A4542] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Główny rodzaj poradnictwa
            </label>
            <select
              value={guidanceType}
              onChange={(e) => setGuidanceType(e.target.value as GuidanceType)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200]"
            >
              {GUIDANCE_TYPES.map((gt) => (
                <option key={gt} value={gt} className="dark:bg-[#1E1C1A]">
                  {gt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Zdjęcie profilowe (awatar)</span>
            </label>
            <div className="flex items-center gap-3">
              <SpecialistAvatar
                name={name || currentSpecialist.name}
                avatarBg={avatarBg}
                avatarUrl={avatarUrl || undefined}
                className="w-14 h-14 rounded-2xl text-base font-black shrink-0 shadow-sm"
              />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{avatarUrl ? "Zmień zdjęcie" : "Wgraj zdjęcie"}</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl("");
                        setAvatarError(null);
                      }}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Usuń zdjęcie</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  JPG, PNG lub WEBP do 5 MB. Zdjęcie zostanie wykadrowane do kwadratu.
                </p>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
                aria-label="Wybierz plik ze zdjęciem profilowym"
              />
            </div>
            {avatarError && (
              <p className="mt-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300" role="alert">
                {avatarError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Kolor identyfikatora / awatara (gdy brak zdjęcia)</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {colorOptions.map((opt) => (
                <button
                  key={opt.class}
                  type="button"
                  onClick={() => setAvatarBg(opt.class)}
                  className={`w-7 h-7 rounded-xl ${opt.class} flex items-center justify-center transition-all cursor-pointer ${
                    avatarBg === opt.class
                      ? "ring-2 ring-offset-2 ring-[#FFB200] scale-110 shadow-sm"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  title={opt.label}
                >
                  {avatarBg === opt.class && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-[#2C2927] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
            >
              Zapisz zmiany w profilu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
