import React, { useMemo, useState } from "react";
import { Specialist } from "../types";
import {
  findSpecialistByEmail,
  generateResetCode,
  hashPassword,
  MIN_PASSWORD_LENGTH,
} from "../services/auth";
import { savePasswordOverride } from "../services/storage";
import { SpecialistAvatar } from "./SpecialistAvatar";
import {
  X,
  Mail,
  KeyRound,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";

interface PasswordResetModalProps {
  isOpen: boolean;
  initialEmail: string;
  specialists: Specialist[];
  onClose: () => void;
  onSuccess: (email: string) => void;
}

type ResetStep = "EMAIL" | "CODE";

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  initialEmail,
  specialists,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<ResetStep>("EMAIL");
  const [email, setEmail] = useState(initialEmail);
  const [sentCode, setSentCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognized = useMemo(
    () => findSpecialistByEmail(specialists, email),
    [specialists, email]
  );

  const resetAndClose = () => {
    setStep("EMAIL");
    setSentCode("");
    setCodeInput("");
    setNewPassword("");
    setRepeatPassword("");
    setShowPassword(false);
    setError(null);
    onClose();
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Podaj służbowy adres e-mail.");
      return;
    }
    if (!recognized) {
      setError("Nie znaleziono konta dla podanego adresu e-mail.");
      return;
    }
    setError(null);
    setSentCode(generateResetCode());
    setStep("CODE");
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recognized) return;
    if (codeInput.trim() !== sentCode) {
      setError("Nieprawidłowy kod weryfikacyjny. Przepisz kod z wiadomości e-mail.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Nowe hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`);
      return;
    }
    if (newPassword !== repeatPassword) {
      setError("Hasła różnią się od siebie. Wpisz je ponownie.");
      return;
    }
    setError(null);
    const hash = await hashPassword(newPassword);
    savePasswordOverride(recognized.id, hash);
    const successEmail = recognized.email;
    resetAndClose();
    onSuccess(successEmail);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-7"
      >
        <div className="flex items-start justify-between mb-1">
          <h2 id="reset-title" className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#296B6E]" />
            <span>Resetowanie hasła</span>
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Zamknij"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "EMAIL" && (
          <form onSubmit={handleSendCode} noValidate>
            <p className="text-xs text-slate-500 mb-4">
              Podaj służbowy adres e-mail, wyślemy na niego kod weryfikacyjny do ustawienia nowego hasła.
            </p>

            <label htmlFor="reset-email" className="block text-xs font-bold text-slate-700 mb-1.5">
              E-mail służbowy
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="np. a.nowak@synapsis.org.pl"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200] transition-colors"
            />

            {recognized && (
              <div
                className="mt-2 flex items-center space-x-3 bg-[#E6F3F3] border border-[#296B6E]/25 rounded-xl px-3 py-2 animate-in fade-in"
                role="status"
              >
                <SpecialistAvatar
                  name={recognized.name}
                  avatarBg={recognized.avatarBg}
                  avatarUrl={recognized.avatarUrl}
                  className="w-8 h-8 rounded-full text-[10px] font-black shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{recognized.name}</div>
                  {recognized.isAdmin ? (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Administrator</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#1F5254]">
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Dyżurujący specjalista • {recognized.title}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-3 flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl px-3 py-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-sm font-black shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Wyślij kod weryfikacyjny</span>
            </button>
          </form>
        )}

        {step === "CODE" && recognized && (
          <form onSubmit={handleSetPassword} noValidate>
            {/* Simulated email message (demo application does not send real emails) */}
            <div className="mt-2 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>Symulacja skrzynki: {recognized.email}</span>
              </div>
              <div className="bg-white border border-amber-100 rounded-lg p-2.5 text-slate-800">
                <p className="font-bold text-slate-900">Temat: Reset hasła - Baza Porad</p>
                <p className="mt-1">
                  Twój kod weryfikacyjny:{" "}
                  <code className="font-mono font-black text-[#1F5254] bg-[#E6F3F3] px-1.5 py-0.5 rounded-md tracking-widest">
                    {sentCode}
                  </code>
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Jeśli to nie Ty prosisz o reset, zignoruj tę wiadomość.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="reset-code" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kod weryfikacyjny z e-maila
                </label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.replace(/\D/g, ""));
                    setError(null);
                  }}
                  placeholder="6-cyfrowy kod"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest text-slate-900 placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="reset-new-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nowe hasło (min. {MIN_PASSWORD_LENGTH} znaków)
                </label>
                <div className="relative">
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reset-repeat-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Powtórz nowe hasło
                </label>
                <input
                  id="reset-repeat-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={repeatPassword}
                  onChange={(e) => {
                    setRepeatPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200] transition-colors"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl px-3 py-2 animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-sm font-black shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Ustaw nowe hasło</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setCodeInput("");
                  setError(null);
                }}
                className="w-full text-xs font-bold text-[#296B6E] hover:text-[#1F5254] transition-colors cursor-pointer py-1"
              >
                Wróć i popraw adres e-mail
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
