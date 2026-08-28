import { Caller, CallRecord, Specialist } from "../types";
import { INITIAL_CALLERS, INITIAL_RECORDS, INITIAL_SPECIALISTS } from "../data/sampleData";

const CALLERS_KEY = "unaited_pfron_callers_v1";
const RECORDS_KEY = "unaited_pfron_records_v1";
const SPECIALISTS_KEY = "unaited_pfron_specialists_v1";

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
      return INITIAL_CALLERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load callers:", err);
    return INITIAL_CALLERS;
  }
}

export function saveCallers(callers: Caller[]): void {
  try {
    localStorage.setItem(CALLERS_KEY, JSON.stringify(callers));
  } catch (err) {
    console.error("Failed to save callers:", err);
  }
}

export function loadRecords(): CallRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    const parsed: CallRecord[] = JSON.parse(raw);
    if (parsed.length < INITIAL_RECORDS.length) {
      // Merge initial records with any user-added records
      const existingIds = new Set(parsed.map((r) => r.id));
      const merged = [...parsed, ...INITIAL_RECORDS.filter((r) => !existingIds.has(r.id))];
      localStorage.setItem(RECORDS_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load records:", err);
    return INITIAL_RECORDS;
  }
}

export function saveRecords(records: CallRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to save records:", err);
  }
}

export function loadSpecialists(): Specialist[] {
  try {
    const raw = localStorage.getItem(SPECIALISTS_KEY);
    if (!raw) {
      localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(INITIAL_SPECIALISTS));
      return INITIAL_SPECIALISTS;
    }
    const parsed: Specialist[] = JSON.parse(raw);
    const hasAdminWithTag = parsed.some(
      (s: Specialist) => s.id === "spec-admin" && s.isAdmin && s.name.includes("(Admin)")
    );
    if (!hasAdminWithTag) {
      localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(INITIAL_SPECIALISTS));
      return INITIAL_SPECIALISTS;
    }
    return parsed;
  } catch (err) {
    return INITIAL_SPECIALISTS;
  }
}

export function saveSpecialists(specialists: Specialist[]): void {
  try {
    localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(specialists));
  } catch (err) {
    console.error("Failed to save specialists:", err);
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
  localStorage.setItem(CALLERS_KEY, JSON.stringify(INITIAL_CALLERS));
  localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
  localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(INITIAL_SPECIALISTS));
  return { callers: INITIAL_CALLERS, records: INITIAL_RECORDS };
}
