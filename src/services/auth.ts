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

export const MIN_PASSWORD_LENGTH = 8;

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
