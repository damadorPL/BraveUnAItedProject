import React, { useState } from "react";
import { useApp, useCurrentSpecialist } from "../../../context/AppContext";
import { Specialist, GUIDANCE_TYPES, GuidanceType } from "../../../types";
import { SpecialistAvatar } from "../../../components/SpecialistAvatar";
import { api } from "../../../services/api";
import {
  Users,
  PlusCircle,
  Edit3,
  Trash2,
  KeyRound,
  ShieldCheck,
  Check,
  X,
  Mail,
  User,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const ALLOWED_EMAIL_DOMAIN = "synapsis.org.pl";

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
  const [customPassword, setCustomPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password reset modal state
  const [resetModalSpec, setResetModalSpec] = useState<Specialist | null>(null);
  const [tempPasswordGenerated, setTempPasswordGenerated] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setTitle("Psycholog");
    setRole("Konsultant");
    setGuidance("prawno-obywatelskie");
    setIsAdmin(false);
    setAvatarBg("bg-blue-600");
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
    setAvatarBg(spec.avatarBg);
    setCustomPassword("");
    setIsAdding(false);
    setSuccessMessage(null);
    setErrorMessage(null);
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

  const handleDelete = async (spec: Specialist) => {
    if (spec.id === currentSpecialist.id) {
      alert("Nie możesz usunąć własnego konta.");
      return;
    }
    if (spec.id === "spec-admin") {
      alert("Nie można usunąć głównego konta administratora.");
      return;
    }

    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć specjalistę ${spec.name} (${spec.email})?`
      )
    ) {
      return;
    }

    try {
      await api.admin.deleteSpecialist(spec.id);
      deleteSpecialist(spec.id);
      setSuccessMessage(`Usunięto konto specjalisty ${spec.name}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Błąd usuwania specjalisty");
    }
  };

  const handleResetPassword = async (spec: Specialist) => {
    try {
      const res = await api.admin.resetSpecialistPassword(spec.id);
      setResetModalSpec(spec);
      setTempPasswordGenerated(res.temporaryPassword || "Synapsis2026!");
    } catch (err: any) {
      alert(err.message || "Błąd podczas resetowania hasła");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Zespół Dyżurujących Specjalistów</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Zarządzaj kontami, uprawnieniami administratora i hasłami dostępowymi
          </p>
        </div>

        {!isAdding && !editingSpec && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
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

      {/* Add / Edit Form */}
      {(isAdding || editingSpec) && (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-[#1E1C1A] border-2 border-[#FFB200] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D2A28]">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {editingSpec ? `Edycja specjalisty: ${editingSpec.name}` : "Rejestracja nowego specjalisty"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Imię i nazwisko z tytułem
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. mgr Anna Kowalska"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-[#383431] bg-white dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Służbowy adres e-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`uzytkownik@${ALLOWED_EMAIL_DOMAIN}`}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-[#383431] bg-white dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tytuł zawodowy
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="np. Psycholog / Prawnik"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-[#383431] bg-white dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rola / Stanowisko
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="np. Konsultant ds. Prawnych"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-[#383431] bg-white dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Obszar poradnictwa
              </label>
              <select
                value={guidance}
                onChange={(e) => setGuidance(e.target.value as GuidanceType)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-[#383431] bg-white dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              >
                {GUIDANCE_TYPES.map((g) => (
                  <option key={g} value={g}>
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
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-[#383431] bg-white dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>Uprawnienia administratora (dostęp do panelu /admin)</span>
              </span>
            </label>

            <div className="flex items-center space-x-2">
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

      {/* Specialists Table */}
      <div className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#252018] border-b border-slate-200 dark:border-[#383431] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Specjalista</th>
                <th className="py-3.5 px-4">Służbowy e-mail</th>
                <th className="py-3.5 px-4">Tytuł i rola</th>
                <th className="py-3.5 px-4">Obszar poradnictwa</th>
                <th className="py-3.5 px-4">Uprawnienia</th>
                <th className="py-3.5 px-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2C2927]">
              {specialists.map((spec) => (
                <tr
                  key={spec.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-[#24211E] transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <SpecialistAvatar
                        name={spec.name}
                        avatarBg={spec.avatarBg}
                        avatarUrl={spec.avatarUrl}
                        className="w-8 h-8 rounded-xl text-xs font-black shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {spec.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          ID: {spec.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-mono">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{spec.email}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {spec.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {spec.role}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[11px] bg-slate-100 dark:bg-[#282522] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
                      {spec.guidanceType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {spec.isAdmin ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Administrator</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#282522] text-slate-600 dark:text-slate-400">
                        <span>Konsultant</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(spec)}
                        title="Zresetuj hasło"
                        className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-[#FFB200] hover:bg-slate-100 dark:hover:bg-[#2C2927] rounded-lg transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(spec)}
                        title="Edytuj profil"
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-[#2C2927] rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(spec)}
                        disabled={spec.id === "spec-admin" || spec.id === currentSpecialist.id}
                        title="Usuń specjalistę"
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#2C2927] rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};
