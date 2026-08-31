import { Caller, CallRecord, Specialist } from "../types";
import { INITIAL_CALLERS, INITIAL_RECORDS, INITIAL_SPECIALISTS } from "../data/sampleData";

import { idbSet } from "./indexedDbStorage";


export const CALLERS_KEY = "unaited_pfron_callers_v1";
export const RECORDS_KEY = "unaited_pfron_records_v1";
export const SPECIALISTS_KEY = "unaited_pfron_specialists_v1";
export const SESSION_KEY = "unaited_pfron_session_v1";
export const PASSWORDS_KEY = "unaited_pfron_passwords_v1";

// Remove Polish diacritics including ł/Ł for ultra-tolerant fuzzy search
export function normalizeText(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-()]/g, "")
    .trim();
}

export function loadCallers(): Caller[] {
  try {
    const raw = localStorage.getItem(CALLERS_KEY);
    if (!raw) {
      localStorage.setItem(CALLERS_KEY, JSON.stringify(INITIAL_CALLERS));
      idbSet(CALLERS_KEY, INITIAL_CALLERS).catch(() => {});
      return INITIAL_CALLERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load callers:", err);
    return INITIAL_CALLERS;
  }
}

export function saveCallers(callers: Caller[]): void {
  // Asynchronous persistent write to IndexedDB (no 5MB quota)
  idbSet(CALLERS_KEY, callers).catch(() => {});
  try {
    localStorage.setItem(CALLERS_KEY, JSON.stringify(callers));
  } catch (err) {
    console.warn("LocalStorage full, saved in IndexedDB cache:", err);
  }
}

export function loadRecords(): CallRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
      idbSet(RECORDS_KEY, INITIAL_RECORDS).catch(() => {});
      return INITIAL_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load records:", err);
    return INITIAL_RECORDS;
  }
}

export function saveRecords(records: CallRecord[]): void {
  // Asynchronous persistent write to IndexedDB (no 5MB quota)
  idbSet(RECORDS_KEY, records).catch(() => {});
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn("LocalStorage full, saved in IndexedDB cache:", err);
  }
}

export function loadSpecialists(): Specialist[] {
  try {
    const raw = localStorage.getItem(SPECIALISTS_KEY);
    if (!raw) {
      localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(INITIAL_SPECIALISTS));
      idbSet(SPECIALISTS_KEY, INITIAL_SPECIALISTS).catch(() => {});
      return INITIAL_SPECIALISTS;
    }
    const parsed: Specialist[] = JSON.parse(raw);
    let changed = false;
    const merged = parsed.map((s) => {
      if (!s.avatarUrl) {
        const init = INITIAL_SPECIALISTS.find((is) => is.id === s.id);
        if (init?.avatarUrl) {
          changed = true;
          return { ...s, avatarUrl: init.avatarUrl };
        }
      }
      return s;
    });
    if (changed) {
      localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(merged));
      idbSet(SPECIALISTS_KEY, merged).catch(() => {});
    }
    return merged;
  } catch {
    return INITIAL_SPECIALISTS;
  }
}

export function saveSpecialists(specialists: Specialist[]): void {
  idbSet(SPECIALISTS_KEY, specialists).catch(() => {});
  try {
    localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(specialists));
  } catch (err) {
    console.error("Failed to save specialists:", err);
  }
}

export function loadSessionSpecialistId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch (err) {
    console.error("Failed to load session:", err);
    return null;
  }
}

export function saveSessionSpecialistId(specialistId: string): void {
  try {
    localStorage.setItem(SESSION_KEY, specialistId);
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error("Failed to clear session:", err);
  }
}

// Hash overrides set via reset (specialist ID -> SHA-256 hex); absence of entry = demo password applies
export function loadPasswordOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Failed to load password overrides:", err);
    return {};
  }
}

export function savePasswordOverride(specialistId: string, passwordHash: string): void {
  try {
    const overrides = loadPasswordOverrides();
    overrides[specialistId] = passwordHash;
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(overrides));
  } catch (err) {
    console.error("Failed to save password override:", err);
  }
}

export function searchCallers(query: string, callers: Caller[]): Caller[] {
  if (!query || !query.trim()) return callers;
  const normQ = normalizeText(query);
  const rawQ = query.toLowerCase().trim();

  return callers.filter((c) => {
    const fullNameNorm = normalizeText(c.firstName + c.lastName);
    const revFullNameNorm = normalizeText(c.lastName + c.firstName);
    const phoneNorm = normalizeText(c.phoneNumber);
    const cityNorm = normalizeText(c.city);
    const voivodeshipNorm = normalizeText(c.voivodeship);

    return (
      fullNameNorm.includes(normQ) ||
      revFullNameNorm.includes(normQ) ||
      phoneNorm.includes(normQ) ||
      cityNorm.includes(normQ) ||
      voivodeshipNorm.includes(normQ) ||
      c.firstName.toLowerCase().includes(rawQ) ||
      c.lastName.toLowerCase().includes(rawQ) ||
      c.city.toLowerCase().includes(rawQ)
    );
  });
}

export function resetToSampleData(): { callers: Caller[]; records: CallRecord[] } {
  try {
    localStorage.setItem(CALLERS_KEY, JSON.stringify(INITIAL_CALLERS));
    localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
    localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(INITIAL_SPECIALISTS));
  } catch {}
  idbSet(CALLERS_KEY, INITIAL_CALLERS).catch(() => {});
  idbSet(RECORDS_KEY, INITIAL_RECORDS).catch(() => {});
  idbSet(SPECIALISTS_KEY, INITIAL_SPECIALISTS).catch(() => {});
  return { callers: INITIAL_CALLERS, records: INITIAL_RECORDS };
}

export function clearDemoData(keepSpecialists: boolean = false): {
  callers: Caller[];
  records: CallRecord[];
  specialists: Specialist[];
} {
  const currentSpecialists = loadSpecialists();
  const retainedSpecialists = keepSpecialists
    ? currentSpecialists
    : currentSpecialists.filter((s) => s.isAdmin || s.id === "spec-admin");

  // Fallback to default admin if somehow none exists
  if (retainedSpecialists.length === 0) {
    const defaultAdmin = INITIAL_SPECIALISTS.find((s) => s.isAdmin) || INITIAL_SPECIALISTS[0];
    retainedSpecialists.push(defaultAdmin);
  }

  try {
    localStorage.setItem(CALLERS_KEY, JSON.stringify([]));
    localStorage.setItem(RECORDS_KEY, JSON.stringify([]));
    localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(retainedSpecialists));
  } catch {}

  idbSet(CALLERS_KEY, []).catch(() => {});
  idbSet(RECORDS_KEY, []).catch(() => {});
  idbSet(SPECIALISTS_KEY, retainedSpecialists).catch(() => {});

  return { callers: [], records: [], specialists: retainedSpecialists };
}
