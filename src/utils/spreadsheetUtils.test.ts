import { describe, it, expect } from "vitest";
import { parseCsvRows, readSpreadsheetRows } from "./spreadsheetUtils";

describe("spreadsheetUtils", () => {
  it("parses semicolon-delimited CSV with UTF-8 BOM and quoted fields", () => {
    const csv = '\uFEFF"Kiedy";"Imię";"Uwagi"\r\n"2026-08-10";"Anna";"Linia 1; ""cytat"""\r\n';
    expect(parseCsvRows(csv)).toEqual([
      ["Kiedy", "Imię", "Uwagi"],
      ["2026-08-10", "Anna", 'Linia 1; "cytat"'],
    ]);
  });

  it("parses comma-delimited CSV", () => {
    const csv = "a,b,c\n1,2,3";
    expect(parseCsvRows(csv)).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("rejects legacy .xls files with a clear message", async () => {
    const buf = new ArrayBuffer(8);
    await expect(readSpreadsheetRows(buf, "legacy.xls")).rejects.toThrow(
      /Starszy format \.xls nie jest obsługiwany/
    );
  });
});
