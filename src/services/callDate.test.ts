import { describe, it, expect } from "vitest";
import { todayDateInputValue, callDateToIso } from "./callDate";

describe("Call Date Utilities", () => {
  it("should return today's date formatted as YYYY-MM-DD", () => {
    const today = todayDateInputValue();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(today).toBe(new Date().toISOString().slice(0, 10));
  });

  it("should convert date input value to valid ISO string", () => {
    const iso = callDateToIso("2026-08-15");
    expect(iso).toContain("2026-08-15");
    expect(new Date(iso).getTime()).not.toBeNaN();
  });

  it("should handle today or empty input with current ISO date", () => {
    const emptyIso = callDateToIso("");
    expect(new Date(emptyIso).getTime()).not.toBeNaN();

    const todayIso = callDateToIso(todayDateInputValue());
    expect(new Date(todayIso).getTime()).not.toBeNaN();
  });
});
