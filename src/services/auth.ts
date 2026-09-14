import { Specialist } from "../types";

// Shared demo password — client-only fallback authentication.
export const DEMO_PASSWORD = "synapsis2026";

const TITLE_PREFIXES = ["dr", "mgr", "mec.", "mec", "lic.", "lic", "prof.", "prof"];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findSpecialistByEmail(
  specialists: Specialist[],
  email: string
): Specialist | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return specialists.find((s) => normalizeEmail(s.email) === normalized) ?? null;
}

export function verifyDemoPassword(password: string): boolean {
  return password === DEMO_PASSWORD;
}

export const MIN_PASSWORD_LENGTH = 10;

export interface PasswordRuleStatus {
  key: string;
  label: string;
  passed: boolean;
}

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0 to 4
  scoreLabel: "Bardzo słabe" | "Słabe" | "Średnie" | "Silne" | "Bardzo silne";
  scoreColor: string;
  rules: PasswordRuleStatus[];
}

export function validatePasswordStrength(
  password: string,
  userEmail?: string
): PasswordStrengthResult {
  const emailPrefix = userEmail ? userEmail.split("@")[0].trim().toLowerCase() : "";

  const rules: PasswordRuleStatus[] = [
    {
      key: "length",
      label: `Minimum ${MIN_PASSWORD_LENGTH} znaków`,
      passed: password.length >= MIN_PASSWORD_LENGTH,
    },
    {
      key: "letters",
      label: "Wielka i mała litera (A-Z, a-z)",
      passed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      key: "digit",
      label: "Przynajmniej jedna cyfra (0-9)",
      passed: /[0-9]/.test(password),
    },
    {
      key: "special",
      label: "Znak specjalny (np. !@#$%^&*)",
      passed: /[^a-zA-Z0-9]/.test(password),
    },
    {
      key: "context",
      label: "Brak słowa „synapsis” i loginu z e-maila",
      passed: Boolean(
        !password.toLowerCase().includes("synapsis") &&
          (!emailPrefix || emailPrefix.length < 3 || !password.toLowerCase().includes(emailPrefix))
      ),
    },
  ];

  const passedCount = rules.filter((r) => r.passed).length;
  const isValid = passedCount === rules.length;

  let score = 0;
  let scoreLabel: PasswordStrengthResult["scoreLabel"] = "Bardzo słabe";
  let scoreColor = "bg-rose-500";

  if (passedCount <= 1) {
    score = 0;
    scoreLabel = "Bardzo słabe";
    scoreColor = "bg-rose-500";
  } else if (passedCount === 2) {
    score = 1;
    scoreLabel = "Słabe";
    scoreColor = "bg-orange-500";
  } else if (passedCount === 3) {
    score = 2;
    scoreLabel = "Średnie";
    scoreColor = "bg-amber-500";
  } else if (passedCount === 4) {
    score = 3;
    scoreLabel = "Silne";
    scoreColor = "bg-blue-500";
  } else {
    score = 4;
    scoreLabel = "Bardzo silne";
    scoreColor = "bg-emerald-500";
  }

  return {
    isValid,
    score,
    scoreLabel,
    scoreColor,
    rules,
  };
}

export function isPasswordSecure(
  password: string,
  userEmail?: string
): { valid: boolean; message?: string } {
  const strength = validatePasswordStrength(password, userEmail);
  if (strength.isValid) {
    return { valid: true };
  }

  const failedRule = strength.rules.find((r) => !r.passed);
  return {
    valid: false,
    message: failedRule
      ? `Hasło nie spełnia wymogu: ${failedRule.label.toLowerCase()}.`
      : "Hasło jest zbyt słabe.",
  };
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// No override (null) = common demo password applies.
export async function verifySpecialistPassword(
  passwordHashOverride: string | null,
  password: string
): Promise<boolean> {
  if (passwordHashOverride) {
    return (await hashPassword(password)) === passwordHashOverride;
  }
  return verifyDemoPassword(password);
}

export function generateResetCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// "dr Michał Adamczyk (Admin)" -> "MA"
export function getSpecialistInitials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => w && !TITLE_PREFIXES.includes(w.toLowerCase()));
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
