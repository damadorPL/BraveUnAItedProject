import { describe, it, expect } from "vitest";
import { computeRecordChanges } from "./auditLogger";
import { CallRecord, Specialist } from "../types";

const mockSpecialist: Specialist = {
  id: "spec-1",
  name: "dr Michał Adamczyk",
  role: "Psycholog kliniczny",
  title: "dr n. med.",
  guidanceType: "w zakresie psychologii i rehabilitacji społecznej",
  avatarBg: "#296B6E",
  email: "m.adamczyk@synapsis.org.pl",
  isAdmin: true,
};

const baseRecord: CallRecord = {
  id: "rec-101",
  callerId: "caller-1",
  callDate: "2026-08-25T13:20:00.000Z",
  specialistId: "spec-2",
  specialistName: "mec. Anna Nowak",
  specialistRole: "Radca Prawny",
  contactTypes: ["telefon"],
  subjectTargets: ["dziecko"],
  guidanceType: "prawno-obywatelskie",
  guidanceAreas: ["zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN"],
  adviceDescription: "Konsultacja w sprawie odwołania od odmownej decyzji punktu 7 i 8.",
  notes: "Przeanalizowano dostarczoną dokumentację.",
  durationMinutes: 45,
  createdAt: "2026-08-25T13:20:00.000Z",
};

describe("computeRecordChanges", () => {
  it("zwraca null gdy nie ma żadnych zmian", () => {
    const log = computeRecordChanges(baseRecord, { ...baseRecord }, mockSpecialist);
    expect(log).toBeNull();
  });

  it("wykrywa zmianę opisu zgłoszenia i uwag", () => {
    const updated: CallRecord = {
      ...baseRecord,
      adviceDescription: "Zaktualizowany opis porady prawnej.",
      notes: "Dodano nowe zalecenia.",
    };

    const log = computeRecordChanges(baseRecord, updated, mockSpecialist);
    expect(log).not.toBeNull();
    expect(log?.editorName).toBe("dr Michał Adamczyk");
    expect(log?.editorRole).toBe("Psycholog kliniczny");
    expect(log?.changes).toHaveLength(2);
    expect(log?.changes.some((c) => c.field === "adviceDescription")).toBe(true);
    expect(log?.changes.some((c) => c.field === "notes")).toBe(true);
  });

  it("wykrywa zmianę rodzaju poradnictwa i obszarów", () => {
    const updated: CallRecord = {
      ...baseRecord,
      guidanceType: "społeczne",
      guidanceAreas: ["wsparcie terapeutyczne"],
    };

    const log = computeRecordChanges(baseRecord, updated, mockSpecialist);
    expect(log).not.toBeNull();
    expect(log?.changes.some((c) => c.field === "guidanceType")).toBe(true);
    expect(log?.changes.some((c) => c.field === "guidanceAreas")).toBe(true);
  });

  it("wykrywa zmianę czasu trwania i daty", () => {
    const updated: CallRecord = {
      ...baseRecord,
      durationMinutes: 60,
      callDate: "2026-08-26T10:00:00.000Z",
    };

    const log = computeRecordChanges(baseRecord, updated, mockSpecialist);
    expect(log).not.toBeNull();
    expect(log?.changes.some((c) => c.field === "durationMinutes")).toBe(true);
    expect(log?.changes.some((c) => c.field === "callDate")).toBe(true);
  });

  it("wykrywa dodanie przekazania do innego specjalisty", () => {
    const updated: CallRecord = {
      ...baseRecord,
      referredTo: "mgr Joanna Mrożek",
      referredNote: "Prośba o wsparcie psychologiczne",
      referredStatus: "OCZEKUJĄCA",
    };

    const log = computeRecordChanges(baseRecord, updated, mockSpecialist);
    expect(log).not.toBeNull();
    expect(log?.changes.some((c) => c.field === "referredTo")).toBe(true);
    expect(log?.changes.some((c) => c.field === "referredNote")).toBe(true);
  });
});
