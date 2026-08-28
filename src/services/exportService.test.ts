import { describe, it, expect } from "vitest";
import {
  anonymizeFreeText,
  buildAnonymousId,
  buildCsvContent,
  buildExportRows,
} from "./exportService";
import { Caller, CallRecord } from "../types";

function makeCaller(overrides: Partial<Caller> = {}): Caller {
  return {
    id: "caller-abc123",
    firstName: "Anna",
    lastName: "Kowalska",
    phoneNumber: "600100200",
    voivodeship: "mazowieckie",
    city: "Grójec",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "nie",
    tags: [],
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides,
  };
}

function makeRecord(overrides: Partial<CallRecord> = {}): CallRecord {
  return {
    id: "rec-1",
    callerId: "caller-abc123",
    callDate: "2026-03-10T12:00:00.000Z",
    specialistId: "spec-1",
    specialistName: "Jan Prawnik",
    specialistRole: "prawnik",
    contactTypes: ["telefon"],
    subjectTargets: ["dziecko"],
    guidanceType: "prawno-obywatelskie",
    guidanceAreas: ["prawo rodzinne i opiekuńcze"],
    adviceDescription: "Porada dotycząca orzeczenia.",
    durationMinutes: 45,
    createdAt: "2026-03-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("buildExportRows — tryb anonimizowany", () => {
  it("nie zawiera imienia, nazwiska, telefonu, miejscowości ani uwag", () => {
    const [row] = buildExportRows([makeRecord()], [makeCaller()], true);

    expect(row).not.toHaveProperty("Imię");
    expect(row).not.toHaveProperty("Nazwisko");
    expect(row).not.toHaveProperty("Telefon");
    expect(row).not.toHaveProperty("Miejscowość");
    expect(row).not.toHaveProperty("Uwagi");

    const serialized = JSON.stringify(row);
    expect(serialized).not.toContain("Kowalska");
    expect(serialized).not.toContain("600100200");
    expect(serialized).not.toContain("Grójec");
  });

  it("nadaje deterministyczny identyfikator anonimowy z końcówki callerId", () => {
    const [row] = buildExportRows([makeRecord()], [makeCaller()], true);
    expect(row["Identyfikator anonimowy"]).toBe("DZWON-ABC123");
    expect(buildAnonymousId("caller-abc123")).toBe("DZWON-ABC123");
  });

  it("czyści opis porady z danych osobowych", () => {
    const record = makeRecord({
      adviceDescription: "Pani Anna Kowalska (tel. 600 100 200, anna@wp.pl) pyta o orzeczenie.",
    });
    const [row] = buildExportRows([record], [makeCaller()], true);
    const description = String(row["Rodzaj porady (opis zanonimizowany)"]);

    expect(description).not.toContain("Anna");
    expect(description).not.toContain("Kowalska");
    expect(description).not.toContain("600");
    expect(description).not.toContain("anna@wp.pl");
    expect(description).toContain("orzeczenie");
  });
});

describe("buildExportRows — braki danych nie są fabrykowane", () => {
  it("puste pola zostają puste zamiast wartości domyślnych", () => {
    const record = makeRecord({
      callerId: "caller-nieistniejacy",
      durationMinutes: 0,
      contactTypes: [],
      subjectTargets: [],
      guidanceAreas: [],
      adviceDescription: "",
      specialistName: "",
    });
    const [row] = buildExportRows([record], [], false);

    expect(row["Posiadanie orzeczenia o niepełnosprawności"]).toBe("");
    expect(row["Stopień niepełnosprawności"]).toBe("");
    expect(row["Czas trwania (min)"]).toBe("");
    expect(row["Kim jest beneficjent"]).toBe("");
    expect(row["Rodzaj kontaktu"]).toBe("");
    expect(row["Kogo dotyczy porada"]).toBe("");
    expect(row["Specjalista"]).toBe("");
    expect(row["Imię"]).toBe("");
    expect(row["Nazwisko"]).toBe("");
  });

  it("faktyczne wartości przechodzą bez zmian", () => {
    const [row] = buildExportRows([makeRecord()], [makeCaller()], false);
    expect(row["Posiadanie orzeczenia o niepełnosprawności"]).toBe("nie");
    expect(row["Czas trwania (min)"]).toBe(45);
    expect(row["Imię"]).toBe("Anna");
    expect(row["Miejscowość"]).toBe("Grójec");
    expect(row["Przekazane do innego specjalisty"]).toBe("");
  });
});

describe("anonymizeFreeText", () => {
  const callers = [makeCaller(), makeCaller({ id: "c2", firstName: "Piotr", lastName: "Nowak" })];

  it("usuwa numery telefonów i PESEL-e", () => {
    const result = anonymizeFreeText("Kontakt: +48 600-100-200, PESEL 90010112345.", callers);
    expect(result).not.toMatch(/\d{3}/);
    expect(result).toContain("[dane usunięte]");
  });

  it("usuwa adresy e-mail", () => {
    const result = anonymizeFreeText("Proszę pisać na jan.nowak+asd@example.co.uk w tej sprawie.", callers);
    expect(result).not.toContain("@");
    expect(result).toContain("w tej sprawie");
  });

  it("usuwa imiona i nazwiska z bazy wraz z odmianą", () => {
    const result = anonymizeFreeText("Rozmowa z Anną Kowalską o synu Piotra Nowaka.", callers);
    expect(result).not.toContain("Ann");
    expect(result).not.toContain("Kowalsk");
    expect(result).not.toContain("Piotr");
    expect(result).not.toContain("Nowak");
    expect(result).toContain("Rozmowa z");
  });

  it("nie zmienia tekstu bez danych osobowych", () => {
    const text = "Omówiono procedurę odwołania od orzeczenia WZON.";
    expect(anonymizeFreeText(text, callers)).toBe(text);
  });
});

describe("buildCsvContent", () => {
  it("generuje CSV z BOM, średnikami i CRLF", () => {
    const csv = buildCsvContent([
      { "Nr porady": 1, "Opis": "zwykły tekst" },
      { "Nr porady": 2, "Opis": "ma \"cudzysłów\"; i średnik" },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    const lines = csv.slice(1).split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('"Nr porady";"Opis"');
    expect(lines[1]).toBe('"1";"zwykły tekst"');
    expect(lines[2]).toBe('"2";"ma ""cudzysłów""; i średnik"');
  });
});
