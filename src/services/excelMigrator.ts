import * as XLSX from "xlsx";
import {
  Caller,
  CallRecord,
  GuidanceType,
  GUIDANCE_TYPES,
  GUIDANCE_AREAS_MAP,
  Voivodeship,
  VOIVODESHIPS,
  BeneficiaryType,
  BENEFICIARY_TYPES,
  ContactType,
  CONTACT_TYPES,
  SubjectTarget,
  SUBJECT_TARGETS,
  DisabilityCertificateStatus,
  DisabilityDegree,
  DISABILITY_DEGREES,
} from "../types";
import { normalizeText } from "./storage";

export interface ParsedMigrationResult {
  callers: Caller[];
  records: CallRecord[];
  stats: {
    totalRows: number;
    validRows: number;
    newCallersCount: number;
    existingCallersMatched: number;
    errors: string[];
  };
  previewRows: any[];
}

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

function matchVoivodeship(raw: string): Voivodeship {
  if (!raw) return "mazowieckie";
  const norm = normalizeText(raw);
  const found = VOIVODESHIPS.find((v) => normalizeText(v) === norm || norm.includes(normalizeText(v)));
  return found || "mazowieckie";
}

function matchGuidanceType(raw: string): GuidanceType {
  if (!raw) return "w zakresie psychologii i rehabilitacji społecznej";
  const norm = raw.toLowerCase();
  if (norm.includes("prawn")) return "prawno-obywatelskie";
  if (norm.includes("parent")) return "Parent to Parent";
  if (norm.includes("społecz") || norm.includes("spolecz")) return "społeczne";
  if (norm.includes("psycholog") || norm.includes("rehabilitac")) return "w zakresie psychologii i rehabilitacji społecznej";
  return "w zakresie psychologii i rehabilitacji społecznej";
}

function matchBeneficiary(raw: string): BeneficiaryType[] {
  if (!raw) return ["rodzic"];
  const norm = raw.toLowerCase();
  const res: BeneficiaryType[] = [];
  if (norm.includes("rodzic")) res.push("rodzic");
  if (norm.includes("opiekun")) res.push("opiekun");
  if (norm.includes("dorosł") || norm.includes("spektrum") || norm.includes("samorzecz")) res.push("osoba dorosła w spektrum");
  if (res.length === 0) res.push("inne");
  return res;
}

function matchContactType(raw: string): ContactType[] {
  if (!raw) return ["telefon"];
  const norm = raw.toLowerCase();
  const res: ContactType[] = [];
  if (norm.includes("tel") || norm.includes("kom")) res.push("telefon");
  if (norm.includes("mail") || norm.includes("e-mail")) res.push("e-mail");
  if (norm.includes("osobist") || norm.includes("spotkan")) res.push("osobisty");
  if (res.length === 0) res.push("inne");
  return res;
}

function matchSubjectTarget(raw: string): SubjectTarget[] {
  if (!raw) return ["dziecko"];
  const norm = raw.toLowerCase();
  const res: SubjectTarget[] = [];
  if (norm.includes("dziec") || norm.includes("uczn")) res.push("dziecko");
  if (norm.includes("dorosł") || norm.includes("dorosl")) res.push("osoba dorosła");
  if (res.length === 0) res.push("inne");
  return res;
}

function matchDisabilityStatus(raw: string): DisabilityCertificateStatus {
  if (!raw) return "tak";
  const norm = raw.toLowerCase();
  if (norm.includes("nie") || norm === "brak") return "nie";
  if (norm.includes("trakc") || norm.includes("diagnoz")) return "w trakcie";
  return "tak";
}

function matchDisabilityDegree(raw: string): DisabilityDegree {
  if (!raw) return "orzeczenie o niepełnosprawności";
  const norm = raw.toLowerCase();
  if (norm.includes("lekk")) return "lekki";
  if (norm.includes("umiark")) return "umiarkowany";
  if (norm.includes("znaczn")) return "znaczny";
  if (norm.includes("orzeczen") || norm.includes("dzieck")) return "orzeczenie o niepełnosprawności";
  return "brak / nie dotyczy";
}

export async function parseExcelFile(
  file: File,
  existingCallers: Caller[]
): Promise<ParsedMigrationResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (rows.length < 2) {
    throw new Error("Plik Excel jest pusty lub nie zawiera wierszy.");
  }

  // Row 0 or Row 1 might contain headers
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    const r = rows[i].map((c) => String(c || "").toLowerCase());
    if (r.some((c) => c.includes("kiedy") || c.includes("imię") || c.includes("nazwisko") || c.includes("województwo") || c.includes("porad"))) {
      headerRowIndex = i;
      break;
    }
  }

  const rawHeaders: string[] = rows[headerRowIndex].map((h) => String(h || "").trim().toLowerCase());

  const findIdx = (keywords: string[]) =>
    rawHeaders.findIndex((h) => keywords.some((k) => h.includes(k)));

  const idxCallDate = findIdx(["kiedy", "data", "termin"]);
  const idxFirstName = findIdx(["imię", "imie", "first"]);
  const idxLastName = findIdx(["nazwisko", "last", "osoba", "klient"]);
  const idxVoivodeship = findIdx(["województwo", "wojewodztwo", "woj", "region"]);
  const idxBeneficiary = findIdx(["kim jest beneficjent", "beneficjent", "kategoria"]);
  const idxContactType = findIdx(["rodzaj kontaktu", "kontakt"]);
  const idxSubjectTarget = findIdx(["kogo dotyczy porada", "kogo dotyczy", "dotyczy"]);
  const idxGuidanceType = findIdx(["rodzaj poradnictwa", "poradnictwo", "typ porady"]);
  const idxGuidanceArea = findIdx(["obszar", "dziedzina"]);
  const idxAdviceDesc = findIdx(["rodzaj porady", "opis", "problem", "zgłoszenie", "treść"]);
  const idxHasCert = findIdx(["posiadanie orzeczenia", "orzeczenie"]);
  const idxDegree = findIdx(["stopień niepełnosprawności", "stopień", "stopien"]);
  const idxNotes = findIdx(["uwagi", "notatka", "zalecenia", "rekomendacje"]);
  const idxReferred = findIdx(["przekazane", "przekazanie", "inny specjalista"]);

  const callersMap = new Map<string, Caller>();
  existingCallers.forEach((c) => {
    const key = normalizeText(c.firstName + "_" + c.lastName);
    callersMap.set(key, c);
  });

  const parsedRecords: CallRecord[] = [];
  const errors: string[] = [];
  const previewRows: any[] = [];
  let newCallersCount = 0;
  let existingMatchedCount = 0;

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c || String(c).trim() === "")) continue;

    const firstName = String(idxFirstName !== -1 ? row[idxFirstName] : "Anonim").trim() || "Anonim";
    const lastName = String(idxLastName !== -1 ? row[idxLastName] : "").trim() || ("Dzwoniący #" + i);
    const voivodeshipRaw = String(idxVoivodeship !== -1 ? row[idxVoivodeship] : "").trim();
    const beneficiaryRaw = String(idxBeneficiary !== -1 ? row[idxBeneficiary] : "").trim();
    const contactRaw = String(idxContactType !== -1 ? row[idxContactType] : "").trim();
    const subjectRaw = String(idxSubjectTarget !== -1 ? row[idxSubjectTarget] : "").trim();
    const guidanceRaw = String(idxGuidanceType !== -1 ? row[idxGuidanceType] : "").trim();
    const areaRaw = String(idxGuidanceArea !== -1 ? row[idxGuidanceArea] : "").trim();
    const descRaw = String(idxAdviceDesc !== -1 ? row[idxAdviceDesc] : "").trim() || "Konsultacja telefoniczna";
    const certRaw = String(idxHasCert !== -1 ? row[idxHasCert] : "").trim();
    const degreeRaw = String(idxDegree !== -1 ? row[idxDegree] : "").trim();
    const notesRaw = String(idxNotes !== -1 ? row[idxNotes] : "").trim();
    const referredRaw = String(idxReferred !== -1 ? row[idxReferred] : "").trim();
    const callDateRaw = String(idxCallDate !== -1 ? row[idxCallDate] : "").trim();

    let callDateISO = new Date().toISOString();
    if (callDateRaw) {
      const parsedDate = new Date(callDateRaw);
      if (!isNaN(parsedDate.getTime())) {
        callDateISO = parsedDate.toISOString();
      }
    }

    const callerKey = normalizeText(firstName + "_" + lastName);
    let caller = callersMap.get(callerKey);

    if (caller) {
      existingMatchedCount++;
      caller.updatedAt = callDateISO;
    } else {
      newCallersCount++;
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      caller = {
        id: "caller-migrated-" + Date.now() + "-" + randomSuffix,
        firstName,
        lastName,
        phoneNumber: "Brak numeru",
        voivodeship: matchVoivodeship(voivodeshipRaw),
        city: "Nie podano",
        beneficiaryTypes: matchBeneficiary(beneficiaryRaw),
        hasDisabilityCertificate: matchDisabilityStatus(certRaw),
        disabilityDegree: matchDisabilityDegree(degreeRaw),
        tags: ["Zaimportowano z Excela"],
        createdAt: callDateISO,
        updatedAt: callDateISO,
      };
      callersMap.set(callerKey, caller);
    }

    const randomRecSuffix = Math.random().toString(36).substring(2, 8);
    const guidanceType = matchGuidanceType(guidanceRaw);
    const record: CallRecord = {
      id: "rec-migrated-" + Date.now() + "-" + randomRecSuffix,
      callerId: caller.id,
      callDate: callDateISO,
      specialistId: "spec-migrated",
      specialistName: "Dyżurujący Specjalista",
      specialistRole: "Konsultant",
      contactTypes: matchContactType(contactRaw),
      subjectTargets: matchSubjectTarget(subjectRaw),
      guidanceType,
      guidanceAreas: areaRaw ? [areaRaw] : (GUIDANCE_AREAS_MAP[guidanceType] ? [GUIDANCE_AREAS_MAP[guidanceType][0]] : ["inne"]),
      adviceDescription: descRaw,
      notes: notesRaw,
      referredTo: referredRaw,
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
        desc: descRaw.length > 50 ? descRaw.substring(0, 50) + "..." : descRaw,
      });
    }
  }

  return {
    callers: Array.from(callersMap.values()),
    records: parsedRecords,
    stats: {
      totalRows: rows.length - (headerRowIndex + 1),
      validRows: parsedRecords.length,
      newCallersCount,
      existingCallersMatched: existingMatchedCount,
      errors,
    },
    previewRows,
  };
}
