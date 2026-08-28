import * as XLSX from "xlsx";
import {
  Caller,
  CallRecord,
  GuidanceType,
  GUIDANCE_TYPES,
  GUIDANCE_AREAS_MAP,
  VOIVODESHIPS,
  BENEFICIARY_TYPES,
  BeneficiaryType,
  CONTACT_TYPES,
  ContactType,
  SUBJECT_TARGETS,
  SubjectTarget,
  DisabilityCertificateStatus,
  DisabilityDegree,
  DISABILITY_DEGREES,
} from "../types";
import { normalizeText } from "./storage";
import { matchDictionary, levenshtein, KeywordHints } from "./fuzzyMatch";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_DATA_ROWS = 5000;
const MAX_CELL_LENGTH = 2000;
const MAX_NAME_LENGTH = 60;
const MIN_CALL_YEAR = 2000;
const DUPLICATE_NAME_MAX_DISTANCE = 2;

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ReviewTarget {
  entity: "caller" | "record";
  entityId: string;
  field: string;
  multiIndex?: number;
}

export interface ValueReview {
  id: string;
  rowNumber: number;
  fieldLabel: string;
  rawValue: string;
  suggested: string | null;
  fallback: string;
  options: string[];
  target: ReviewTarget;
}

export interface DuplicateReview {
  id: string;
  newCallerId: string;
  newCallerName: string;
  existingCallerId: string;
  existingCallerName: string;
  rowNumbers: number[];
}

export interface SkippedRow {
  rowNumber: number;
  reasons: string[];
}

export interface AutoCorrection {
  rowNumber: number;
  fieldLabel: string;
  from: string;
  to: string;
}

export interface ImportPreviewRow {
  callerName: string;
  voivodeship: string;
  guidanceType: string;
  area: string;
  desc: string;
}

export interface ParsedMigrationResult {
  callers: Caller[];
  records: CallRecord[];
  valueReviews: ValueReview[];
  duplicateReviews: DuplicateReview[];
  skippedRows: SkippedRow[];
  corrections: AutoCorrection[];
  stats: {
    totalRows: number;
    validRows: number;
    skippedCount: number;
    newCallersCount: number;
    existingCallersMatched: number;
    correctionsCount: number;
    reviewCount: number;
  };
  previewRows: ImportPreviewRow[];
}

export interface ImportResolutions {
  values: Record<string, string>;
  duplicates: Record<string, "merge" | "separate">;
}

// ---------------------------------------------------------------------------
// Template download
// ---------------------------------------------------------------------------

export function downloadExcelTemplate(): void {
  const headers = [
    "Kiedy udzielono porady",
    "Imię",
    "Nazwisko",
    "Województwo",
    "Kim jest beneficjent",
    "Rodzaj kontaktu",
    "Kogo dotyczy porada",
    "Rodzaj poradnictwa",
    "Obszar, którego dotyczy porada",
    "Rodzaj porady (krótki opis, czego dotyczyła)",
    "Posiadanie orzeczenia o niepełnosprawności",
    "Stopień niepełnosprawności",
    "Uwagi",
    "Przekazane do innego specjality",
    "Załączniki (pdf/jpg)",
  ];

  const sampleRows = [
    [
      "2026-08-28 10:30",
      "Katarzyna",
      "Kowalska",
      "mazowieckie",
      "rodzic",
      "telefon",
      "dziecko",
      "prawno-obywatelskie",
      "organizowanie kształcenia dzieci i uczniów z ASD",
      "Mama 7-letniego syna z diagnozą ASD. Szkoła odmawia nauczyciela współorganizującego kształcenie.",
      "tak",
      "orzeczenie o niepełnosprawności",
      "Podano art. 127 Prawa Oświatowego. Zalecono pismo do kuratorium i dyrekcji.",
      "dr Barbara Wiśniewska (wsparcie metodyczne)",
      "",
    ],
    [
      "2026-08-27 14:00",
      "Marek",
      "Zieliński",
      "wielkopolskie",
      "osoba dorosła w spektrum",
      "telefon",
      "osoba dorosła",
      "prawno-obywatelskie",
      "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN",
      "Pytanie o świadczenie wspierające i ustalanie poziomu potrzeby wsparcia przez WZON.",
      "tak",
      "umiarkowany",
      "Przedstawiono skalę FIM i procedurę wniosku o ponowne rozpatrzenie.",
      "mgr Joanna Mrożek (wsparcie psychologiczne)",
      "",
    ],
    [
      "2026-08-26 11:15",
      "Katarzyna",
      "Kowalska",
      "śląskie",
      "opiekun",
      "telefon",
      "dziecko",
      "Parent to Parent",
      "życie codzienne/samodzielność",
      "Córka 12 lat (Katowice). Trudności adaptacyjne w klasie 6 i przebodźcowanie.",
      "tak",
      "orzeczenie o niepełnosprawności",
      "Zalecono modyfikację IPET i słuchawki wyciszające.",
      "",
      "",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  ws["!cols"] = [
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 18 },
    { wch: 28 },
    { wch: 38 },
    { wch: 45 },
    { wch: 22 },
    { wch: 26 },
    { wch: 35 },
    { wch: 30 },
    { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historia Porad");
  XLSX.writeFile(wb, "Wzorzec_Bazy_Historii_Porad_PFRON.xlsx");
}

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

function sanitizeCell(value: unknown, maxLength: number = MAX_CELL_LENGTH): string {
  let s = typeof value === "string" ? value : value == null ? "" : String(value);
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u001F\u007F]/g, " ");
  // Neutralize spreadsheet formula injection (=, +, @ at cell start)
  s = s.replace(/^[=+@]+/, "");
  s = s.replace(/\s+/g, " ").trim();
  return s.length > maxLength ? s.slice(0, maxLength) : s;
}

function sanitizeName(value: unknown): string {
  const s = sanitizeCell(value, MAX_NAME_LENGTH);
  return s
    .replace(/[^\p{L}\p{M}\s'.-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCallDate(value: unknown): string | null {
  const toValidISO = (d: Date): string | null => {
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const maxDate = Date.now() + 24 * 60 * 60 * 1000;
    if (year < MIN_CALL_YEAR || d.getTime() > maxDate) return null;
    return d.toISOString();
  };

  if (value instanceof Date) return toValidISO(value);

  // Excel date serial (days since 1900-01-01; 25569 = Unix epoch)
  if (typeof value === "number" && value > 20000 && value < 70000) {
    return toValidISO(new Date(Math.round((value - 25569) * 86400000)));
  }

  const s = sanitizeCell(value, 40);
  if (!s) return null;

  const dmy = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})(?:[\sT]+(\d{1,2}):(\d{2}))?$/);
  if (dmy) {
    return toValidISO(
      new Date(
        Number(dmy[3]),
        Number(dmy[2]) - 1,
        Number(dmy[1]),
        Number(dmy[4] || 12),
        Number(dmy[5] || 0)
      )
    );
  }

  return toValidISO(new Date(s));
}

// ---------------------------------------------------------------------------
// Dictionary keyword hints (order matters: specific before generic)
// ---------------------------------------------------------------------------

const BENEFICIARY_KEYWORDS: KeywordHints = [
  ["osoba dorosła w spektrum", ["spektrum", "samorzecz"]],
  ["rodzic", ["rodzic", "mama", "tata", "matka", "ojciec"]],
  ["opiekun", ["opiekun"]],
];

const CONTACT_KEYWORDS: KeywordHints = [
  ["e-mail", ["mail"]],
  ["telefon", ["tel", "kom"]],
  ["osobisty", ["osobist", "spotkan"]],
];

const SUBJECT_KEYWORDS: KeywordHints = [
  ["dziecko", ["dziec", "uczn", "syn", "cork", "córk"]],
  ["osoba dorosła", ["dorosl"]],
];

const GUIDANCE_TYPE_KEYWORDS: KeywordHints = [
  ["w zakresie psychologii i rehabilitacji społecznej", ["psycholog", "rehabilitac"]],
  ["prawno-obywatelskie", ["prawn", "obywatel"]],
  ["Parent to Parent", ["parent", "p2p"]],
  ["społeczne", ["spolecz"]],
];

const CERT_STATUS_VALUES: DisabilityCertificateStatus[] = ["tak", "nie", "w trakcie"];
const CERT_KEYWORDS: KeywordHints = [
  ["w trakcie", ["trakc", "diagnoz", "oczekuj"]],
  ["nie", ["nie", "brak"]],
  ["tak", ["tak", "posiada", "ma orzecz"]],
];

const DEGREE_KEYWORDS: KeywordHints = [
  ["lekki", ["lekk"]],
  ["umiarkowany", ["umiark"]],
  ["znaczny", ["znaczn"]],
  ["orzeczenie o niepełnosprawności", ["orzecz", "dzieck"]],
  ["brak / nie dotyczy", ["brak", "nie dotyczy"]],
];

const ALL_GUIDANCE_AREAS: string[] = Array.from(
  new Set(Object.values(GUIDANCE_AREAS_MAP).flat())
);

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function makeId(prefix: string): string {
  return prefix + "-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
}

export async function parseExcelFile(
  file: File,
  existingCallers: Caller[]
): Promise<ParsedMigrationResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Plik jest za duży (limit 10 MB). Podziel dane na mniejsze pliki.");
  }
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    throw new Error("Nieobsługiwany format pliku. Wybierz plik .xlsx, .xls lub .csv.");
  }

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array", cellDates: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!worksheet) {
    throw new Error("Plik nie zawiera żadnego arkusza z danymi.");
  }

  const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (rows.length < 2) {
    throw new Error("Plik Excel jest pusty lub nie zawiera wierszy z danymi.");
  }
  if (rows.length > MAX_DATA_ROWS + 1) {
    throw new Error(`Plik zawiera ponad ${MAX_DATA_ROWS} wierszy. Podziel dane na mniejsze pliki.`);
  }

  // Header row may be preceded by a description row (like in the official template)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    const r = rows[i].map((c) => sanitizeCell(c).toLowerCase());
    if (r.some((c) => c.includes("kiedy") || c.includes("imię") || c.includes("imie") || c.includes("nazwisko") || c.includes("województwo"))) {
      headerRowIndex = i;
      break;
    }
  }

  const rawHeaders: string[] = rows[headerRowIndex].map((h) => sanitizeCell(h).toLowerCase());
  const findIdx = (keywords: string[]) =>
    rawHeaders.findIndex((h) => keywords.some((k) => h.includes(k)));

  const idxCallDate = findIdx(["kiedy", "data", "termin"]);
  const idxFirstName = findIdx(["imię", "imie", "first"]);
  const idxLastName = findIdx(["nazwisko", "last"]);
  const idxVoivodeship = findIdx(["województwo", "wojewodztwo", "woj.", "region"]);
  const idxBeneficiary = findIdx(["kim jest beneficjent", "beneficjent"]);
  const idxContactType = findIdx(["rodzaj kontaktu", "kontakt"]);
  const idxSubjectTarget = findIdx(["kogo dotyczy"]);
  const idxGuidanceType = findIdx(["rodzaj poradnictwa", "poradnictw"]);
  const idxGuidanceArea = findIdx(["obszar", "dziedzina"]);
  const idxAdviceDesc = findIdx(["rodzaj porady", "opis", "problem", "zgłoszenie", "treść"]);
  const idxHasCert = findIdx(["posiadanie orzeczenia", "orzeczeni"]);
  const idxDegree = findIdx(["stopień", "stopien"]);
  const idxNotes = findIdx(["uwagi", "notatka", "zalecenia"]);
  const idxReferred = findIdx(["przekazan", "inny specjalista"]);

  if (idxLastName === -1 && idxFirstName === -1) {
    throw new Error(
      "Nie znaleziono kolumn z imieniem i nazwiskiem. Sprawdź, czy pierwszy wiersz zawiera nagłówki zgodne z wzorcem (pobierz szablon)."
    );
  }

  const cell = (row: unknown[], idx: number): unknown => (idx !== -1 ? row[idx] : "");

  const valueReviews: ValueReview[] = [];
  const duplicateReviews: DuplicateReview[] = [];
  const skippedRows: SkippedRow[] = [];
  const corrections: AutoCorrection[] = [];

  const resolveSingle = (
    raw: string,
    dictionary: readonly string[],
    keywords: KeywordHints | undefined,
    fieldLabel: string,
    fallback: string,
    rowNumber: number,
    target: ReviewTarget
  ): string => {
    if (!raw) return fallback;
    const m = matchDictionary(raw, dictionary, keywords);
    if (m.confidence === "exact") return m.value;
    if (m.confidence === "auto") {
      corrections.push({ rowNumber, fieldLabel, from: raw, to: m.value });
      return m.value;
    }
    const suggested = m.confidence === "uncertain" ? m.value : null;
    valueReviews.push({
      id: makeId("rev"),
      rowNumber,
      fieldLabel,
      rawValue: raw,
      suggested,
      fallback,
      options: [...dictionary],
      target,
    });
    return suggested ?? fallback;
  };

  const resolveMulti = (
    raw: string,
    dictionary: readonly string[],
    keywords: KeywordHints | undefined,
    fieldLabel: string,
    fallback: string,
    rowNumber: number,
    targetBase: Omit<ReviewTarget, "multiIndex">
  ): string[] => {
    if (!raw) return [fallback];

    // Dictionary values may themselves contain commas, so split on
    // semicolon/newline first and fall back to commas per unmatched token.
    const tokens = raw
      .split(/[;\n|]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const expanded: string[] = [];
    for (const token of tokens) {
      const whole = matchDictionary(token, dictionary, keywords);
      if (whole.confidence === "none" && token.includes(",")) {
        const parts = token.split(",").map((p) => p.trim()).filter(Boolean);
        const partMatches = parts.map((p) => matchDictionary(p, dictionary, keywords));
        if (partMatches.every((pm) => pm.confidence !== "none")) {
          expanded.push(...parts);
          continue;
        }
      }
      expanded.push(token);
    }

    const out: string[] = [];
    for (const token of expanded) {
      const idx = out.length;
      out.push(
        resolveSingle(token, dictionary, keywords, fieldLabel, fallback, rowNumber, {
          ...targetBase,
          multiIndex: idx,
        })
      );
    }
    return out.length > 0 ? out : [fallback];
  };

  const callersByKey = new Map<string, Caller>();
  const callerRowNumbers = new Map<string, number[]>();
  existingCallers.forEach((c) => {
    callersByKey.set(normalizeText(c.firstName + "_" + c.lastName), c);
  });
  const existingIds = new Set(existingCallers.map((c) => c.id));
  const reportedDuplicatePairs = new Set<string>();

  const findSimilarCaller = (firstName: string, lastName: string): Caller | null => {
    const fullNorm = normalizeText(firstName + lastName);
    let best: Caller | null = null;
    let bestDist = Infinity;
    for (const c of callersByKey.values()) {
      const dist = levenshtein(fullNorm, normalizeText(c.firstName + c.lastName));
      if (dist > 0 && dist <= DUPLICATE_NAME_MAX_DISTANCE && dist < bestDist) {
        bestDist = dist;
        best = c;
      }
    }
    return best;
  };

  const parsedRecords: CallRecord[] = [];
  const previewRows: ImportPreviewRow[] = [];
  let newCallersCount = 0;
  let existingMatchedCount = 0;
  let totalRows = 0;

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => sanitizeCell(c) === "")) continue;
    totalRows++;
    const rowNumber = i + 1;

    const firstName = sanitizeName(cell(row, idxFirstName));
    const lastName = sanitizeName(cell(row, idxLastName));
    const adviceDescription = sanitizeCell(cell(row, idxAdviceDesc));
    const callDateISO = parseCallDate(cell(row, idxCallDate));

    const reasons: string[] = [];
    if (!firstName) reasons.push("brak imienia");
    if (!lastName) reasons.push("brak nazwiska");
    if (!callDateISO) reasons.push("pusta lub niepoprawna data porady");
    if (!adviceDescription) reasons.push("pusta treść porady");
    if (reasons.length > 0 || !callDateISO) {
      skippedRows.push({ rowNumber, reasons });
      continue;
    }

    const callerKey = normalizeText(firstName + "_" + lastName);
    let caller = callersByKey.get(callerKey);

    if (caller) {
      existingMatchedCount++;
      caller.updatedAt = callDateISO;
    } else {
      newCallersCount++;
      const callerId = makeId("caller-migrated");
      caller = {
        id: callerId,
        firstName,
        lastName,
        phoneNumber: "Brak numeru",
        voivodeship: resolveSingle(
          sanitizeCell(cell(row, idxVoivodeship), 60),
          VOIVODESHIPS,
          undefined,
          "Województwo",
          "brak",
          rowNumber,
          { entity: "caller", entityId: callerId, field: "voivodeship" }
        ) as Caller["voivodeship"],
        city: "Nie podano",
        beneficiaryTypes: resolveMulti(
          sanitizeCell(cell(row, idxBeneficiary), 200),
          BENEFICIARY_TYPES,
          BENEFICIARY_KEYWORDS,
          "Kim jest beneficjent",
          "inne",
          rowNumber,
          { entity: "caller", entityId: callerId, field: "beneficiaryTypes" }
        ) as BeneficiaryType[],
        hasDisabilityCertificate: resolveSingle(
          sanitizeCell(cell(row, idxHasCert), 60),
          CERT_STATUS_VALUES,
          CERT_KEYWORDS,
          "Posiadanie orzeczenia",
          "nie",
          rowNumber,
          { entity: "caller", entityId: callerId, field: "hasDisabilityCertificate" }
        ) as DisabilityCertificateStatus,
        disabilityDegree: resolveSingle(
          sanitizeCell(cell(row, idxDegree), 60),
          DISABILITY_DEGREES,
          DEGREE_KEYWORDS,
          "Stopień niepełnosprawności",
          "brak / nie dotyczy",
          rowNumber,
          { entity: "caller", entityId: callerId, field: "disabilityDegree" }
        ) as DisabilityDegree,
        tags: ["Zaimportowano z Excela"],
        createdAt: callDateISO,
        updatedAt: callDateISO,
      };
      callersByKey.set(callerKey, caller);

      const similar = findSimilarCaller(firstName, lastName);
      if (similar) {
        const pairKey = caller.id + "|" + similar.id;
        if (!reportedDuplicatePairs.has(pairKey)) {
          reportedDuplicatePairs.add(pairKey);
          duplicateReviews.push({
            id: makeId("dup"),
            newCallerId: caller.id,
            newCallerName: firstName + " " + lastName,
            existingCallerId: similar.id,
            existingCallerName: similar.firstName + " " + similar.lastName,
            rowNumbers: [],
          });
        }
      }
    }
    callerRowNumbers.set(caller.id, [...(callerRowNumbers.get(caller.id) || []), rowNumber]);

    const recordId = makeId("rec-migrated");
    const guidanceType = resolveSingle(
      sanitizeCell(cell(row, idxGuidanceType), 120),
      GUIDANCE_TYPES,
      GUIDANCE_TYPE_KEYWORDS,
      "Rodzaj poradnictwa",
      "inne",
      rowNumber,
      { entity: "record", entityId: recordId, field: "guidanceType" }
    ) as GuidanceType;

    const areaDict = GUIDANCE_AREAS_MAP[guidanceType] ?? ALL_GUIDANCE_AREAS;
    const areaFallback = areaDict[areaDict.length - 1];

    const record: CallRecord = {
      id: recordId,
      callerId: caller.id,
      callDate: callDateISO,
      specialistId: "spec-migrated",
      specialistName: "Dyżurujący Specjalista",
      specialistRole: "Konsultant",
      contactTypes: resolveMulti(
        sanitizeCell(cell(row, idxContactType), 200),
        CONTACT_TYPES,
        CONTACT_KEYWORDS,
        "Rodzaj kontaktu",
        "inne",
        rowNumber,
        { entity: "record", entityId: recordId, field: "contactTypes" }
      ) as ContactType[],
      subjectTargets: resolveMulti(
        sanitizeCell(cell(row, idxSubjectTarget), 200),
        SUBJECT_TARGETS,
        SUBJECT_KEYWORDS,
        "Kogo dotyczy porada",
        "inne",
        rowNumber,
        { entity: "record", entityId: recordId, field: "subjectTargets" }
      ) as SubjectTarget[],
      guidanceType,
      guidanceAreas: resolveMulti(
        sanitizeCell(cell(row, idxGuidanceArea), 500),
        areaDict,
        undefined,
        "Obszar porady",
        areaFallback,
        rowNumber,
        { entity: "record", entityId: recordId, field: "guidanceAreas" }
      ),
      adviceDescription,
      notes: sanitizeCell(cell(row, idxNotes)),
      referredTo: sanitizeCell(cell(row, idxReferred), 200),
      durationMinutes: 30,
      createdAt: callDateISO,
    };

    parsedRecords.push(record);
    if (previewRows.length < 5) {
      previewRows.push({
        callerName: firstName + " " + lastName,
        voivodeship: caller.voivodeship,
        guidanceType: record.guidanceType,
        area: record.guidanceAreas.join(", "),
        desc:
          adviceDescription.length > 60
            ? adviceDescription.substring(0, 60) + "..."
            : adviceDescription,
      });
    }
  }

  duplicateReviews.forEach((d) => {
    d.rowNumbers = callerRowNumbers.get(d.newCallerId) || [];
  });

  // Only surface duplicate pairs where the existing side is a real, previously
  // saved caller or another caller created in this import
  duplicateReviews.forEach((d) => {
    if (!existingIds.has(d.existingCallerId)) {
      d.existingCallerName += " (również z tego importu)";
    }
  });

  return {
    callers: Array.from(callersByKey.values()),
    records: parsedRecords,
    valueReviews,
    duplicateReviews,
    skippedRows,
    corrections,
    stats: {
      totalRows,
      validRows: parsedRecords.length,
      skippedCount: skippedRows.length,
      newCallersCount,
      existingCallersMatched: existingMatchedCount,
      correctionsCount: corrections.length,
      reviewCount: valueReviews.length + duplicateReviews.length,
    },
    previewRows,
  };
}

// ---------------------------------------------------------------------------
// Finalization — applies user review decisions and merges duplicates
// ---------------------------------------------------------------------------

export function finalizeImport(
  parsed: ParsedMigrationResult,
  resolutions: ImportResolutions
): { callers: Caller[]; records: CallRecord[] } {
  const callers: Caller[] = JSON.parse(JSON.stringify(parsed.callers));
  const records: CallRecord[] = JSON.parse(JSON.stringify(parsed.records));

  const callerById = new Map(callers.map((c) => [c.id, c]));
  const recordById = new Map(records.map((r) => [r.id, r]));

  for (const review of parsed.valueReviews) {
    const chosen = resolutions.values[review.id] ?? review.suggested ?? review.fallback;
    const entity: Record<string, unknown> | undefined =
      review.target.entity === "caller"
        ? (callerById.get(review.target.entityId) as unknown as Record<string, unknown>)
        : (recordById.get(review.target.entityId) as unknown as Record<string, unknown>);
    if (!entity) continue;

    if (review.target.multiIndex !== undefined) {
      const arr = entity[review.target.field];
      if (Array.isArray(arr) && review.target.multiIndex < arr.length) {
        arr[review.target.multiIndex] = chosen;
      }
    } else {
      entity[review.target.field] = chosen;
    }
  }

  const droppedCallerIds = new Set<string>();
  for (const dup of parsed.duplicateReviews) {
    const decision = resolutions.duplicates[dup.id] ?? "merge";
    if (decision !== "merge") continue;
    const target = callerById.get(dup.existingCallerId);
    if (!target || droppedCallerIds.has(dup.existingCallerId)) continue;

    droppedCallerIds.add(dup.newCallerId);
    records.forEach((r) => {
      if (r.callerId === dup.newCallerId) {
        r.callerId = dup.existingCallerId;
        if (r.callDate > target.updatedAt) target.updatedAt = r.callDate;
      }
    });
  }

  const dedupe = (arr: string[]): string[] => Array.from(new Set(arr));
  const finalCallers = callers.filter((c) => !droppedCallerIds.has(c.id));
  finalCallers.forEach((c) => {
    c.beneficiaryTypes = dedupe(c.beneficiaryTypes) as BeneficiaryType[];
  });
  records.forEach((r) => {
    r.contactTypes = dedupe(r.contactTypes) as ContactType[];
    r.subjectTargets = dedupe(r.subjectTargets) as SubjectTarget[];
    r.guidanceAreas = dedupe(r.guidanceAreas);
  });

  return { callers: finalCallers, records };
}
