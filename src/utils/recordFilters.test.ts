import { describe, it, expect } from "vitest";
import { buildCallersMap, filterCallRecords } from "./recordFilters";
import { Caller, CallRecord, FilterState } from "../types";

const emptyFilters: FilterState = {
  searchQuery: "",
  voivodeship: "",
  guidanceType: "",
  guidanceArea: "",
  beneficiaryType: "",
  specialistId: "",
  dateFrom: "",
  dateTo: "",
};

function makeCaller(overrides: Partial<Caller> = {}): Caller {
  return {
    id: "caller-1",
    firstName: "Anna",
    lastName: "Kowalska",
    phoneNumber: "600100200",
    voivodeship: "mazowieckie",
    city: "Warszawa",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    tags: [],
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides,
  };
}

function makeRecord(overrides: Partial<CallRecord> = {}): CallRecord {
  return {
    id: "rec-1",
    callerId: "caller-1",
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

describe("filterCallRecords", () => {
  const callers = [
    makeCaller(),
    makeCaller({ id: "caller-2", firstName: "Piotr", lastName: "Nowak", voivodeship: "śląskie", beneficiaryTypes: ["opiekun"] }),
  ];
  const callersMap = buildCallersMap(callers);
  const records = [
    makeRecord(),
    makeRecord({
      id: "rec-2",
      callerId: "caller-2",
      callDate: "2026-05-20T09:00:00.000Z",
      specialistId: "spec-2",
      guidanceType: "społeczne",
      guidanceAreas: ["wsparcie terapeutyczne"],
      adviceDescription: "Wsparcie w diagnostyce.",
      notes: "Skierowano do WZON",
    }),
  ];

  it("bez filtrów zwraca wszystkie rekordy", () => {
    expect(filterCallRecords(records, callersMap, emptyFilters)).toHaveLength(2);
  });

  it("filtruje po województwie dzwoniącego", () => {
    const result = filterCallRecords(records, callersMap, { ...emptyFilters, voivodeship: "śląskie" });
    expect(result.map((r) => r.id)).toEqual(["rec-2"]);
  });

  it("filtruje po rodzaju poradnictwa", () => {
    const result = filterCallRecords(records, callersMap, { ...emptyFilters, guidanceType: "prawno-obywatelskie" });
    expect(result.map((r) => r.id)).toEqual(["rec-1"]);
  });

  it("filtruje po typie beneficjenta", () => {
    const result = filterCallRecords(records, callersMap, { ...emptyFilters, beneficiaryType: "opiekun" });
    expect(result.map((r) => r.id)).toEqual(["rec-2"]);
  });

  it("filtruje po specjaliście", () => {
    const result = filterCallRecords(records, callersMap, { ...emptyFilters, specialistId: "spec-2" });
    expect(result.map((r) => r.id)).toEqual(["rec-2"]);
  });

  it("filtruje po obszarze porady", () => {
    const result = filterCallRecords(records, callersMap, { ...emptyFilters, guidanceArea: "wsparcie terapeutyczne" });
    expect(result.map((r) => r.id)).toEqual(["rec-2"]);
  });

  it("filtruje po zakresie dat, dateTo włącznie do końca dnia", () => {
    const from = filterCallRecords(records, callersMap, { ...emptyFilters, dateFrom: "2026-04-01" });
    expect(from.map((r) => r.id)).toEqual(["rec-2"]);

    const to = filterCallRecords(records, callersMap, { ...emptyFilters, dateTo: "2026-03-10" });
    expect(to.map((r) => r.id)).toEqual(["rec-1"]);
  });

  it("wyszukuje w opisie, uwagach i nazwisku dzwoniącego", () => {
    const byNotes = filterCallRecords(records, callersMap, { ...emptyFilters, searchQuery: "wzon" });
    expect(byNotes.map((r) => r.id)).toEqual(["rec-2"]);

    const byName = filterCallRecords(records, callersMap, { ...emptyFilters, searchQuery: "kowalska" });
    expect(byName.map((r) => r.id)).toEqual(["rec-1"]);
  });

  it("łączy wiele filtrów koniunkcją", () => {
    const result = filterCallRecords(records, callersMap, {
      ...emptyFilters,
      voivodeship: "śląskie",
      guidanceType: "prawno-obywatelskie",
    });
    expect(result).toHaveLength(0);
  });
});
