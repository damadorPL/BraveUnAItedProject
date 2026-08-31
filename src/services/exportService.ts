import * as XLSX from "xlsx";
import { Caller, CallRecord } from "../types";
import { buildCallersMap } from "../utils/recordFilters";
import { computeReportStats } from "../utils/reportStats";

// Reporting period (ISO dates YYYY-MM-DD from record filters) — added to
// "Podsumowanie" (Summary) sheet metadata to provide clear reporting context.
export interface ExportPeriod {
  from?: string;
  to?: string;
}

export interface ExportOptions {
  anonymized?: boolean;
  format?: "csv" | "xlsx";
  filenamePrefix?: string;
  period?: ExportPeriod;
}

export type ExportRow = Record<string, string | number>;

// Empty field instead of fabricated values — grant reports must not
// fabricate data that was not entered in the registry.
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

// Removes personal data from free text: phone / PESEL numbers, email addresses,
// and caller names found in the database (with inflections up to 4 trailing letters).
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

// Chronological sorting: "Nr porady" (Consultation #) must remain stable across
// exports of the same dataset, rather than depending on entry insertion order.
export function sortRecordsByCallDate(records: CallRecord[]): CallRecord[] {
  const time = (rec: CallRecord): number =>
    rec.callDate ? new Date(rec.callDate).getTime() : Number.POSITIVE_INFINITY;
  return [...records].sort((a, b) => time(a) - time(b) || a.id.localeCompare(b.id));
}

export function buildExportRows(
  records: CallRecord[],
  callers: Caller[],
  anonymized: boolean
): ExportRow[] {
  const callersMap = buildCallersMap(callers);

  return sortRecordsByCallDate(records).map((rec, index): ExportRow => {
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

export type SummaryCell = string | number;

function formatPeriodDate(isoDate: string | undefined, fallback: string): string {
  if (!isoDate) return fallback;
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toLocaleDateString("pl-PL");
}

// "Podsumowanie" (Summary) sheet: statistical summary of the reporting period —
// same values displayed by the statistics view (shared computeReportStats).
export function buildSummarySheetData(
  records: CallRecord[],
  callers: Caller[],
  options: { anonymized: boolean; period?: ExportPeriod }
): SummaryCell[][] {
  const stats = computeReportStats(records, buildCallersMap(callers));
  const totalHours = (stats.totalMinutes / 60).toFixed(1);

  const rows: SummaryCell[][] = [
    ["Raport statystyczny: rejestr porad linii PFRON"],
    [],
    ["Wygenerowano", new Date().toLocaleString("pl-PL")],
    ["Okres sprawozdawczy od", formatPeriodDate(options.period?.from, "początek rejestru")],
    ["Okres sprawozdawczy do", formatPeriodDate(options.period?.to, "koniec rejestru")],
    [
      "Tryb eksportu",
      options.anonymized
        ? "anonimizowany (raport dla grantodawcy)"
        : "pełny (do użytku służbowego)",
    ],
    [],
    ["Wskaźnik", "Wartość"],
    ["Udzielone porady", stats.totalRecords],
    ["Beneficjenci objęci poradami (unikalne kartoteki)", stats.uniqueBeneficiaries],
    [
      "W tym z orzeczeniem o niepełnosprawności",
      stats.certifiedBeneficiaries + " (" + stats.certifiedPercent + "%)",
    ],
    ["Suma zarejestrowanego czasu porad (godz.)", totalHours],
    [],
    ["Struktura rodzajów poradnictwa", "Liczba porad", "Udział"],
  ];

  stats.guidanceRows.forEach((row) => {
    rows.push([row.label, row.count, row.percent + "%"]);
  });

  rows.push([]);
  rows.push(["Zasięg geograficzny: województwo", "Liczba porad"]);
  stats.voivodeshipRows.forEach((row) => {
    rows.push([row.name === "brak" ? "brak danych" : row.name, row.count]);
  });

  return rows;
}

// Column widths calculated from longest value (with max cap to avoid infinite stretch).
function columnWidthsFromMatrix(matrix: SummaryCell[][]): { wch: number }[] {
  const widths: number[] = [];
  matrix.forEach((row) => {
    row.forEach((cell, index) => {
      const length = String(cell ?? "").length;
      widths[index] = Math.max(widths[index] || 0, length);
    });
  });
  return widths.map((w) => ({ wch: Math.min(Math.max(w + 2, 10), 60) }));
}

// CSV for Polish Excel: ";" delimiter, UTF-8 BOM, CRLF, quoted fields.
export function buildCsvContent(rows: ExportRow[]): string {
  const headers = Object.keys(rows[0]);
  const csvRows: string[] = [];

  // Protect against CSV/formula injection: prefix with single quote if starts with formula trigger.
  const quote = (value: unknown): string => {
    let str = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    return "\"" + str.replace(/"/g, "\"\"") + "\"";
  };

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
  const {
    anonymized = false,
    format = "csv",
    filenamePrefix = "Baza_Porad_PFRON",
    period,
  } = options;

  const exportData = buildExportRows(records, callers, anonymized);

  if (exportData.length === 0) {
    return false;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const modeSuffix = anonymized ? "_ANONIMOWY_PFRON" : "_PELNY";
  const filename = filenamePrefix + "_" + timestamp + modeSuffix;

  if (format === "xlsx") {
    const headers = Object.keys(exportData[0]);
    const dataMatrix: SummaryCell[][] = [
      headers,
      ...exportData.map((row) => headers.map((header) => row[header])),
    ];

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = columnWidthsFromMatrix(dataMatrix);

    const summaryData = buildSummarySheetData(records, callers, { anonymized, period });
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs["!cols"] = columnWidthsFromMatrix(summaryData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historia Porad");
    XLSX.utils.book_append_sheet(wb, summaryWs, "Podsumowanie");
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
