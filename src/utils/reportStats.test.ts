import { describe, it, expect } from "vitest";
import { computeReportStats, GUIDANCE_TYPE_LABELS } from "./reportStats";
import { buildCallersMap } from "./recordFilters";
import { Caller, CallRecord, GUIDANCE_TYPES } from "../types";

function makeCaller(overrides: Partial<Caller> = {}): Caller {
  return {
    id: "caller-1",
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
    callerId: "caller-1",
    callDate: "2026-03-10T12:00:00.000Z",
    specialistId: "spec-1",
    specialistName: "Jan Prawnik",
    specialistRole: "prawnik",
    contactTypes: ["telefon"],
    subjectTargets: ["dziecko"],
    guidanceType: "prawno-obywatelskie",
    guidanceAreas: ["prawo rodzinne i opiekuńcze"],
    adviceDescription: "Porada.",
    durationMinutes: 45,
    createdAt: "2026-03-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("computeReportStats", () => {
  it("liczy KPI: porady, unikalni beneficjenci, orzeczenia, minuty", () => {
    const callers = [
      makeCaller({ id: "c1", hasDisabilityCertificate: "tak" }),
      makeCaller({ id: "c2", hasDisabilityCertificate: "nie" }),
    ];
    const records = [
      makeRecord({ id: "r1", callerId: "c1", durationMinutes: 30 }),
      makeRecord({ id: "r2", callerId: "c1", durationMinutes: 60 }),
      makeRecord({ id: "r3", callerId: "c2", durationMinutes: undefined }),
    ];

    const stats = computeReportStats(records, buildCallersMap(callers));

    expect(stats.totalRecords).toBe(3);
    expect(stats.uniqueBeneficiaries).toBe(2);
    expect(stats.certifiedBeneficiaries).toBe(1);
    expect(stats.certifiedPercent).toBe(50);
    expect(stats.totalMinutes).toBe(90);
  });

  it("struktura poradnictwa obejmuje wszystkie rodzaje z GUIDANCE_TYPES, także zerowe", () => {
    const stats = computeReportStats(
      [makeRecord({ guidanceType: "inne" })],
      buildCallersMap([makeCaller()])
    );

    expect(stats.guidanceRows.map((r) => r.type)).toEqual(GUIDANCE_TYPES);
    const inne = stats.guidanceRows.find((r) => r.type === "inne");
    expect(inne).toMatchObject({ count: 1, percent: 100, label: GUIDANCE_TYPE_LABELS["inne"] });
    const prawne = stats.guidanceRows.find((r) => r.type === "prawno-obywatelskie");
    expect(prawne).toMatchObject({ count: 0, percent: 0 });
  });

  it("zasięg geograficzny: pełna lista 16 województw, 'brak' tylko gdy występuje", () => {
    const bezBraku = computeReportStats([makeRecord()], buildCallersMap([makeCaller()]));
    expect(bezBraku.voivodeshipRows).toHaveLength(16);
    expect(bezBraku.voivodeshipRows.some((r) => r.name === "brak")).toBe(false);

    const zBrakiem = computeReportStats(
      [makeRecord({ callerId: "nieistniejacy" })],
      buildCallersMap([makeCaller()])
    );
    expect(zBrakiem.voivodeshipRows).toHaveLength(17);
    expect(zBrakiem.voivodeshipRows.find((r) => r.name === "brak")?.count).toBe(1);
  });

  it("pusty zbiór nie dzieli przez zero", () => {
    const stats = computeReportStats([], buildCallersMap([]));
    expect(stats.certifiedPercent).toBe(0);
    expect(stats.guidanceRows.every((r) => r.percent === 0)).toBe(true);
  });
});
