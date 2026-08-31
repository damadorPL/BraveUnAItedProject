import React, { useState, useMemo, useRef } from "react";
import { useApp, useCurrentSpecialist } from "../../../context/AppContext";
import { Specialist, GUIDANCE_TYPES, GuidanceType } from "../../../types";
import { SpecialistAvatar } from "../../../components/SpecialistAvatar";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { api } from "../../../services/api";
import { validateAvatarFile, processAvatarImage } from "../../../utils/fileUtils";
import {
  Users,
  PlusCircle,
  Edit3,
  Trash2,
  KeyRound,
  ShieldCheck,
  UserCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Camera,
  Upload,
  Check,
} from "lucide-react";

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

type SortField = "name" | "title" | "guidanceType" | "isAdmin";
type SortDirection = "asc" | "desc";

// Colored guidance badge styling matching central system
const getGuidanceBadgeStyle = (type?: GuidanceType) => {
  switch (type) {
    case "prawno-obywatelskie":
      return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60";
    case "w zakresie psychologii i rehabilitacji społecznej":
      return "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60";
    case "Parent to Parent":
      return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
    case "społeczne":
      return "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60";
    default:
      return "bg-slate-50 dark:bg-[#282522] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383431]";
  }
};

export const AdminSpecialistsTab: React.FC = () => {
  const { specialists, addSpecialist, updateSpecialist, deleteSpecialist } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [isAdding, setIsAdding] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Specialist | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Psycholog");
  const [role, setRole] = useState("Konsultant");
  const [guidance, setGuidance] = useState<GuidanceType>("prawno-obywatelskie");
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarBg, setAvatarBg] = useState("bg-blue-600");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [customPassword, setCustomPassword] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "consultant">("all");
  const [filterGuidance, setFilterGuidance] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    variant?: "danger" | "warning" | "primary";
    onConfirm: () => void;
  } | null>(null);

  // Password reset modal state
  const [resetModalSpec, setResetModalSpec] = useState<Specialist | null>(null);
  const [tempPasswordGenerated, setTempPasswordGenerated] = useState<string | null>(null);

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
      const processed = await processAvatarImage(file);
      setAvatarUrl(processed);
      setAvatarError(null);
    } catch {
      setAvatarError("Nie udało się przetworzyć zdjęcia. Spróbuj wybrać inny plik.");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setTitle("Psycholog");
    setRole("Konsultant");
    setGuidance("prawno-obywatelskie");
    setIsAdmin(false);
    setAvatarBg("bg-blue-600");
    setAvatarUrl("");
    setAvatarError(null);
    setCustomPassword("");
    setIsAdding(false);
    setEditingSpec(null);
  };

  const handleStartEdit = (spec: Specialist) => {
    setEditingSpec(spec);
    setName(spec.name);
    setEmail(spec.email);
    setTitle(spec.title);
    setRole(spec.role);
    setGuidance(spec.guidanceType);
    setIsAdmin(Boolean(spec.isAdmin));
    setAvatarBg(spec.avatarBg || "bg-blue-600");
    setAvatarUrl(spec.avatarUrl || "");
    setAvatarError(null);
    setCustomPassword("");
    setIsAdding(false);
    setSuccessMessage(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normEmail = email.trim().toLowerCase();
    if (!normEmail.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      setErrorMessage(`Adres e-mail musi należeć do domeny @${ALLOWED_EMAIL_DOMAIN}`);
      return;
    }

    try {
      if (editingSpec) {
        const updated: Specialist = {
          ...editingSpec,
          name: name.trim(),
          email: normEmail,
          title: title.trim(),
          role: role.trim(),
          guidanceType: guidance,
          isAdmin,
          avatarBg,
          avatarUrl: avatarUrl.trim() || undefined,
        };

        await api.admin.updateSpecialist(editingSpec.id, {
          ...updated,
          newPassword: customPassword.trim() || undefined,
        });

        updateSpecialist(updated);
        setSuccessMessage(`Zaktualizowano profil specjalisty ${updated.name}`);
      } else {
        const newSpecData = {
          name: name.trim(),
          email: normEmail,
          title: title.trim(),
          role: role.trim(),
          guidanceType: guidance,
          isAdmin,
          avatarBg,
          avatarUrl: avatarUrl.trim() || undefined,
          initialPassword: customPassword.trim() || undefined,
        };

        const created = await api.admin.createSpecialist(newSpecData);
        addSpecialist(created);
        setSuccessMessage(`Dodano nowego specjalistę: ${created.name}`);
      }

      resetForm();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Błąd podczas zapisywania profilu");
    }
  };

  const handleDelete = (spec: Specialist) => {
    if (spec.id === currentSpecialist.id) {
      setErrorMessage("Nie możesz usunąć własnego konta.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    if (spec.id === "spec-admin") {
      setErrorMessage("Nie można usunąć głównego konta administratora.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Usuwanie specjalisty",
      variant: "danger",
      confirmText: "Usuń konto",
      description: `Czy na pewno chcesz bezpowrotnie usunąć konto specjalisty ${spec.name} (${spec.email})?`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.admin.deleteSpecialist(spec.id);
          deleteSpecialist(spec.id);
          setSuccessMessage(`Usunięto konto specjalisty ${spec.name}`);
          setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
          setErrorMessage(err.message || "Błąd usuwania specjalisty");
        }
      },
    });
  };

  const handleResetPassword = (spec: Specialist) => {
    setConfirmModal({
      isOpen: true,
      title: "Resetowanie hasła",
      variant: "warning",
      confirmText: "Zresetuj hasło",
      description: `Czy na pewno chcesz zresetować hasło dla specjalisty ${spec.name} (${spec.email})?\n\nDotychczasowe hasło przestanie działać i zostanie wygenerowane nowe hasło tymczasowe.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await api.admin.resetSpecialistPassword(spec.id);
          setResetModalSpec(spec);
          setTempPasswordGenerated(res.temporaryPassword || "Synapsis2026!");
        } catch (err: any) {
          setErrorMessage(err.message || "Błąd podczas resetowania hasła");
          setTimeout(() => setErrorMessage(null), 4000);
        }
      },
    });
  };

  const promptToggleAdmin = (spec: Specialist) => {
    if (spec.id === "spec-admin" && spec.isAdmin) {
      setErrorMessage("Nie można odebrać uprawnień głównemu kontu administratora.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    if (spec.id === currentSpecialist.id && spec.isAdmin) {
      setErrorMessage("Nie możesz odebrać uprawnień administratora własnemu zalogowanemu kontu.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const willBeAdmin = !spec.isAdmin;
    setConfirmModal({
      isOpen: true,
      title: willBeAdmin ? "Nadanie uprawnień administratora" : "Odebranie uprawnień administratora",
      variant: willBeAdmin ? "warning" : "danger",
      confirmText: willBeAdmin ? "Nadaj uprawnienia" : "Odbierz uprawnienia",
      description: willBeAdmin ? (
        <span>
          Czy na pewno chcesz nadać uprawnienia administratora dla specjalisty{" "}
          <strong>{spec.name}</strong> ({spec.email})?
          <br />
          <br />
          Użytkownik uzyska pełny dostęp do panelu administratora (<code className="font-mono bg-slate-100 dark:bg-[#252018] px-1 py-0.5 rounded">/admin</code>), zarządzania kontami, scalania kartotek i operacji na bazie danych.
        </span>
      ) : (
        <span>
          Czy na pewno chcesz odebrać uprawnienia administratora specjaliście{" "}
          <strong>{spec.name}</strong> ({spec.email})?
          <br />
          <br />
          Użytkownik straci dostęp do modułów administracyjnych i stanie się zwykłym konsultantem.
        </span>
      ),
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const updated: Specialist = { ...spec, isAdmin: willBeAdmin };
          await api.admin.updateSpecialist(spec.id, updated);
          updateSpecialist(updated);
          if (editingSpec?.id === spec.id) {
            setIsAdmin(willBeAdmin);
          }
          setSuccessMessage(
            willBeAdmin
              ? `Nadano uprawnienia administratora dla ${spec.name}`
              : `Odebrano uprawnienia administratora dla ${spec.name}`
          );
          setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
          setErrorMessage(err.message || "Błąd podczas zmiany uprawnień");
          setTimeout(() => setErrorMessage(null), 4000);
        }
      },
    });
  };

  const handleAdminCheckboxChange = (checked: boolean) => {
    if (editingSpec) {
      if (!checked && (editingSpec.id === "spec-admin" || editingSpec.id === currentSpecialist.id)) {
        setErrorMessage(
          editingSpec.id === "spec-admin"
            ? "Nie można odebrać uprawnień głównemu kontu administratora."
            : "Nie możesz odebrać uprawnień administratora własnemu zalogowanemu kontu."
        );
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }

      if (checked !== Boolean(editingSpec.isAdmin)) {
        setConfirmModal({
          isOpen: true,
          title: checked ? "Nadanie uprawnień administratora" : "Odebranie uprawnień administratora",
          variant: checked ? "warning" : "danger",
          confirmText: checked ? "Nadaj uprawnienia" : "Odbierz uprawnienia",
          description: checked ? (
            <span>
              Czy na pewno chcesz nadać uprawnienia administratora dla specjalisty{" "}
              <strong>{editingSpec.name}</strong> ({editingSpec.email})?
              <br />
              <br />
              Użytkownik uzyska pełny dostęp do panelu administracyjnego (<code className="font-mono bg-slate-100 dark:bg-[#252018] px-1 py-0.5 rounded">/admin</code>).
            </span>
          ) : (
            <span>
              Czy na pewno chcesz odebrać uprawnienia administratora specjaliście{" "}
              <strong>{editingSpec.name}</strong> ({editingSpec.email})?
              <br />
              <br />
              Użytkownik straci dostęp do modułów administracyjnych.
            </span>
          ),
          onConfirm: () => {
            setIsAdmin(checked);
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
          description: (
            <span>
              Czy na pewno chcesz utworzyć to konto z pełnymi uprawnieniami administratora?
              <br />
              <br />
              Użytkownik będzie miał dostęp do panelu <code className="font-mono bg-slate-100 dark:bg-[#252018] px-1 py-0.5 rounded">/admin</code>.
            </span>
          ),
          onConfirm: () => {
            setIsAdmin(true);
            setConfirmModal(null);
          },
        });
        return;
      }
    }
    setIsAdmin(checked);
  };

  // Filtered specialists
  const filteredSpecialists = useMemo(() => {
    return specialists.filter((spec) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = spec.name.toLowerCase().includes(q);
        const matchEmail = spec.email.toLowerCase().includes(q);
        const matchTitle = (spec.title || "").toLowerCase().includes(q);
        const matchRole = (spec.role || "").toLowerCase().includes(q);
        const matchGuidance = (spec.guidanceType || "").toLowerCase().includes(q);
        const matchId = (spec.id || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchTitle && !matchRole && !matchGuidance && !matchId) {
          return false;
        }
      }

      // Role filter
      if (filterRole === "admin" && !spec.isAdmin) return false;
      if (filterRole === "consultant" && spec.isAdmin) return false;

      // Guidance filter
      if (filterGuidance !== "all" && spec.guidanceType !== filterGuidance) return false;

      return true;
    });
  }, [specialists, searchQuery, filterRole, filterGuidance]);

  // Sorted specialists
  const sortedSpecialists = useMemo(() => {
    const list = [...filteredSpecialists];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name, "pl");
          break;
        case "title":
          comparison = `${a.title} ${a.role}`.localeCompare(`${b.title} ${b.role}`, "pl");
          break;
        case "guidanceType":
          comparison = (a.guidanceType || "").localeCompare(b.guidanceType || "", "pl");
          break;
        case "isAdmin":
          comparison = (b.isAdmin ? 1 : 0) - (a.isAdmin ? 1 : 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return list;
  }, [filteredSpecialists, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedSpecialists.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedSpecialists = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedSpecialists.slice(start, start + pageSize);
  }, [sortedSpecialists, safeCurrentPage, pageSize]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterRole("all");
    setFilterGuidance("all");
    setSortField("name");
    setSortDirection("asc");
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    filterRole !== "all" ||
    filterGuidance !== "all" ||
    sortField !== "name" ||
    sortDirection !== "asc";

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-purple-800/60">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Zespół dyżurujących specjalistów</span>
              <span className="text-xs bg-slate-100 dark:bg-[#2A2724] text-slate-700 dark:text-slate-300 font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-[#383431]">
                {specialists.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Zarządzaj kontami, rolami, uprawnieniami administratora i hasłami dostępowymi
            </p>
          </div>
        </div>

        {!isAdding && !editingSpec && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-2xl text-xs font-black shadow-xs hover:shadow transition-all cursor-pointer w-full sm:w-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Dodaj nowego specjalistę</span>
          </button>
        )}
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-2xl text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Add / Edit Form Modal/Panel */}
      {(isAdding || editingSpec) && (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-[#1E1C1A] border-2 border-[#FFB200] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D2A28]">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {editingSpec ? `Edycja profilu: ${editingSpec.name}` : "Rejestracja nowego specjalisty"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2D2A28] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Imię i nazwisko z tytułem *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. mgr Anna Kowalska"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-slate-50 dark:bg-[#141312] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Służbowy adres e-mail *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`uzytkownik@${ALLOWED_EMAIL_DOMAIN}`}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-slate-50 dark:bg-[#141312] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tytuł zawodowy *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="np. Psycholog / Prawnik"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-slate-50 dark:bg-[#141312] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rola / Stanowisko *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="np. Konsultant ds. prawnych"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-slate-50 dark:bg-[#141312] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Obszar poradnictwa
              </label>
              <select
                value={guidance}
                onChange={(e) => setGuidance(e.target.value as GuidanceType)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-slate-50 dark:bg-[#141312] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
              >
                {GUIDANCE_TYPES.map((g) => (
                  <option key={g} value={g} className="dark:bg-[#1E1C1A]">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {editingSpec ? "Zmień hasło (opcjonalnie)" : "Hasło początkowe (opcjonalnie)"}
              </label>
              <input
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder={editingSpec ? "Pozostaw puste, aby nie zmieniać" : "Domyślne: synapsis2026"}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-slate-50 dark:bg-[#141312] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            {/* Avatar & Profile Photo */}
            <div className="sm:col-span-2 lg:col-span-3 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#2C2927] rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="relative shrink-0">
                    <SpecialistAvatar
                      name={name || "Nowy Specjalista"}
                      avatarBg={avatarBg}
                      avatarUrl={avatarUrl || undefined}
                      className="w-14 h-14 rounded-2xl text-base font-black shadow-sm ring-2 ring-slate-200 dark:ring-[#383431]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#296B6E] dark:text-[#FFB200]" />
                      <span>Zdjęcie profilowe / Awatar specjalisty</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {avatarUrl
                        ? "Zdjęcie profilowe jest przypisane i widoczne na liście zespołu oraz w systemie."
                        : "Brak zdjęcia — system wyświetla kolorowy identyfikator z inicjałami."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white dark:bg-[#2C2927] hover:bg-slate-100 dark:hover:bg-[#383431] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#383431] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-[#FFB200]" />
                    <span>{avatarUrl ? "Zmień plik" : "Wgraj zdjęcie"}</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl("");
                        setAvatarError(null);
                      }}
                      className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Usuń zdjęcie</span>
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

              {avatarError && (
                <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{avatarError}</span>
                </p>
              )}

              <div className="pt-2 border-t border-slate-200/70 dark:border-[#262320] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Optional URL input */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Lub wklej bezpośredni adres URL zdjęcia:
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setAvatarError(null);
                    }}
                    placeholder="https://domena.pl/zdjecie.jpg"
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#383431] bg-white dark:bg-[#1E1C1A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
                  />
                </div>

                {/* Color swatches */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Kolor identyfikatora (gdy brak zdjęcia):
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {AVATAR_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.class}
                        type="button"
                        onClick={() => setAvatarBg(opt.class)}
                        className={`w-6 h-6 rounded-lg ${opt.class} flex items-center justify-center transition-all cursor-pointer ${
                          avatarBg === opt.class ? "ring-2 ring-offset-2 ring-[#FFB200] scale-110 shadow-xs" : "opacity-75 hover:opacity-100"
                        }`}
                        title={opt.label}
                      >
                        {avatarBg === opt.class && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => handleAdminCheckboxChange(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>Uprawnienia administratora (dostęp do panelu /admin)</span>
              </span>
            </label>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-100 dark:bg-[#2D2A28] hover:bg-slate-200 dark:hover:bg-[#3E3A37] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
              >
                {editingSpec ? "Zapisz zmiany" : "Utwórz konto specjalisty"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search & Filters Toolbar */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj po nazwisku, e-mailu, roli, ID..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="lg:col-span-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
            >
              <option value="all">Wszystkie uprawnienia</option>
              <option value="admin">Administratorzy</option>
              <option value="consultant">Konsultanci</option>
            </select>
          </div>

          {/* Guidance Area Filter */}
          <div className="lg:col-span-3">
            <select
              value={filterGuidance}
              onChange={(e) => setFilterGuidance(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
            >
              <option value="all">Wszystkie obszary porad</option>
              {GUIDANCE_TYPES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div className="lg:col-span-3">
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split("-") as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(dir);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
            >
              <option value="name-asc">Sortuj: Nazwisko (A-Z)</option>
              <option value="name-desc">Sortuj: Nazwisko (Z-A)</option>
              <option value="title-asc">Sortuj: Rola (A-Z)</option>
              <option value="guidanceType-asc">Sortuj: Obszar porad</option>
              <option value="isAdmin-desc">Sortuj: Administratorzy pierwsi</option>
            </select>
          </div>
        </div>

        {/* Filter Counters & Quick Reset */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-0.5 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span>
              Wyniki: <strong className="text-slate-900 dark:text-white font-bold">{sortedSpecialists.length}</strong> z {specialists.length} specjalistów
            </span>
            {isFiltered && (
              <span className="bg-amber-100 dark:bg-[#2C2417] text-amber-900 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-md border border-amber-300 dark:border-amber-800">
                Filtrowanie aktywne
              </span>
            )}
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center space-x-1 font-bold text-amber-600 dark:text-[#FFB200] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Wyczyść filtry</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Mobile Cards View (< md screens: No horizontal scrollbars!) */}
      <div className="md:hidden space-y-3">
        {paginatedSpecialists.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-slate-200 dark:border-[#383431] p-8 text-center shadow-xs">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Brak pasujących specjalistów
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-2 px-3 py-1 bg-[#FFB200] text-[#2D2A28] rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Wyczyść filtry</span>
              </button>
            )}
          </div>
        ) : (
          paginatedSpecialists.map((spec) => {
            const isCurrent = spec.id === currentSpecialist.id;
            return (
              <div
                key={spec.id}
                className={`bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl p-4 shadow-xs space-y-3 ${
                  isCurrent ? "ring-2 ring-[#FFB200]/50 bg-amber-50/20 dark:bg-[#252018]/50" : ""
                }`}
              >
                {/* Top: Avatar, Name, Email, Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <SpecialistAvatar
                      name={spec.name}
                      avatarBg={spec.avatarBg}
                      avatarUrl={spec.avatarUrl}
                      className="w-11 h-11 rounded-2xl text-xs font-black shadow-xs ring-1 ring-slate-200/80 dark:ring-[#383431] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {spec.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-[#FFDF06] font-bold px-1.5 py-0.2 rounded-md border border-amber-300 dark:border-amber-700/80 shrink-0">
                            Twoje konto
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${spec.email}`}
                        className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate hover:text-amber-600 dark:hover:text-[#FFB200] transition-colors"
                      >
                        {spec.email}
                      </a>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => promptToggleAdmin(spec)}
                      disabled={spec.id === "spec-admin" || (spec.id === currentSpecialist.id && spec.isAdmin)}
                      title={
                        spec.id === "spec-admin"
                          ? "Główne konto administratora (brak możliwości zmiany)"
                          : spec.id === currentSpecialist.id && spec.isAdmin
                          ? "Nie możesz odebrać uprawnień administratora własnemu kontu"
                          : spec.isAdmin
                          ? "Kliknij, aby odebrać uprawnienia administratora"
                          : "Kliknij, aby nadać uprawnienia administratora"
                      }
                      className="cursor-pointer transition-transform active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                      {spec.isAdmin ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-[#282522] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#383431] hover:bg-slate-200 dark:hover:bg-[#34302D]">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span>Konsultant</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Details: Role & Guidance area */}
                <div className="bg-slate-50 dark:bg-[#161514] rounded-xl p-2.5 text-xs space-y-1.5 border border-slate-100 dark:border-[#2C2927]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Rola / Stanowisko:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                      {spec.title} {spec.role && spec.role.toLowerCase() !== spec.title.toLowerCase() ? `(${spec.role})` : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Obszar porad:</span>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${getGuidanceBadgeStyle(spec.guidanceType)}`}>
                      {spec.guidanceType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono text-[10px]">ID:</span>
                    <span className="text-slate-400 font-mono text-[10px]">{spec.id}</span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100 dark:border-[#2C2927]">
                  <button
                    type="button"
                    onClick={() => handleResetPassword(spec)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-[#FFB200] hover:bg-amber-100 text-xs font-bold border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Hasło</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(spec)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edytuj</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(spec)}
                    disabled={spec.id === "spec-admin" || spec.id === currentSpecialist.id}
                    className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop Table View (>= md screens) */}
      <div className="hidden md:block bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/90 dark:bg-[#252018] border-b border-slate-200 dark:border-[#383431] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] select-none">
            <tr>
              <th className="py-3 px-4 whitespace-nowrap">
                <span>Specjalista i kontakt</span>
              </th>
              <th className="py-3 px-3 whitespace-nowrap">
                <span>Rola i stanowisko</span>
              </th>
              <th className="py-3 px-3 whitespace-nowrap">
                <span>Obszar poradnictwa</span>
              </th>
              <th className="py-3 px-3 whitespace-nowrap">
                <span>Uprawnienia</span>
              </th>
              <th className="py-3 px-4 text-right whitespace-nowrap">
                <span>Akcje</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2C2927]">
            {paginatedSpecialists.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                  <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Brak pasujących specjalistów
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dla podanych kryteriów wyszukiwania nie ma żadnych wyników.
                  </p>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="mt-2.5 px-3 py-1 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Wyczyść filtry</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedSpecialists.map((spec) => {
                const isCurrent = spec.id === currentSpecialist.id;
                return (
                  <tr
                    key={spec.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-[#24211E] transition-colors ${
                      isCurrent ? "bg-amber-50/30 dark:bg-[#252018]/60" : ""
                    }`}
                  >
                    {/* Specjalista i kontakt */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <SpecialistAvatar
                          name={spec.name}
                          avatarBg={spec.avatarBg}
                          avatarUrl={spec.avatarUrl}
                          className="w-10 h-10 rounded-2xl text-xs font-black shadow-xs ring-1 ring-slate-200/80 dark:ring-[#383431] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                              {spec.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-[#FFDF06] font-bold px-1.5 py-0.2 rounded-md border border-amber-300 dark:border-amber-700/80">
                                Twoje konto
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <a
                              href={`mailto:${spec.email}`}
                              className="font-mono hover:text-amber-600 dark:hover:text-[#FFB200] transition-colors"
                            >
                              {spec.email}
                            </a>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="font-mono text-[10px] text-slate-400">ID: {spec.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rola i stanowisko */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {spec.title}
                      </div>
                      {spec.role && spec.role.toLowerCase() !== spec.title.toLowerCase() && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          {spec.role}
                        </div>
                      )}
                    </td>

                    {/* Obszar poradnictwa */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-xl border leading-snug ${getGuidanceBadgeStyle(
                          spec.guidanceType
                        )}`}
                      >
                        {spec.guidanceType}
                      </span>
                    </td>

                    {/* Uprawnienia */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => promptToggleAdmin(spec)}
                        disabled={spec.id === "spec-admin" || (spec.id === currentSpecialist.id && spec.isAdmin)}
                        title={
                          spec.id === "spec-admin"
                            ? "Główne konto administratora (brak możliwości zmiany)"
                            : spec.id === currentSpecialist.id && spec.isAdmin
                            ? "Nie możesz odebrać uprawnień administratora własnemu kontu"
                            : spec.isAdmin
                            ? "Kliknij, aby odebrać uprawnienia administratora"
                            : "Kliknij, aby nadać uprawnienia administratora"
                        }
                        className="cursor-pointer transition-transform active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100"
                      >
                        {spec.isAdmin ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-black bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-[#282522] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#383431] hover:bg-slate-200 dark:hover:bg-[#34302D] transition-colors">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Konsultant</span>
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Akcje */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(spec)}
                          title="Zresetuj hasło specjalisty"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 dark:hover:text-[#FFB200] hover:bg-amber-100/70 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(spec)}
                          title="Edytuj profil specjalisty"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(spec)}
                          disabled={spec.id === "spec-admin" || spec.id === currentSpecialist.id}
                          title={
                            spec.id === "spec-admin"
                              ? "Nie można usunąć głównego konta administratora"
                              : spec.id === currentSpecialist.id
                              ? "Nie możesz usunąć własnego konta"
                              : "Usuń konto specjalisty"
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 transition-colors cursor-pointer disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Summary Footer */}
      {sortedSpecialists.length > 0 && (
        <div className="bg-slate-50 dark:bg-[#252018] border border-slate-200 dark:border-[#383431] rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 flex-wrap gap-y-1">
            <span>
              Pozycje{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                {(safeCurrentPage - 1) * pageSize + 1}
              </strong>
              -
              <strong className="text-slate-900 dark:text-white font-bold">
                {Math.min(safeCurrentPage * pageSize, sortedSpecialists.length)}
              </strong>{" "}
              z{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                {sortedSpecialists.length}
              </strong>
            </span>

            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

            <div className="flex items-center space-x-1.5">
              <span>Pokaż:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-lg px-2 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                className="px-2.5 py-1 bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2C2927] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center space-x-0.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Poprzednia</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      safeCurrentPage === pageNum
                        ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                        : "bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2C2927]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                className="px-2.5 py-1 bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2C2927] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center space-x-0.5 cursor-pointer"
              >
                <span className="hidden sm:inline">Następna</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Password Reset Result Modal */}
      {resetModalSpec && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-[#FFB200]">
              <KeyRound className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Wygenerowano nowe hasło
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Hasło dla specjalisty <strong>{resetModalSpec.name}</strong> (
              {resetModalSpec.email}) zostało zresetowane na serwerze:
            </p>

            <div className="p-3 bg-amber-50 dark:bg-[#252018] border border-amber-200 dark:border-amber-900/60 rounded-xl font-mono text-center text-sm font-black text-amber-950 dark:text-[#FFB200] select-all">
              {tempPasswordGenerated}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Przekaż powyższe hasło specjaliście. Przy następnym logowaniu zalecana jest zmiana hasła w profilu użytkownika.
            </p>

            <button
              type="button"
              onClick={() => {
                setResetModalSpec(null);
                setTempPasswordGenerated(null);
              }}
              className="w-full py-2.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

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
