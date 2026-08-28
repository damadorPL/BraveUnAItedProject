import { describe, it, expect } from "vitest";
import { searchCallers } from "./storage";
import { Caller } from "../types";

describe("Caller Search & Storage Logic", () => {
  const callers: Caller[] = [
    {
      id: "caller-1",
      firstName: "Joanna",
      lastName: "Kowalska",
      phoneNumber: "601 234 567",
      voivodeship: "mazowieckie",
      city: "Warszawa",
      beneficiaryTypes: ["rodzic"],
      hasDisabilityCertificate: "tak",
      tags: ["wczesne wspomaganie"],
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    },
    {
      id: "caller-2",
      firstName: "Michał",
      lastName: "Żółtowski",
      phoneNumber: "502 987 654",
      voivodeship: "małopolskie",
      city: "Kraków",
      beneficiaryTypes: ["osoba_z_asd"],
      hasDisabilityCertificate: "tak",
      tags: ["student"],
      createdAt: "2026-08-05",
      updatedAt: "2026-08-05",
    },
    {
      id: "caller-3",
      firstName: "Agnieszka",
      lastName: "Nowak",
      phoneNumber: "789 111 222",
      voivodeship: "wielkopolskie",
      city: "Poznań",
      beneficiaryTypes: ["opiekun"],
      hasDisabilityCertificate: "w_trakcie",
      tags: [],
      createdAt: "2026-08-10",
      updatedAt: "2026-08-10",
    },
  ];

  it("should return all callers when search query is empty", () => {
    expect(searchCallers("", callers)).toHaveLength(3);
    expect(searchCallers("   ", callers)).toHaveLength(3);
  });

  it("should find caller by first name or last name", () => {
    const results = searchCallers("Joanna", callers);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("caller-1");
  });

  it("should find caller ignoring Polish diacritics", () => {
    // Search without diacritics for "Żółtowski"
    const resultsZoltowski = searchCallers("zoltowski", callers);
    expect(resultsZoltowski).toHaveLength(1);
    expect(resultsZoltowski[0].id).toBe("caller-2");

    // Search without diacritics for "Kraków"
    const resultsKrakow = searchCallers("krakow", callers);
    expect(resultsKrakow).toHaveLength(1);
    expect(resultsKrakow[0].id).toBe("caller-2");
  });

  it("should find caller by phone number ignoring spaces and formatting", () => {
    const results = searchCallers("601234567", callers);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("caller-1");
  });

  it("should find caller by reversed full name order (Nazwisko Imię)", () => {
    const results = searchCallers("Nowak Agnieszka", callers);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("caller-3");
  });

  it("should find caller by voivodeship", () => {
    const results = searchCallers("wielkopolskie", callers);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("caller-3");
  });
});
