import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import {
  findSpecialistByEmail,
  verifyDemoPassword,
  getSpecialistInitials,
  DEMO_PASSWORD,
} from "../services/auth";
import {
  PhoneCall,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  LogIn,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { specialists, login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Auto-detekcja typu konta: system rozpoznaje konto (i rolę) po adresie e-mail
  const recognized = useMemo(
    () => findSpecialistByEmail(specialists, email),
    [specialists, email]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Podaj służbowy adres e-mail.");
      return;
    }
    if (!recognized) {
      setError("Nie znaleziono konta dla podanego adresu e-mail.");
      return;
    }
    if (!verifyDemoPassword(password)) {
      setError("Nieprawidłowe hasło. Spróbuj ponownie.");
      return;
    }

    setError(null);
    login(recognized);
  };

  return (
    <div className="min-h-screen bg-[#2D2A28] flex flex-col items-center justify-center px-4 py-10 selection:bg-amber-100 selection:text-amber-900">
      {/* Branding */}
      <div className="flex items-center space-x-3 mb-8 select-none">
        <div className="w-12 h-12 bg-gradient-to-br from-[#FFB200] via-[#FFB200] to-[#E5A000] rounded-2xl text-[#2D2A28] shadow-lg flex items-center justify-center font-bold">
          <PhoneCall className="w-6 h-6" />
        </div>
        <div>
          <span className="font-black text-2xl tracking-tight text-white">Baza Porad</span>
          <p className="text-xs text-slate-400 leading-tight mt-0.5">
            Wspólna historia rozmów dla dyżurujących specjalistów • Linia PFRON
          </p>
        </div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-7 sm:p-8">
        <h1 className="text-lg font-black text-slate-900 tracking-tight">Zaloguj się do systemu</h1>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          System sam rozpozna Twoje konto i uprawnienia na podstawie służbowego adresu e-mail.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                E-mail służbowy
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="np. a.nowak@fundacja-spektrum.pl"
                aria-invalid={Boolean(error && !recognized)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200] transition-colors"
              />

              {/* Rozpoznane konto + wykryty typ */}
              {recognized && (
                <div
                  className="mt-2 flex items-center space-x-3 bg-[#E6F3F3] border border-[#296B6E]/25 rounded-xl px-3 py-2 animate-in fade-in"
                  role="status"
                >
                  <div
                    className={`w-9 h-9 ${recognized.avatarBg} rounded-full flex items-center justify-center text-white text-xs font-black shrink-0`}
                    aria-hidden="true"
                  >
                    {getSpecialistInitials(recognized.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{recognized.name}</div>
                    {recognized.isAdmin ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Konto rozpoznane: Administrator</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#296B6E]">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Konto rozpoznane: Dyżurujący specjalista • {recognized.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                Hasło
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  aria-invalid={Boolean(error && recognized)}
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-[#FFB200] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
              <LogIn className="w-4 h-4" />
              <span>Zaloguj się</span>
            </button>
          </div>
        </form>

        {/* Demo hint */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          <p>
            Wersja demonstracyjna — hasło dla wszystkich kont:{" "}
            <code className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
              {DEMO_PASSWORD}
            </code>
          </p>
          <button
            type="button"
            onClick={() => setShowDemoAccounts((v) => !v)}
            aria-expanded={showDemoAccounts}
            className="mt-2 flex items-center gap-1 font-bold text-[#296B6E] hover:text-[#1F5254] transition-colors cursor-pointer"
          >
            {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showDemoAccounts ? "Ukryj konta demo" : "Pokaż konta demo"}</span>
          </button>

          {showDemoAccounts && (
            <ul className="mt-2 space-y-1 animate-in fade-in">
              {specialists.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(s.email);
                      setError(null);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 ${s.avatarBg} rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0`}
                        aria-hidden="true"
                      >
                        {getSpecialistInitials(s.name)}
                      </span>
                      <span className="font-mono text-slate-600 truncate">{s.email}</span>
                    </span>
                    {s.isAdmin ? (
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-slate-400 shrink-0">{s.title}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-6 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-emerald-500" />
        Szyfrowanie zgodne z art. 9 RODO (dane medyczne) • Dostęp tylko dla upoważnionych specjalistów
      </p>
    </div>
  );
};
