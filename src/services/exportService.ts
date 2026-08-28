import * as XLSX from "xlsx";
import { Caller, CallRecord } from "../types";

export interface ExportOptions {
  anonymized?: boolean;
  format?: "csv" | "xlsx";
  filenamePrefix?: string;
}

export function exportRecordsData(
  records: CallRecord[],
  callers: Caller[],
  options: ExportOptions = {}
): void {
  const { anonymized = false, format = "csv", filenamePrefix = "Baza_Porad_PFRON" } = options;

  const callersMap = new Map<string, Caller>();
  callers.forEach((c) => callersMap.set(c.id, c));

  const exportData = records.map((rec, index) => {
    const caller = callersMap.get(rec.callerId);
    const dateFormatted = rec.callDate
      ? new Date(rec.callDate).toLocaleString("pl-PL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Brak daty";

    const beneficiaryStr = caller?.beneficiaryTypes?.join(", ") || "rodzic";
    const contactStr = rec.contactTypes?.join(", ") || "telefon";
    const subjectStr = rec.subjectTargets?.join(", ") || "dziecko";
    const areasStr = rec.guidanceAreas?.join(", ") || "";

    if (anonymized) {
      return {
        "Nr porady": index + 1,
        "Kiedy udzielono porady": dateFormatted,
        "Identyfikator anonimowy": "DZWON-" + (rec.callerId.slice(-6).toUpperCase() || "ANON"),
        "Województwo": caller?.voivodeship || "brak",
        "Miejscowość": caller?.city || "Nie podano",
        "Kim jest beneficjent": beneficiaryStr,
        "Rodzaj kontaktu": contactStr,
        "Kogo dotyczy porada": subjectStr,
        "Rodzaj poradnictwa": rec.guidanceType || "w zakresie psychologii i rehabilitacji społecznej",
        "Obszar, którego dotyczy porada": areasStr,
        "Rodzaj porady (opis zanonimizowany)": rec.adviceDescription || "",
        "Posiadanie orzeczenia o niepełnosprawności": caller?.hasDisabilityCertificate || "tak",
        "Stopień niepełnosprawności": caller?.disabilityDegree || "orzeczenie o niepełnosprawności",
        "Czas trwania (min)": rec.durationMinutes || 30,
        "Specjalista": rec.specialistName || "Konsultant",
      };
    }

    return {
      "Nr porady": index + 1,
      "Kiedy udzielono porady": dateFormatted,
      "Imię": caller ? caller.firstName : "Anonim",
      "Nazwisko": caller ? caller.lastName : "Brak danych",
      "Telefon": caller?.phoneNumber || "Brak numeru",
      "Województwo": caller?.voivodeship || "brak",
      "Miejscowość": caller?.city || "Nie podano",
      "Kim jest beneficjent": beneficiaryStr,
      "Rodzaj kontaktu": contactStr,
      "Kogo dotyczy porada": subjectStr,
      "Rodzaj poradnictwa": rec.guidanceType || "w zakresie psychologii i rehabilitacji społecznej",
      "Obszar, którego dotyczy porada": areasStr,
      "Rodzaj porady (krótki opis, czego dotyczyła)": rec.adviceDescription || "",
      "Posiadanie orzeczenia o niepełnosprawności": caller?.hasDisabilityCertificate || "tak",
      "Stopień niepełnosprawności": caller?.disabilityDegree || "orzeczenie o niepełnosprawności",
      "Uwagi": rec.notes || "",
      "Przekazane do innego specjality": rec.referredTo || "",
      "Specjalista": rec.specialistName || "Konsultant",
      "Czas trwania (min)": rec.durationMinutes || 30,
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const modeSuffix = anonymized ? "_ANONIMOWY_PFRON" : "_PELNY";
  const filename = filenamePrefix + "_" + timestamp + modeSuffix;

  if (format === "xlsx") {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historia Porad");
    XLSX.writeFile(wb, filename + ".xlsx");
    return;
  }

  // Format CSV with UTF-8 BOM for Excel compatibility
  if (exportData.length === 0) {
    alert("Brak danych do wyeksportowania dla zadanych filtrów.");
    return;
  }

  const headers = Object.keys(exportData[0]);
  const csvRows: string[] = [];

  csvRows.push(headers.map((h) => "\"" + String(h).replace(/"/g, "\"\"") + "\"").join(";"));

  exportData.forEach((row: any) => {
    const values = headers.map((header) => {
      const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : "";
      return "\"" + val.replace(/"/g, "\"\"") + "\"";
    });
    csvRows.push(values.join(";"));
  });

  const csvContent = "\uFEFF" + csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
