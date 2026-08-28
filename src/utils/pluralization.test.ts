import { describe, it, expect } from "vitest";
import {
  pluralize,
  pluralizePorady,
  pluralizePoradyWHistorii,
  pluralizeWpisy,
  pluralizeKontakty,
  pluralizeOsoby,
  pluralizeZnalezionoOsoby,
  pluralizeZalaczniki,
  pluralizeSprawy,
  pluralizeOczekujace,
} from "./pluralization";

describe("pluralizePorady", () => {
  it("poprawnie odmienia liczbę porad", () => {
    expect(pluralizePorady(0)).toBe("0 porad");
    expect(pluralizePorady(1)).toBe("1 porada");
    expect(pluralizePorady(2)).toBe("2 porady");
    expect(pluralizePorady(3)).toBe("3 porady");
    expect(pluralizePorady(4)).toBe("4 porady");
    expect(pluralizePorady(5)).toBe("5 porad");
    expect(pluralizePorady(6)).toBe("6 porad");
    expect(pluralizePorady(10)).toBe("10 porad");
    expect(pluralizePorady(11)).toBe("11 porad");
    expect(pluralizePorady(12)).toBe("12 porad");
    expect(pluralizePorady(13)).toBe("13 porad");
    expect(pluralizePorady(14)).toBe("14 porad");
    expect(pluralizePorady(20)).toBe("20 porad");
    expect(pluralizePorady(21)).toBe("21 porad");
    expect(pluralizePorady(22)).toBe("22 porady");
    expect(pluralizePorady(23)).toBe("23 porady");
    expect(pluralizePorady(24)).toBe("24 porady");
    expect(pluralizePorady(25)).toBe("25 porad");
    expect(pluralizePorady(112)).toBe("112 porad");
    expect(pluralizePorady(122)).toBe("122 porady");
  });

  it("zwraca samą etykietę bez liczby gdy withNumber = false", () => {
    expect(pluralizePorady(1, false)).toBe("porada");
    expect(pluralizePorady(2, false)).toBe("porady");
    expect(pluralizePorady(6, false)).toBe("porad");
  });
});

describe("pluralizePoradyWHistorii", () => {
  it("odmienia 'porada w historii'", () => {
    expect(pluralizePoradyWHistorii(1)).toBe("1 porada w historii");
    expect(pluralizePoradyWHistorii(2)).toBe("2 porady w historii");
    expect(pluralizePoradyWHistorii(4)).toBe("4 porady w historii");
    expect(pluralizePoradyWHistorii(5)).toBe("5 porad w historii");
    expect(pluralizePoradyWHistorii(6)).toBe("6 porad w historii");
  });
});

describe("pluralizeWpisy, pluralizeKontakty, pluralizeOsoby, pluralizeZnalezionoOsoby", () => {
  it("odmienia wpisy", () => {
    expect(pluralizeWpisy(1)).toBe("1 wpis");
    expect(pluralizeWpisy(2)).toBe("2 wpisy");
    expect(pluralizeWpisy(5)).toBe("5 wpisów");
  });

  it("odmienia kontakty", () => {
    expect(pluralizeKontakty(1)).toBe("1 kontakt");
    expect(pluralizeKontakty(2)).toBe("2 kontakty");
    expect(pluralizeKontakty(5)).toBe("5 kontaktów");
  });

  it("odmienia osoby", () => {
    expect(pluralizeOsoby(1)).toBe("1 osoba");
    expect(pluralizeOsoby(2)).toBe("2 osoby");
    expect(pluralizeOsoby(5)).toBe("5 osób");
  });

  it("odmienia znalezione osoby w bierniku", () => {
    expect(pluralizeZnalezionoOsoby(1)).toBe("1 osobę");
    expect(pluralizeZnalezionoOsoby(2)).toBe("2 osoby");
    expect(pluralizeZnalezionoOsoby(5)).toBe("5 osób");
    expect(pluralizeZnalezionoOsoby(22)).toBe("22 osoby");
  });

  it("odmienia oczekujące sprawy", () => {
    expect(pluralizeOczekujace(1)).toBe("1 oczekująca");
    expect(pluralizeOczekujace(2)).toBe("2 oczekujące");
    expect(pluralizeOczekujace(5)).toBe("5 oczekujących");
  });
});
