import { describe, it, expect } from "vitest";
import { createReferralEmailNotification } from "./notificationService";
import { Caller, Specialist } from "../types";

describe("createReferralEmailNotification", () => {
  const fromSpecialist: Specialist = {
    id: "spec-1",
    name: "mgr Joanna Mrożek",
    role: "Koordynatorka / Psycholożka",
    title: "Psycholog",
    guidanceType: "w zakresie psychologii i rehabilitacji społecznej",
    avatarBg: "bg-purple-600",
    email: "j.mrozek@synapsis.org.pl",
  };

  const toSpecialist: Specialist = {
    id: "spec-2",
    name: "mec. Anna Nowak",
    role: "Radca Prawny",
    title: "Prawnik",
    guidanceType: "prawno-obywatelskie",
    avatarBg: "bg-blue-600",
    email: "a.nowak@synapsis.org.pl",
  };

  const caller: Caller = {
    id: "caller-1",
    firstName: "Katarzyna",
    lastName: "Kowalska",
    phoneNumber: "601 234 567",
    voivodeship: "mazowieckie",
    city: "Warszawa",
    beneficiaryTypes: ["rodzic"],
    hasDisabilityCertificate: "tak",
    createdAt: "2026-06-10T09:30:00.000Z",
    updatedAt: "2026-06-10T09:30:00.000Z",
  };

  it("generates formatted email notification with correct recipient and subject", () => {
    const notification = createReferralEmailNotification({
      recordId: "rec-123",
      caller,
      sender: fromSpecialist,
      recipient: toSpecialist,
      referralNote: "Pilna konsultacja orzeczenia WZON",
      adviceDescription: "Matka pyta o procedurę odwoławczą.",
    });

    expect(notification.recipientEmail).toBe("a.nowak@synapsis.org.pl");
    expect(notification.recipientName).toBe("mec. Anna Nowak");
    expect(notification.senderName).toBe("mgr Joanna Mrożek");
    expect(notification.subject).toContain("Katarzyna Kowalska");
    expect(notification.subject).toContain("Nowa sprawa przekazana");
    expect(notification.message).toContain("Pilna konsultacja orzeczenia WZON");
    expect(notification.message).toContain("601 234 567");
    expect(notification.message).toContain("Warszawa");
  });
});
