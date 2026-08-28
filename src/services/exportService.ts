import * as XLSX from "xlsx";
import { Caller, CallRecord } from "../types";
import { buildCallersMap } from "../utils/recordFilters";

export interface ExportOptions {
  anonymized?: boolean;
  format?: "csv" | "xlsx";
  filenamePrefix?: string;
}

export type ExportRow = Record<string, string | number>;

// Puste pole zamiast zmyślonej wartości — raport grantowy nie może
// fabrykować danych, których nie ma w rejestrze.
const EMPTY = "";

const PHONE_OR_PESEL_REGEX = /(?:\+?\d[\s-]?){7,13}\d/g;
const EMAIL_REGEX = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi;
const REDACTED = "[dane usunięte]";

export function buildAnonymousId(callerId: string): string {
  const suffix = callerId.slice(-6).toUpperCase();
  return "DZWON-" + (suffix || "ANON");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Usuwa z tekstu swobodnego dane osobowe: numery telefonów / PESEL, adresy
// e-mail oraz imiona i nazwiska figurujące w bazie dzwoniących (wraz z prostą
// odmianą fleksyjną — dopuszczamy do 4 liter końcówki po temacie imienia).
export function anonymizeFreeText(text: string, callers: Caller[]): string {
  if (!text) return text;

  let result = text.replace(PHONE_OR_PESEL_REGEX, REDACTED).replace(EMAIL_REGEX, REDACTED);

  const names = new Set<string>();
  callers.forEach((c) => {
    [c.firstName, c.lastName].forEach((name) => {
      const trimmed = (name || "").trim();
      if (trimmed.length >= 3) names.add(trimmed);
    });
  });

  names.forEach((name) => {
    const stem = /[aeiouyąęó]$/i.test(name) && name.length >= 4 ? name.slice(0, -1) : name;
    const pattern = new RegExp(
      "(?<!\\p{L})" + escapeRegex(stem) + "\\p{L}{0,4}(?!\\p{L})",
      "giu"
    );
    result = result.replace(pattern, REDACTED);
  });

  return result;
}

export function buildExportRows(
  records: CallRecord[],
  callers: Caller[],
  anonymized: boolean
): ExportRow[] {
  const callersMap = buildCallersMap(callers);

  return records.map((rec, index): ExportRow => {
    const caller = callersMap.get(rec.callerId);
    const dateFormatted = rec.callDate
      ? new Date(rec.callDate).toLocaleString("pl-PL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : EMPTY;

    const beneficiaryStr = caller?.beneficiaryTypes?.join(", ") || EMPTY;
    const contactStr = rec.contactTypes?.join(", ") || EMPTY;
    const subjectStr = rec.subjectTargets?.join(", ") || EMPTY;
    const areasStr = rec.guidanceAreas?.join(", ") || EMPTY;
    const duration =
      typeof rec.durationMinutes === "number" && rec.durationMinutes > 0
        ? rec.durationMinutes
        : EMPTY;

    if (anonymized) {
      return {
        "Nr porady": index + 1,
        "Kiedy udzielono porady": dateFormatted,
        "Identyfikator anonimowy": buildAnonymousId(rec.callerId),
        "Województwo": caller?.voivodeship || EMPTY,
        "Kim jest beneficjent": beneficiaryStr,
        "Rodzaj kontaktu": contactStr,
        "Kogo dotyczy porada": subjectStr,
        "Rodzaj poradnictwa": rec.guidanceType || EMPTY,
        "Obszar, którego dotyczy porada": areasStr,
        "Rodzaj porady (opis zanonimizowany)": anonymizeFreeText(
          rec.adviceDescription || EMPTY,
          callers
        ),
        "Posiadanie orzeczenia o niepełnosprawności": caller?.hasDisabilityCertificate || EMPTY,
        "Stopień niepełnosprawności": caller?.disabilityDegree || EMPTY,
        "Czas trwania (min)": duration,
        "Specjalista": rec.specialistName || EMPTY,
      };
    }

    return {
      "Nr porady": index + 1,
      "Kiedy udzielono porady": dateFormatted,
      "Imię": caller?.firstName || EMPTY,
      "Nazwisko": caller?.lastName || EMPTY,
      "Telefon": caller?.phoneNumber || EMPTY,
      "Województwo": caller?.voivodeship || EMPTY,
      "Miejscowość": caller?.city || EMPTY,
      "Kim jest beneficjent": beneficiaryStr,
      "Rodzaj kontaktu": contactStr,
      "Kogo dotyczy porada": subjectStr,
      "Rodzaj poradnictwa": rec.guidanceType || EMPTY,
      "Obszar, którego dotyczy porada": areasStr,
      "Rodzaj porady (krótki opis, czego dotyczyła)": rec.adviceDescription || EMPTY,
      "Posiadanie orzeczenia o niepełnosprawności": caller?.hasDisabilityCertificate || EMPTY,
      "Stopień niepełnosprawności": caller?.disabilityDegree || EMPTY,
      "Uwagi": rec.notes || EMPTY,
      "Przekazane do innego specjalisty": rec.referredTo || EMPTY,
      "Specjalista": rec.specialistName || EMPTY,
      "Czas trwania (min)": duration,
    };
  });
}

// CSV pod polskiego Excela: separator ";", BOM UTF-8, CRLF, pola w cudzysłowach.
export function buildCsvContent(rows: ExportRow[]): string {
  const headers = Object.keys(rows[0]);
  const csvRows: string[] = [];

  const quote = (value: unknown): string =>
    "\"" + String(value ?? "").replace(/"/g, "\"\"") + "\"";

  csvRows.push(headers.map(quote).join(";"));

  rows.forEach((row) => {
    csvRows.push(headers.map((header) => quote(row[header])).join(";"));
  });

  return "\uFEFF" + csvRows.join("\r\n");
}

export function exportRecordsData(
  records: CallRecord[],
  callers: Caller[],
  options: ExportOptions = {}
): boolean {
  const { anonymized = false, format = "csv", filenamePrefix = "Baza_Porad_PFRON" } = options;

  const exportData = buildExportRows(records, callers, anonymized);

  if (exportData.length === 0) {
    alert("Brak danych do wyeksportowania dla zadanych filtrów.");
    return false;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const modeSuffix = anonymized ? "_ANONIMOWY_PFRON" : "_PELNY";
  const filename = filenamePrefix + "_" + timestamp + modeSuffix;

  if (format === "xlsx") {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historia Porad");
    XLSX.writeFile(wb, filename + ".xlsx");
    return true;
  }

  const csvContent = buildCsvContent(exportData);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
