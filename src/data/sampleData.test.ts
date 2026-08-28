import { describe, it, expect } from "vitest";
import { INITIAL_CALLERS, INITIAL_RECORDS, INITIAL_SPECIALISTS } from "./sampleData";
import { GUIDANCE_TYPES, GUIDANCE_AREAS_MAP, VOIVODESHIPS, BENEFICIARY_TYPES } from "../types";

describe("Sample Data Integrity (71 Records Base)", () => {
  it("should have exactly 71 initial call records", () => {
    expect(INITIAL_RECORDS).toHaveLength(71);
  });

  it("should have all records reference valid existing callers", () => {
    const callerIdSet = new Set(INITIAL_CALLERS.map((c) => c.id));
    for (const record of INITIAL_RECORDS) {
      expect(callerIdSet.has(record.callerId)).toBe(true);
    }
  });

  it("should have all records reference valid existing specialists", () => {
    const specialistIdSet = new Set(INITIAL_SPECIALISTS.map((s) => s.id));
    for (const record of INITIAL_RECORDS) {
      expect(specialistIdSet.has(record.specialistId)).toBe(true);
    }
  });

  it("should have valid guidanceType for all records", () => {
    for (const record of INITIAL_RECORDS) {
      expect(GUIDANCE_TYPES).toContain(record.guidanceType);
    }
  });

  it("should have valid guidance areas corresponding to guidanceType", () => {
    for (const record of INITIAL_RECORDS) {
      expect(record.guidanceAreas.length).toBeGreaterThan(0);
      expect(Array.isArray(record.guidanceAreas)).toBe(true);
    }
  });

  it("should have valid voivodeship and beneficiaryTypes for all callers", () => {
    for (const caller of INITIAL_CALLERS) {
      expect(VOIVODESHIPS).toContain(caller.voivodeship);
      expect(caller.beneficiaryTypes.length).toBeGreaterThan(0);
      for (const bType of caller.beneficiaryTypes) {
        expect(BENEFICIARY_TYPES).toContain(bType);
      }
    }
  });

  it("should have valid admin specialist configuration", () => {
    const admin = INITIAL_SPECIALISTS.find((s) => s.isAdmin);
    expect(admin).toBeDefined();
    expect(admin?.id).toBe("spec-admin");
    expect(admin?.name).toContain("Michał Adamczyk");
    expect(admin?.email).toBe("admin@synapsis.org.pl");
  });

  it("should have valid dates and positive durations on all records", () => {
    for (const record of INITIAL_RECORDS) {
      expect(record.durationMinutes).toBeGreaterThan(0);
      expect(new Date(record.callDate).getTime()).not.toBeNaN();
    }
  });
});
