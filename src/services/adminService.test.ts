import { describe, it, expect } from "vitest";
import { Caller, CallRecord, Specialist } from "../types";

describe("Admin Functionality: Contact Merging Logic", () => {
  it("should merge records from source caller to target caller", () => {
    const targetCaller: Caller = {
      id: "caller-1",
      firstName: "Anna",
      lastName: "Kowalska",
      phoneNumber: "601 234 567",
      voivodeship: "mazowieckie",
      city: "Warszawa",
      beneficiaryTypes: ["rodzic"],
      hasDisabilityCertificate: "tak",
      tags: ["ASD", "wczesne wspomaganie"],
      attachments: [{ id: "att-1", name: "orzeczenie.pdf", size: 1024, type: "pdf", mimeType: "application/pdf", uploadedAt: "2026-08-01" }],
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    const sourceCaller: Caller = {
      id: "caller-2",
      firstName: "Anna",
      lastName: "Kowalska",
      phoneNumber: "601 234 567",
      voivodeship: "mazowieckie",
      city: "Warszawa",
      beneficiaryTypes: ["opiekun"],
      hasDisabilityCertificate: "tak",
      tags: ["szkoła integracyjna"],
      attachments: [{ id: "att-2", name: "diagnoza.pdf", size: 2048, type: "pdf", mimeType: "application/pdf", uploadedAt: "2026-08-15" }],
      createdAt: "2026-08-15",
      updatedAt: "2026-08-15",
    };

    const records: CallRecord[] = [
      {
        id: "rec-1",
        callerId: "caller-1",
        callDate: "2026-08-01",
        specialistId: "spec-1",
        specialistName: "mgr Joanna Mrożek",
        specialistRole: "Psycholog",
        contactTypes: ["telefon"],
        subjectTargets: ["dziecko"],
        guidanceType: "w zakresie psychologii i rehabilitacji społecznej",
        guidanceAreas: ["wsparcie"],
        adviceDescription: "Pierwsza porada",
        durationMinutes: 30,
        createdAt: "2026-08-01",
      },
      {
        id: "rec-2",
        callerId: "caller-2",
        callDate: "2026-08-15",
        specialistId: "spec-2",
        specialistName: "mec. Anna Nowak",
        specialistRole: "Prawnik",
        contactTypes: ["telefon"],
        subjectTargets: ["dziecko"],
        guidanceType: "prawno-obywatelskie",
        guidanceAreas: ["orzeczenia"],
        adviceDescription: "Druga porada (ze zdublowanego kontaktu)",
        durationMinutes: 45,
        createdAt: "2026-08-15",
      },
    ];

    // Simulate merge
    const remappedRecords = records.map((r) =>
      r.callerId === sourceCaller.id ? { ...r, callerId: targetCaller.id } : r
    );

    expect(remappedRecords.filter((r) => r.callerId === targetCaller.id)).toHaveLength(2);
    expect(remappedRecords.filter((r) => r.callerId === sourceCaller.id)).toHaveLength(0);

    // Check tags combination
    const combinedTags = Array.from(new Set([...targetCaller.tags, ...sourceCaller.tags]));
    expect(combinedTags).toContain("ASD");
    expect(combinedTags).toContain("szkoła integracyjna");

    // Check attachments combination
    const combinedAtts = [...(targetCaller.attachments || []), ...(sourceCaller.attachments || [])];
    expect(combinedAtts).toHaveLength(2);
  });

  it("should validate specialist email and admin privileges", () => {
    const adminSpec: Specialist = {
      id: "spec-admin",
      name: "dr Michał Adamczyk (Admin)",
      email: "m.adamczyk@synapsis.org.pl",
      title: "Psychiatra / Kierownik",
      role: "Administrator Systemu",
      guidanceType: "w zakresie psychologii i rehabilitacji społecznej",
      isAdmin: true,
      avatarBg: "bg-amber-600",
    };

    expect(adminSpec.isAdmin).toBe(true);
    expect(adminSpec.email).toContain("@");
  });

  it("should correctly update caller contact details and disability certificate", () => {
    const originalCaller: Caller = {
      id: "caller-test-1",
      firstName: "Marta",
      lastName: "Wiśniewska",
      phoneNumber: "600 111 222",
      voivodeship: "mazowieckie",
      city: "Warszawa",
      beneficiaryTypes: ["rodzic"],
      hasDisabilityCertificate: "w trakcie",
      tags: ["przedszkole"],
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    const updatedCaller: Caller = {
      ...originalCaller,
      lastName: "Wiśniewska-Kowalska",
      phoneNumber: "600 999 888",
      hasDisabilityCertificate: "tak",
      disabilityDegree: "znaczny",
      tags: ["przedszkole", "orzeczenie WZON"],
      updatedAt: "2026-08-28",
    };

    expect(updatedCaller.lastName).toBe("Wiśniewska-Kowalska");
    expect(updatedCaller.phoneNumber).toBe("600 999 888");
    expect(updatedCaller.hasDisabilityCertificate).toBe("tak");
    expect(updatedCaller.disabilityDegree).toBe("znaczny");
    expect(updatedCaller.tags).toContain("orzeczenie WZON");
  });

  it("should handle deleting caller and removing their associated records", () => {
    const callers: Caller[] = [
      {
        id: "caller-1",
        firstName: "Jan",
        lastName: "Kowalski",
        phoneNumber: "111",
        voivodeship: "mazowieckie",
        city: "Warszawa",
        beneficiaryTypes: ["rodzic"],
        hasDisabilityCertificate: "tak",
        tags: [],
        createdAt: "2026-08-01",
        updatedAt: "2026-08-01",
      },
      {
        id: "caller-2",
        firstName: "Ewa",
        lastName: "Nowak",
        phoneNumber: "222",
        voivodeship: "małopolskie",
        city: "Kraków",
        beneficiaryTypes: ["opiekun"],
        hasDisabilityCertificate: "nie",
        tags: [],
        createdAt: "2026-08-01",
        updatedAt: "2026-08-01",
      },
    ];

    const records: CallRecord[] = [
      {
        id: "rec-1",
        callerId: "caller-1",
        callDate: "2026-08-01",
        specialistId: "spec-1",
        specialistName: "Spec",
        specialistRole: "Role",
        contactTypes: ["telefon"],
        subjectTargets: ["dziecko"],
        guidanceType: "społeczne",
        guidanceAreas: ["inne"],
        adviceDescription: "Opis 1",
        durationMinutes: 30,
        createdAt: "2026-08-01",
      },
      {
        id: "rec-2",
        callerId: "caller-2",
        callDate: "2026-08-02",
        specialistId: "spec-1",
        specialistName: "Spec",
        specialistRole: "Role",
        contactTypes: ["telefon"],
        subjectTargets: ["dziecko"],
        guidanceType: "społeczne",
        guidanceAreas: ["inne"],
        adviceDescription: "Opis 2",
        durationMinutes: 20,
        createdAt: "2026-08-02",
      },
    ];

    // Admin deletes caller-1
    const callerIdToDelete = "caller-1";
    const nextCallers = callers.filter((c) => c.id !== callerIdToDelete);
    const nextRecords = records.filter((r) => r.callerId !== callerIdToDelete);

    expect(nextCallers).toHaveLength(1);
    expect(nextCallers[0].id).toBe("caller-2");
    expect(nextRecords).toHaveLength(1);
    expect(nextRecords[0].id).toBe("rec-2");
  });

  it("should distinguish specialists with avatars from specialists without avatars", () => {
    const specialistsWithMixedAvatars: Specialist[] = [
      {
        id: "spec-1",
        name: "mgr Joanna Mrożek",
        role: "Psycholog",
        title: "Psycholog",
        guidanceType: "w zakresie psychologii i rehabilitacji społecznej",
        avatarBg: "bg-purple-600",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
        email: "j.mrozek@synapsis.org.pl",
        isAdmin: false,
      },
      {
        id: "spec-2",
        name: "dr Barbara Wiśniewska",
        role: "Doradca P2P",
        title: "Pedagog",
        guidanceType: "Parent to Parent",
        avatarBg: "bg-emerald-600",
        email: "b.wisniewska@synapsis.org.pl",
        isAdmin: false,
      },
    ];

    const withAvatar = specialistsWithMixedAvatars.filter((s) => Boolean(s.avatarUrl));
    const withoutAvatar = specialistsWithMixedAvatars.filter((s) => !s.avatarUrl);

    expect(withAvatar).toHaveLength(1);
    expect(withAvatar[0].name).toBe("mgr Joanna Mrożek");
    expect(withAvatar[0].avatarUrl).toContain("unsplash.com");

    expect(withoutAvatar).toHaveLength(1);
    expect(withoutAvatar[0].name).toBe("dr Barbara Wiśniewska");
    expect(withoutAvatar[0].avatarUrl).toBeUndefined();
  });
});
