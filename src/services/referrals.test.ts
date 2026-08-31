import { describe, it, expect } from "vitest";
import { INITIAL_RECORDS, INITIAL_CALLERS } from "../data/sampleData";


describe("Handoff and Referral System", () => {
  it("contains initial records with pending referrals for specialists", () => {
    const pendingReferrals = INITIAL_RECORDS.filter(
      (r) => (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA" && r.referredTo
    );
    expect(pendingReferrals.length).toBeGreaterThan(0);
  });

  it("correctly identifies pending cases for mec. Anna Nowak (spec-2)", () => {
    const annaCases = INITIAL_RECORDS.filter(
      (r) =>
        (r.referredSpecialistId === "spec-2" ||
          (r.referredTo && r.referredTo.toLowerCase().includes("nowak"))) &&
        (r.referredStatus === "OCZEKUJĄCA" || !r.referredStatus)
    );
    expect(annaCases.length).toBeGreaterThanOrEqual(1);
    expect(annaCases[0].referredNote).toBeDefined();
  });

  it("correctly identifies pending cases for mgr Joanna Mrożek (spec-1)", () => {
    const joannaCases = INITIAL_RECORDS.filter(
      (r) =>
        (r.referredSpecialistId === "spec-1" ||
          (r.referredTo && r.referredTo.toLowerCase().includes("mrożek") || r.referredTo?.toLowerCase().includes("mrozek"))) &&
        (r.referredStatus === "OCZEKUJĄCA" || !r.referredStatus)
    );
    expect(joannaCases.length).toBeGreaterThanOrEqual(1);
  });

  it("correctly identifies pending cases for dr Barbara Wiśniewska (spec-3)", () => {
    const barbaraCases = INITIAL_RECORDS.filter(
      (r) =>
        (r.referredSpecialistId === "spec-3" ||
          (r.referredTo && r.referredTo.toLowerCase().includes("wiśniewska") || r.referredTo?.toLowerCase().includes("wisniewska"))) &&
        (r.referredStatus === "OCZEKUJĄCA" || !r.referredStatus)
    );
    expect(barbaraCases.length).toBeGreaterThanOrEqual(1);
  });

  it("correctly identifies pending cases for mgr Tomasz Lewandowski (spec-4)", () => {
    const tomaszCases = INITIAL_RECORDS.filter(
      (r) =>
        (r.referredSpecialistId === "spec-4" ||
          (r.referredTo && r.referredTo.toLowerCase().includes("lewandowski"))) &&
        (r.referredStatus === "OCZEKUJĄCA" || !r.referredStatus)
    );
    expect(tomaszCases.length).toBeGreaterThanOrEqual(1);
  });

  it("correctly matches referral caller with callers list", () => {
    const referredRec = INITIAL_RECORDS.find((r) => r.referredSpecialistId === "spec-2");
    expect(referredRec).toBeDefined();
    if (referredRec) {
      const caller = INITIAL_CALLERS.find((c) => c.id === referredRec.callerId);
      expect(caller).toBeDefined();
      expect(caller?.firstName).toBeDefined();
      expect(caller?.phoneNumber).toBeDefined();
    }
  });
});
