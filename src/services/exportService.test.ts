import { describe, it, expect } from "vitest";
import {
  anonymizeFreeText,
  buildAnonymousId,
  buildCsvContent,
  buildExportRows,
  buildSummarySheetData,
  sortRecordsByCallDate,
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

describe("sortRecordsByCallDate — stabilny Nr porady", () => {
  it("sortuje rekordy chronologicznie niezależnie od kolejności wejścia", () => {
    const early = makeRecord({ id: "rec-early", callDate: "2026-01-05T09:00:00.000Z" });
    const middle = makeRecord({ id: "rec-middle", callDate: "2026-02-14T09:00:00.000Z" });
    const late = makeRecord({ id: "rec-late", callDate: "2026-03-20T09:00:00.000Z" });

    const sorted = sortRecordsByCallDate([late, early, middle]);
    expect(sorted.map((r) => r.id)).toEqual(["rec-early", "rec-middle", "rec-late"]);
  });

  it("rekordy bez daty trafiają na koniec, remisy rozstrzyga id", () => {
    const noDate = makeRecord({ id: "rec-nodate", callDate: "" });
    const b = makeRecord({ id: "rec-b", callDate: "2026-03-10T12:00:00.000Z" });
    const a = makeRecord({ id: "rec-a", callDate: "2026-03-10T12:00:00.000Z" });

    const sorted = sortRecordsByCallDate([noDate, b, a]);
    expect(sorted.map((r) => r.id)).toEqual(["rec-a", "rec-b", "rec-nodate"]);
  });

  it("nie modyfikuje tablicy wejściowej", () => {
    const input = [
      makeRecord({ id: "r2", callDate: "2026-02-01T00:00:00.000Z" }),
      makeRecord({ id: "r1", callDate: "2026-01-01T00:00:00.000Z" }),
    ];
    sortRecordsByCallDate(input);
    expect(input.map((r) => r.id)).toEqual(["r2", "r1"]);
  });

  it("buildExportRows numeruje porady po dacie, a nie po kolejności wejścia", () => {
    const early = makeRecord({ id: "rec-early", callDate: "2026-01-05T09:00:00.000Z" });
    const late = makeRecord({ id: "rec-late", callDate: "2026-03-20T09:00:00.000Z" });

    const rows = buildExportRows([late, early], [makeCaller()], true);
    expect(rows[0]["Nr porady"]).toBe(1);
    expect(String(rows[0]["Kiedy udzielono porady"])).toContain("05.01.2026");
    expect(rows[1]["Nr porady"]).toBe(2);
    expect(String(rows[1]["Kiedy udzielono porady"])).toContain("20.03.2026");
  });
});

describe("buildCsvContent — ochrona przed CSV injection", () => {
  it("prefiksuje apostrofem wartości zaczynające się od =, +, -, @", () => {
    const csv = buildCsvContent([
      {
        "A": "=HYPERLINK(\"http://evil\")",
        "B": "+48 nie-numer",
        "C": "-cmd",
        "D": "@SUM(A1)",
      },
    ]);
    const dataLine = csv.slice(1).split("\r\n")[1];
    expect(dataLine).toBe(
      "\"'=HYPERLINK(\"\"http://evil\"\")\";\"'+48 nie-numer\";\"'-cmd\";\"'@SUM(A1)\""
    );
  });

  it("nie zmienia zwykłych wartości ani liczb", () => {
    const csv = buildCsvContent([{ "Nr porady": 7, "Opis": "zwykła treść porady" }]);
    const dataLine = csv.slice(1).split("\r\n")[1];
    expect(dataLine).toBe('"7";"zwykła treść porady"');
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

describe("buildSummarySheetData", () => {
  const callers = [
    makeCaller({ id: "c1", hasDisabilityCertificate: "tak", voivodeship: "śląskie" }),
    makeCaller({ id: "c2", hasDisabilityCertificate: "nie" }),
  ];
  const records = [
    makeRecord({ id: "r1", callerId: "c1", durationMinutes: 30 }),
    makeRecord({ id: "r2", callerId: "c2", durationMinutes: 60, guidanceType: "inne" }),
  ];

  it("zawiera metadane okresu sprawozdawczego i trybu eksportu", () => {
    const rows = buildSummarySheetData(records, callers, {
      anonymized: true,
      period: { from: "2026-01-01", to: "2026-03-31" },
    });

    const flat = rows.map((r) => r.join("|"));
    expect(flat).toContain("Okres sprawozdawczy od|1.01.2026");
    expect(flat).toContain("Okres sprawozdawczy do|31.03.2026");
    expect(flat.some((l) => l.startsWith("Tryb eksportu|anonimizowany"))).toBe(true);
  });

  it("bez okresu wpisuje pełny zakres rejestru", () => {
    const rows = buildSummarySheetData(records, callers, { anonymized: false });
    const flat = rows.map((r) => r.join("|"));
    expect(flat).toContain("Okres sprawozdawczy od|początek rejestru");
    expect(flat).toContain("Okres sprawozdawczy do|koniec rejestru");
    expect(flat.some((l) => l.startsWith("Tryb eksportu|pełny"))).toBe(true);
  });

  it("liczy KPI i sekcje zgodnie z computeReportStats", () => {
    const rows = buildSummarySheetData(records, callers, { anonymized: true });
    const flat = rows.map((r) => r.join("|"));

    expect(flat).toContain("Udzielone porady|2");
    expect(flat).toContain("Beneficjenci objęci poradami (unikalne kartoteki)|2");
    expect(flat).toContain("W tym z orzeczeniem o niepełnosprawności|1 (50%)");
    expect(flat).toContain("Suma zarejestrowanego czasu porad (godz.)|1.5");
    expect(flat).toContain("Inne|1|50%");
    expect(flat).toContain("śląskie|1");
    expect(flat).toContain("mazowieckie|1");
    // pełna lista województw bez wiersza "brak danych", bo wszyscy mają województwo
    expect(flat.some((l) => l.startsWith("brak danych|"))).toBe(false);
  });

  it("nie zawiera danych osobowych — tylko agregaty", () => {
    const serialized = JSON.stringify(buildSummarySheetData(records, callers, { anonymized: true }));
    expect(serialized).not.toContain("Kowalska");
    expect(serialized).not.toContain("600100200");
    expect(serialized).not.toContain("Grójec");
  });
});
