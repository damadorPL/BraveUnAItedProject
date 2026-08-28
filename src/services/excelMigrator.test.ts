import { describe, it, expect } from "vitest";
import { finalizeImport, ParsedMigrationResult, ImportResolutions } from "./excelMigrator";
import { Caller, CallRecord } from "../types";

describe("Excel Migrator Service", () => {
  it("should finalize import and merge duplicate callers into existing records", () => {
    const existingCaller: Caller = {
      id: "caller-existing",
      firstName: "Marta",
      lastName: "Zielińska",
      phoneNumber: "501 111 222",
      voivodeship: "mazowieckie",
      city: "Warszawa",
      beneficiaryTypes: ["rodzic"],
      hasDisabilityCertificate: "tak",
      tags: ["istniejący"],
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    const newCaller: Caller = {
      id: "caller-new",
      firstName: "Marta",
      lastName: "Zielinska",
      phoneNumber: "Brak numeru",
      voivodeship: "mazowieckie",
      city: "Nie podano",
      beneficiaryTypes: ["rodzic"],
      hasDisabilityCertificate: "tak",
      tags: ["Zaimportowano z Excela"],
      createdAt: "2026-08-10",
      updatedAt: "2026-08-10",
    };

    const record: CallRecord = {
      id: "rec-migrated-1",
      callerId: "caller-new",
      callDate: "2026-08-10",
      specialistId: "spec-1",
      specialistName: "mgr Joanna Mrożek",
      specialistRole: "Psycholog",
      contactTypes: ["telefon"],
      subjectTargets: ["dziecko"],
      guidanceType: "w zakresie psychologii i rehabilitacji społecznej",
      guidanceAreas: ["wsparcie emocjonalne"],
      adviceDescription: "Wsparcie rodzica w procesie adaptacji przedszkolnej.",
      durationMinutes: 30,
      createdAt: "2026-08-10",
    };

    const parsed: ParsedMigrationResult = {
      callers: [existingCaller, newCaller],
      records: [record],
      valueReviews: [],
      duplicateReviews: [
        {
          id: "dup-1",
          newCallerId: "caller-new",
          newCallerName: "Marta Zielinska",
          existingCallerId: "caller-existing",
          existingCallerName: "Marta Zielińska",
          rowNumbers: [2],
        },
      ],
      skippedRows: [],
      corrections: [],
      stats: {
        totalRows: 1,
        validRows: 1,
        skippedCount: 0,
        newCallersCount: 1,
        existingCallersMatched: 0,
        correctionsCount: 0,
        reviewCount: 1,
      },
      previewRows: [],
    };

    const resolutions: ImportResolutions = {
      values: {},
      duplicates: {
        "dup-1": "merge",
      },
    };

    const result = finalizeImport(parsed, resolutions);

    // After merge, caller-new should be dropped and record.callerId remapped to caller-existing
    expect(result.callers.find((c) => c.id === "caller-new")).toBeUndefined();
    expect(result.callers.find((c) => c.id === "caller-existing")).toBeDefined();
    expect(result.records[0].callerId).toBe("caller-existing");
  });

  it("should keep callers separate if user chose 'separate' resolution", () => {
    const existingCaller: Caller = {
      id: "caller-existing",
      firstName: "Jan",
      lastName: "Nowak",
      phoneNumber: "502 222 333",
      voivodeship: "śląskie",
      city: "Katowice",
      beneficiaryTypes: ["osoba_z_asd"],
      hasDisabilityCertificate: "tak",
      tags: [],
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    const newCaller: Caller = {
      id: "caller-new-2",
      firstName: "Jan",
      lastName: "Nowak",
      phoneNumber: "Brak numeru",
      voivodeship: "pomorskie",
      city: "Gdańsk",
      beneficiaryTypes: ["osoba_z_asd"],
      hasDisabilityCertificate: "tak",
      tags: [],
      createdAt: "2026-08-12",
      updatedAt: "2026-08-12",
    };

    const record: CallRecord = {
      id: "rec-2",
      callerId: "caller-new-2",
      callDate: "2026-08-12",
      specialistId: "spec-2",
      specialistName: "mec. Anna Nowak",
      specialistRole: "Prawnik",
      contactTypes: ["telefon"],
      subjectTargets: ["dorosly_z_asd"],
      guidanceType: "prawno-obywatelskie",
      guidanceAreas: ["orzeczenia"],
      adviceDescription: "Porada w sprawie renty socjalnej.",
      durationMinutes: 40,
      createdAt: "2026-08-12",
    };

    const parsed: ParsedMigrationResult = {
      callers: [existingCaller, newCaller],
      records: [record],
      valueReviews: [],
      duplicateReviews: [
        {
          id: "dup-2",
          newCallerId: "caller-new-2",
          newCallerName: "Jan Nowak",
          existingCallerId: "caller-existing",
          existingCallerName: "Jan Nowak",
          rowNumbers: [3],
        },
      ],
      skippedRows: [],
      corrections: [],
      stats: {
        totalRows: 1,
        validRows: 1,
        skippedCount: 0,
        newCallersCount: 1,
        existingCallersMatched: 0,
        correctionsCount: 0,
        reviewCount: 1,
      },
      previewRows: [],
    };

    const resolutions: ImportResolutions = {
      values: {},
      duplicates: {
        "dup-2": "separate",
      },
    };

    const result = finalizeImport(parsed, resolutions);

    expect(result.callers).toHaveLength(2);
    expect(result.records[0].callerId).toBe("caller-new-2");
  });

  it("should apply value review corrections accurately", () => {
    const caller: Caller = {
      id: "caller-review",
      firstName: "Tomasz",
      lastName: "Kowalski",
      phoneNumber: "Brak",
      voivodeship: "brak",
      city: "Nie podano",
      beneficiaryTypes: ["inne"],
      hasDisabilityCertificate: "nie",
      tags: [],
      createdAt: "2026-08-10",
      updatedAt: "2026-08-10",
    };

    const parsed: ParsedMigrationResult = {
      callers: [caller],
      records: [],
      valueReviews: [
        {
          id: "val-rev-1",
          rowNumber: 2,
          fieldLabel: "Województwo",
          rawValue: "Mazow.",
          suggested: "mazowieckie",
          fallback: "brak",
          options: ["mazowieckie", "małopolskie"],
          target: {
            entity: "caller",
            entityId: "caller-review",
            field: "voivodeship",
          },
        },
      ],
      duplicateReviews: [],
      skippedRows: [],
      corrections: [],
      stats: {
        totalRows: 1,
        validRows: 0,
        skippedCount: 0,
        newCallersCount: 1,
        existingCallersMatched: 0,
        correctionsCount: 0,
        reviewCount: 1,
      },
      previewRows: [],
    };

    const resolutions: ImportResolutions = {
      values: {
        "val-rev-1": "mazowieckie",
      },
      duplicates: {},
    };

    const result = finalizeImport(parsed, resolutions);
    expect(result.callers[0].voivodeship).toBe("mazowieckie");
  });
});
