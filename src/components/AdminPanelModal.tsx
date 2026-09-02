import React, { useState, useMemo, useRef } from "react";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import { Specialist, GUIDANCE_TYPES, GuidanceType, Caller } from "../types";
import { ConfirmModal } from "./ConfirmModal";
import { validateAvatarFile, processAvatarImage } from "../utils/fileUtils";
import {
  ShieldCheck,
  Users,
  GitMerge,
  PlusCircle,
  Edit3,
  Trash2,
  Check,
  X,
  Mail,
  AlertTriangle,
  Sparkles,
  Info,
  Camera,
  Upload,
} from "lucide-react";
import { pluralizePorady, pluralizeZalaczniki } from "../utils/pluralization";
import { SpecialistAvatar } from "./SpecialistAvatar";

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ALLOWED_EMAIL_DOMAIN = "synapsis.org.pl";

const AVATAR_COLOR_OPTIONS = [
  { label: "Bursztynowy (Synapsis)", class: "bg-amber-600" },
  { label: "Morski turkus", class: "bg-teal-600" },
  { label: "Błękitny", class: "bg-blue-600" },
  { label: "Granatowy", class: "bg-indigo-600" },
  { label: "Fioletowy", class: "bg-purple-600" },
  { label: "Szmaragdowy", class: "bg-emerald-600" },
  { label: "Różany (Admin)", class: "bg-rose-600" },
  { label: "Grafitowy", class: "bg-slate-700" },
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const {
    specialists,
    addSpecialist,
    updateSpecialist,
    deleteSpecialist,
    callers,
    records,
    mergeCallers,
    setEditingCaller,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [activeTab, setActiveTab] = useState<"MERGE_CONTACTS" | "MANAGE_SPECIALISTS">("MERGE_CONTACTS");

  // Merge State
  const [targetCallerId, setTargetCallerId] = useState<string>("");
  const [sourceCallerId, setSourceCallerId] = useState<string>("");
  const [mergeSearchTarget, setMergeSearchTarget] = useState<string>("");
  const [mergeSearchSource, setMergeSearchSource] = useState<string>("");
  const [mergeSuccessMessage, setMergeSuccessMessage] = useState<string | null>(null);

  // Specialist State
  const [isAddingSpecialist, setIsAddingSpecialist] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);
  const [specName, setSpecName] = useState("");
  const [specEmail, setSpecEmail] = useState("");
  const [specTitle, setSpecTitle] = useState("Psycholog");
  const [specRole, setSpecRole] = useState("Konsultant");
  const [specGuidance, setSpecGuidance] = useState<GuidanceType>("prawno-obywatelskie");
  const [specIsAdmin, setSpecIsAdmin] = useState(false);
  const [specAvatarBg, setSpecAvatarBg] = useState("bg-blue-600");
  const [specAvatarUrl, setSpecAvatarUrl] = useState("");
  const [specAvatarError, setSpecAvatarError] = useState<string | null>(null);
  const [specSuccessMessage, setSpecSuccessMessage] = useState<string | null>(null);
  const [specEmailError, setSpecEmailError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setSpecAvatarError(validationError);
      return;
    }

    try {
      const processed = await processAvatarImage(file);
      setSpecAvatarUrl(processed);
      setSpecAvatarError(null);
    } catch {
      setSpecAvatarError("Nie udało się przetworzyć zdjęcia. Spróbuj wybrać inny plik.");
    }
  };

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    variant?: "danger" | "warning" | "primary";
    onConfirm: () => void;
  } | null>(null);

  // Potential duplicates detection
  const potentialDuplicates = useMemo(() => {
    const pairs: { c1: Caller; c2: Caller; reason: string }[] = [];
    for (let i = 0; i < callers.length; i++) {
      for (let j = i + 1; j < callers.length; j++) {
        const c1 = callers[i];
        const c2 = callers[j];
        const sameLastName =
          c1.lastName &&
          c2.lastName &&
          c1.lastName.toLowerCase().trim() === c2.lastName.toLowerCase().trim();
        const samePhone =
          c1.phoneNumber &&
          c2.phoneNumber &&
          c1.phoneNumber.replace(/\s+/g, "") === c2.phoneNumber.replace(/\s+/g, "");

        if (samePhone && sameLastName) {
          pairs.push({ c1, c2, reason: "Identyczny numer telefonu oraz nazwisko" });
        } else if (samePhone) {
          pairs.push({ c1, c2, reason: "Identyczny numer telefonu" });
        } else if (
          sameLastName &&
          c1.firstName &&
          c2.firstName &&
          c1.firstName.toLowerCase().trim() === c2.firstName.toLowerCase().trim()
        ) {
          pairs.push({ c1, c2, reason: "Identyczne imię i nazwisko" });
        }
      }
    }
    return pairs;
  }, [callers]);

  const targetCaller = callers.find((c) => c.id === targetCallerId);
  const sourceCaller = callers.find((c) => c.id === sourceCallerId);

  const sourceRecords = useMemo(() => {
    if (!sourceCallerId) return [];
    return records.filter((r) => r.callerId === sourceCallerId);
  }, [records, sourceCallerId]);

  const targetRecords = useMemo(() => {
    if (!targetCallerId) return [];
    return records.filter((r) => r.callerId === targetCallerId);
  }, [records, targetCallerId]);

  const filteredTargetCallers = useMemo(() => {
    if (!mergeSearchTarget.trim()) return callers.slice(0, 8);
    const q = mergeSearchTarget.toLowerCase().trim();
    return callers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [callers, mergeSearchTarget]);

  const filteredSourceCallers = useMemo(() => {
    if (!mergeSearchSource.trim()) return callers.filter((c) => c.id !== targetCallerId).slice(0, 8);
    const q = mergeSearchSource.toLowerCase().trim();
    return callers.filter(
      (c) =>
        c.id !== targetCallerId &&
        (c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q) ||
          c.city.toLowerCase().includes(q))
    );
  }, [callers, targetCallerId, mergeSearchSource]);

  const handleMergeSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!targetCaller || !sourceCaller || targetCallerId === sourceCallerId) return;

    setConfirmModal({
      isOpen: true,
      title: "Scalanie kartotek",
      variant: "warning",
      confirmText: "Scal kartoteki",
      description: `Czy na pewno chcesz scalić kontakt "${sourceCaller.firstName} ${sourceCaller.lastName}" z kontaktem głównym "${targetCaller.firstName} ${targetCaller.lastName}"?\n\nPrzeniesionych zostanie ${pluralizePorady(sourceRecords.length)}. Kontakt zdublowany zostanie trwale usunięty.`,
      onConfirm: () => {
        setConfirmModal(null);
        mergeCallers(sourceCallerId, targetCallerId);
        setMergeSuccessMessage(
          `Pomyślnie scalono kartotekę. Przeniesiono ${pluralizePorady(sourceRecords.length)} do kontaktu głównego: ${targetCaller.firstName} ${targetCaller.lastName}.`
        );
        setSourceCallerId("");
        setTimeout(() => {
          setMergeSuccessMessage(null);
        }, 4000);
      },
    });
  };

  const handleSaveSpecialist = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!specName.trim() || !specEmail.trim()) return;

    const email = specEmail.trim().toLowerCase();
    if (!editingSpecialist && !email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      setSpecEmailError(
        `Nowe konto musi mieć adres e-mail w domenie ${ALLOWED_EMAIL_DOMAIN} (np. j.kowalska@${ALLOWED_EMAIL_DOMAIN}).`
      );
      return;
    }
    setSpecEmailError(null);

    if (editingSpecialist) {
      updateSpecialist({
        ...editingSpecialist,
        name: specName.trim(),
        email,
        title: specTitle.trim() || "Specjalista",
        role: specRole.trim() || "Konsultant",
        guidanceType: specGuidance,
        isAdmin: specIsAdmin,
        avatarBg: specAvatarBg,
        avatarUrl: specAvatarUrl.trim() || undefined,
      });
      setSpecSuccessMessage(`Zaktualizowano dane konsultanta: ${specName}`);
      setEditingSpecialist(null);
    } else {
      addSpecialist({
        name: specName.trim(),
        email,
        title: specTitle.trim() || "Specjalista",
        role: specRole.trim() || "Konsultant",
        guidanceType: specGuidance,
        isAdmin: specIsAdmin,
        avatarBg: specAvatarBg,
        avatarUrl: specAvatarUrl.trim() || undefined,
      });
      setSpecSuccessMessage(`Dodano nowego konsultanta: ${specName}`);
      setIsAddingSpecialist(false);
    }

    // Reset form
    setSpecName("");
    setSpecEmail("");
    setSpecTitle("Psycholog");
    setSpecRole("Konsultant");
    setSpecGuidance("prawno-obywatelskie");
    setSpecIsAdmin(false);
    setSpecAvatarBg("bg-blue-600");
    setSpecAvatarUrl("");
    setSpecAvatarError(null);

    setTimeout(() => setSpecSuccessMessage(null), 3000);
  };

  const startEditSpecialist = (spec: Specialist) => {
    setEditingSpecialist(spec);
    setIsAddingSpecialist(true);
    setSpecEmailError(null);
    setSpecName(spec.name);
    setSpecEmail(spec.email);
    setSpecTitle(spec.title);
    setSpecRole(spec.role);
    setSpecGuidance(spec.guidanceType);
    setSpecIsAdmin(!!spec.isAdmin);
    setSpecAvatarBg(spec.avatarBg || "bg-blue-600");
    setSpecAvatarUrl(spec.avatarUrl || "");
    setSpecAvatarError(null);
  };

  const handleAdminCheckboxChange = (checked: boolean) => {
    if (editingSpecialist) {
      if (!checked && (editingSpecialist.id === "spec-admin" || editingSpecialist.id === currentSpecialist.id)) {
        setSpecEmailError(
          editingSpecialist.id === "spec-admin"
            ? "Nie można odebrać uprawnień głównemu kontu administratora."
            : "Nie możesz odebrać uprawnień administratora własnemu zalogowanemu kontu."
        );
        setTimeout(() => setSpecEmailError(null), 4000);
        return;
      }

      if (checked !== Boolean(editingSpecialist.isAdmin)) {
        setConfirmModal({
          isOpen: true,
          title: checked ? "Nadanie uprawnień administratora" : "Odebranie uprawnień administratora",
          variant: checked ? "warning" : "danger",
          confirmText: checked ? "Nadaj uprawnienia" : "Odbierz uprawnienia",
          description: checked
            ? `Czy na pewno chcesz nadać uprawnienia administratora dla ${editingSpecialist.name}? Użytkownik uzyska dostęp do funkcji administracyjnych.`
            : `Czy na pewno chcesz odebrać uprawnienia administratora dla ${editingSpecialist.name}?`,
          onConfirm: () => {
            setSpecIsAdmin(checked);
            setConfirmModal(null);
          },
        });
        return;
      }
    } else {
      if (checked) {
        setConfirmModal({
          isOpen: true,
          title: "Tworzenie konta administratora",
          variant: "warning",
          confirmText: "Włącz uprawnienia admina",
          description: "Czy na pewno chcesz nadać uprawnienia administratora nowo tworzonemu profilowi?",
          onConfirm: () => {
            setSpecIsAdmin(true);
            setConfirmModal(null);
          },
        });
        return;
      }
    }
    setSpecIsAdmin(checked);
  };

  const handleDeleteSpecialist = (spec: Specialist) => {
    if (spec.id === currentSpecialist.id) {
      setSpecEmailError("Nie możesz usunąć aktualnie zalogowanego konta administratora.");
      setTimeout(() => setSpecEmailError(null), 4000);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Usuwanie profilu konsultanta",
      variant: "danger",
      confirmText: "Usuń konto",
      description: `Czy na pewno chcesz bezpowrotnie usunąć konto konsultanta: ${spec.name} (${spec.email})?`,
      onConfirm: () => {
        setConfirmModal(null);
        deleteSpecialist(spec.id);
      },
    });
  };

  if (!isOpen || !currentSpecialist.isAdmin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-6"
      >
        {/* Header */}
        <div className="bg-[#2D2A28] px-6 py-4 flex items-center justify-between text-white border-b border-[#3E3A37] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB200] text-[#2D2A28] flex items-center justify-center font-black shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black tracking-tight text-white">Panel administratora</h2>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  Dostęp uprzywilejowany
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Łączenie zdublowanych kartotek kontaktów oraz zarządzanie kontami dyżurujących konsultantów
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

        {/* Navigation Tabs */}
        <div className="bg-slate-100 dark:bg-[#161514] px-6 pt-3 border-b border-slate-200 dark:border-[#2C2927] flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("MERGE_CONTACTS")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t border-x ${
              activeTab === "MERGE_CONTACTS"
                ? "bg-white dark:bg-[#1E1C1A] text-[#2D2A28] dark:text-[#FFB200] border-slate-200 dark:border-[#383431] -mb-px shadow-xs"
                : "bg-transparent text-slate-700 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <GitMerge className="w-4 h-4 text-[#296B6E] dark:text-[#FFB200]" />
            <span>Łączenie kartotek kontaktów (Merge)</span>
            {potentialDuplicates.length > 0 && (
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold border border-amber-300 dark:border-amber-700/50">
                {potentialDuplicates.length} duplikaty
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MANAGE_SPECIALISTS")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t border-x ${
              activeTab === "MANAGE_SPECIALISTS"
                ? "bg-white dark:bg-[#1E1C1A] text-[#2D2A28] dark:text-[#FFB200] border-slate-200 dark:border-[#383431] -mb-px shadow-xs"
                : "bg-transparent text-slate-700 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-amber-600 dark:text-[#FFB200]" />
            <span>Dyżurujący konsultanci ({specialists.length})</span>
          </button>
        </div>

        {/* Tab 1: Merge Contacts */}
        {activeTab === "MERGE_CONTACTS" && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {mergeSuccessMessage && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{mergeSuccessMessage}</span>
              </div>
            )}

            {/* AI Duplicates Detector */}
            {potentialDuplicates.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50/90 via-slate-50 to-teal-50/50 dark:from-[#262015] dark:via-[#1D1B19] dark:to-[#162728] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xs font-bold text-[#2D2A28] dark:text-white">
                    Wykryto {potentialDuplicates.length} potencjalnych zdublowanych kartotek:
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {potentialDuplicates.map((pair) => (
                    <div
                      key={`${pair.c1.id}-${pair.c2.id}`}
                      className="bg-white dark:bg-[#141312] border border-amber-200/80 dark:border-[#383431] rounded-xl p-2.5 flex items-center justify-between shadow-2xs text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {pair.c1.firstName} {pair.c1.lastName} ↔ {pair.c2.firstName} {pair.c2.lastName}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          {pair.reason} • tel: {pair.c1.phoneNumber || pair.c2.phoneNumber}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetCallerId(pair.c1.id);
                          setSourceCallerId(pair.c2.id);
                        }}
                        className="px-2.5 py-1 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ml-2"
                      >
                        Wybierz do scalenia
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Merge Selector */}
            <form onSubmit={handleMergeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Target Contact (Keep) */}
                <div className="bg-slate-50 dark:bg-[#141312] border-2 border-emerald-300 dark:border-emerald-700/60 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        1. Kontakt Główny (Zostanie zachowany)
                      </span>
                      {targetCaller && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          Wybrano
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Szukaj kontaktu głównego..."
                      value={mergeSearchTarget}
                      onChange={(e) => setMergeSearchTarget(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#4A4542] rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {filteredTargetCallers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setTargetCallerId(c.id)}
                          className={`p-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between border ${
                            targetCallerId === c.id
                              ? "bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs"
                              : "bg-white dark:bg-[#1E1C1A] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#2C2927] hover:border-emerald-300"
                          }`}
                        >
                          <div>
                            <div className="font-bold">
                              {c.firstName} {c.lastName}
                            </div>
                            <div className="text-[10px] opacity-80">
                              {c.phoneNumber} • {c.city || c.voivodeship}
                            </div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">
                            {pluralizePorady(records.filter((r) => r.callerId === c.id).length)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {targetCaller && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-950 dark:text-emerald-200 bg-emerald-100/60 dark:bg-emerald-950/30 p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <strong>Wybrany:</strong> {targetCaller.firstName} {targetCaller.lastName} ({targetCaller.phoneNumber})
                        <div className="text-[11px] text-emerald-900 dark:text-emerald-300 mt-0.5 font-medium">
                          Posiada {pluralizePorady(targetRecords.length)} i {pluralizeZalaczniki((targetCaller.attachments || []).length)}.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCaller(targetCaller)}
                        className="px-2.5 py-1 bg-white dark:bg-[#1E1C1A] text-emerald-900 dark:text-emerald-300 hover:bg-emerald-50 rounded-lg text-xs font-bold border border-emerald-300 dark:border-emerald-700 shadow-2xs flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                        title="Edytuj dane tego kontaktu"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edytuj</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Source Contact (To be merged and removed) */}
                <div className="bg-slate-50 dark:bg-[#141312] border-2 border-amber-300 dark:border-amber-600/50 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <GitMerge className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        2. Kontakt do scalenia (Zostanie wchłonięty)
                      </span>
                      {sourceCaller && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                          Wybrano
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Szukaj zdublowanego kontaktu..."
                      value={mergeSearchSource}
                      onChange={(e) => setMergeSearchSource(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#4A4542] rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {filteredSourceCallers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setSourceCallerId(c.id)}
                          className={`p-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between border ${
                            sourceCallerId === c.id
                              ? "bg-amber-600 text-white border-amber-600 font-bold shadow-xs"
                              : "bg-white dark:bg-[#1E1C1A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2C2927] hover:border-amber-300"
                          }`}
                        >
                          <div>
                            <div className="font-bold">
                              {c.firstName} {c.lastName}
                            </div>
                            <div className="text-[10px] opacity-80">
                              {c.phoneNumber} • {c.city || c.voivodeship}
                            </div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                            {pluralizePorady(records.filter((r) => r.callerId === c.id).length)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {sourceCaller && (
                    <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700/50 text-xs text-amber-950 dark:text-amber-200 bg-amber-100/60 dark:bg-amber-950/30 p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <strong>Do wchłonięcia:</strong> {sourceCaller.firstName} {sourceCaller.lastName} ({sourceCaller.phoneNumber})
                        <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                          Zawiera {pluralizePorady(sourceRecords.length)} i {pluralizeZalaczniki((sourceCaller.attachments || []).length)}.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCaller(sourceCaller)}
                        className="px-2.5 py-1 bg-white dark:bg-[#1E1C1A] text-amber-800 dark:text-amber-300 hover:bg-amber-50 rounded-lg text-xs font-bold border border-amber-300 dark:border-amber-700 shadow-2xs flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                        title="Edytuj dane tego kontaktu"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edytuj</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Merge Preview Diff */}
              {targetCaller && sourceCaller && (
                <div className="bg-blue-50/80 dark:bg-[#181E2C] border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="font-bold text-blue-950 dark:text-blue-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Podsumowanie operacji scalania:</span>
                  </div>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc pl-5">
                    <li>
                      <strong>{pluralizePorady(sourceRecords.length)}</strong> z kartoteki &quot;{sourceCaller.firstName} {sourceCaller.lastName}&quot; zostanie przepisanych do &quot;{targetCaller.firstName} {targetCaller.lastName}&quot;.
                    </li>
                    <li>
                      Łączna liczba porad kontaktu głównego po scaleniu: <strong>{targetRecords.length + sourceRecords.length}</strong>.
                    </li>
                    <li>
                      Wszystkie pliki i załączniki z obu kartotek zostaną bezpiecznie złączone w jedną dokumentację.
                    </li>
                    <li>
                      Konto &quot;{sourceCaller.firstName} {sourceCaller.lastName}&quot; zostanie usunięte, aby wyeliminować duplikat w rejestrze.
                    </li>
                  </ul>
                </div>
              )}

              {/* Submit CTA */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-[#2C2927]">
                <button
                  type="button"
                  onClick={() => {
                    setTargetCallerId("");
                    setSourceCallerId("");
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Wyczyść wybór
                </button>
                <button
                  type="submit"
                  disabled={!targetCaller || !sourceCaller || targetCallerId === sourceCallerId}
                  className="px-5 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] disabled:opacity-40 disabled:hover:bg-[#FFB200] text-[#2D2A28] rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <GitMerge className="w-4 h-4" />
                  <span>Scal wybrane kartoteki i zaktualizuj historię</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Manage Specialists */}
        {activeTab === "MANAGE_SPECIALISTS" && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {specSuccessMessage && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{specSuccessMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zespół konsultantów i dyżurujących</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Konsultanci otrzymują powiadomienia e-mail o przekazanych sprawach i mogą prowadzić dyżury.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSpecialist(true);
                  setEditingSpecialist(null);
                  setSpecEmailError(null);
                  setSpecName("");
                  setSpecEmail("");
                  setSpecTitle("Psycholog");
                  setSpecRole("Konsultant");
                  setSpecGuidance("prawno-obywatelskie");
                  setSpecIsAdmin(false);
                  setSpecAvatarBg("bg-blue-600");
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Dodaj nowego konsultanta</span>
              </button>
            </div>

            {/* Add / Edit Form */}
            {isAddingSpecialist && (
              <form
                onSubmit={handleSaveSpecialist}
                className="bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#2C2927] rounded-2xl p-4 space-y-3.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2C2927] pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {editingSpecialist ? <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    {editingSpecialist ? "Edycja danych konsultanta" : "Nowy konsultant dyżurujący"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSpecialist(false);
                      setEditingSpecialist(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Imię i nazwisko (np. mgr Tomasz Lewandowski) *
                    </label>
                    <input
                      type="text"
                      required
                      value={specName}
                      onChange={(e) => setSpecName(e.target.value)}
                      placeholder="Imię i nazwisko"
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Adres e-mail (do powiadomień) *
                    </label>
                    <input
                      type="email"
                      required
                      value={specEmail}
                      onChange={(e) => {
                        setSpecEmail(e.target.value);
                        setSpecEmailError(null);
                      }}
                      placeholder={`np. t.lewandowski@${ALLOWED_EMAIL_DOMAIN}`}
                      className={`w-full px-3 py-1.5 bg-white dark:bg-[#1E1C1A] border rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        specEmailError
                          ? "border-red-400 dark:border-red-700 focus:ring-red-400"
                          : "border-slate-300 dark:border-[#383431] focus:ring-[#FFB200]"
                      }`}
                    />
                    {specEmailError ? (
                      <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {specEmailError}
                      </p>
                    ) : (
                      !editingSpecialist && (
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          Akceptowane są wyłącznie adresy w domenie {ALLOWED_EMAIL_DOMAIN}.
                        </p>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tytuł</label>
                    <input
                      type="text"
                      value={specTitle}
                      onChange={(e) => setSpecTitle(e.target.value)}
                      placeholder="np. Psycholog / Prawnik"
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rola / Specjalizacja</label>
                    <input
                      type="text"
                      value={specRole}
                      onChange={(e) => setSpecRole(e.target.value)}
                      placeholder="np. Specjalista P2P"
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Domyślne poradnictwo</label>
                    <select
                      value={specGuidance}
                      onChange={(e) => setSpecGuidance(e.target.value as GuidanceType)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1C1A] border border-slate-300 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFB200]"
                    >
                      {GUIDANCE_TYPES.map((gt) => (
                        <option key={gt} value={gt} className="dark:bg-[#1E1C1A]">
                          {gt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Avatar & Profile Photo */}
                <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-xl p-3.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative shrink-0">
                        <SpecialistAvatar
                          name={specName || "Nowy Specjalista"}
                          avatarBg={specAvatarBg}
                          avatarUrl={specAvatarUrl || undefined}
                          className="w-12 h-12 rounded-xl text-sm font-black shadow-xs ring-1 ring-slate-200 dark:ring-[#383431]"
                        />
                        {specAvatarUrl && (
                          <span
                            title="Zdjęcie przypisane"
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#1E1C1A] rounded-full flex items-center justify-center shadow-xs"
                          >
                            <Camera className="w-2 h-2 text-white" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-[#FFB200]" />
                          <span>Zdjęcie profilowe / Awatar</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {specAvatarUrl ? "Zdjęcie profilowe jest przypisane." : "Inicjały na kolorowym tle."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-[#2C2927] hover:bg-slate-200 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{specAvatarUrl ? "Zmień plik" : "Wgraj zdjęcie"}</span>
                      </button>
                      {specAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setSpecAvatarUrl("");
                            setSpecAvatarError(null);
                          }}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Usuń</span>
                        </button>
                      )}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                        aria-label="Wybierz plik ze zdjęciem profilowym"
                      />
                    </div>
                  </div>

                  {specAvatarError && (
                    <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{specAvatarError}</span>
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-[#2C2927] flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Kolor identyfikatora (gdy brak zdjęcia):
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {AVATAR_COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.class}
                          type="button"
                          onClick={() => setSpecAvatarBg(opt.class)}
                          className={`w-5 h-5 rounded-md ${opt.class} flex items-center justify-center transition-all cursor-pointer ${
                            specAvatarBg === opt.class ? "ring-2 ring-offset-1 ring-[#FFB200] scale-110" : "opacity-75 hover:opacity-100"
                          }`}
                          title={opt.label}
                        >
                          {specAvatarBg === opt.class && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#2C2927]">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specIsAdmin}
                      onChange={(e) => handleAdminCheckboxChange(e.target.checked)}
                      className="rounded text-[#FFB200] focus:ring-[#FFB200]"
                    />
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Uprawnienia administratora (pełna edycja bazy i scalanie)</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSpecialist(false);
                        setEditingSpecialist(null);
                      }}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-[#2C2927] hover:bg-slate-300 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs cursor-pointer"
                    >
                      {editingSpecialist ? "Zapisz zmiany" : "Dodaj konsultanta"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Specialists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {specialists.map((spec) => (
                <div
                  key={spec.id}
                  className="bg-white dark:bg-[#141312] border border-slate-200 dark:border-[#2C2927] hover:border-slate-300 dark:hover:border-[#3E3A37] rounded-2xl p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <SpecialistAvatar
                          name={spec.name}
                          avatarBg={spec.avatarBg}
                          avatarUrl={spec.avatarUrl}
                          className="w-10 h-10 rounded-xl font-bold text-xs shrink-0 shadow-xs ring-1 ring-slate-200/80 dark:ring-[#383431]"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                            <span>{spec.name}</span>
                            {spec.isAdmin && (
                              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-extrabold px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/50 flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">{spec.role} ({spec.title})</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => startEditSpecialist(spec)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-[#FFB200] hover:bg-amber-50 dark:hover:bg-[#2A241A] rounded-lg transition-colors cursor-pointer"
                          title="Edytuj profil konsultanta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSpecialist(spec)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Usuń profil konsultanta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#2C2927] space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-[#296B6E] dark:text-teal-400" />
                        <span className="font-mono text-[11px]">{spec.email}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        Domyślne poradnictwo: <strong className="text-slate-800 dark:text-slate-200">{spec.guidanceType}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reusable Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
          confirmText={confirmModal.confirmText}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};
