import { Specialist } from "../types";

// Wspólne hasło demo — aplikacja nie ma backendu, weryfikacja jest symulowana.
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
