import { describe, it, expect } from "vitest";
import { matchDictionary, levenshtein } from "./fuzzyMatch";
import { normalizeText } from "./storage";
import { VOIVODESHIPS, GUIDANCE_TYPES } from "../types";

describe("Fuzzy Match and Text Normalization", () => {
  describe("normalizeText", () => {
    it("should strip Polish diacritics and convert to lowercase", () => {
      expect(normalizeText("Kraków")).toBe("krakow");
      expect(normalizeText("Łódź")).toBe("lodz");
      expect(normalizeText("Żółć Źdźbło Gęślą Jaźń")).toBe("zolczdzblogeslajazn");
      expect(normalizeText("Świętokrzyskie")).toBe("swietokrzyskie");
    });

    it("should remove spaces, hyphens, and parentheses", () => {
      expect(normalizeText(" (022) 123-456 ")).toBe("022123456");
      expect(normalizeText("Kujawsko-Pomorskie")).toBe("kujawskopomorskie");
    });

    it("should handle empty strings and falsy values", () => {
      expect(normalizeText("")).toBe("");
      expect(normalizeText("   ")).toBe("");
    });
  });

  describe("levenshtein distance", () => {
    it("should calculate exact distance between strings", () => {
      expect(levenshtein("warszawa", "warszawa")).toBe(0);
      expect(levenshtein("", "abc")).toBe(3);
      expect(levenshtein("abc", "")).toBe(3);
      expect(levenshtein("kot", "pies")).toBe(4);
      expect(levenshtein("mazowieckie", "mazoweckie")).toBe(1); // 1 deletion/substitution
    });
  });

  describe("matchDictionary", () => {
    it("should return exact match with exact confidence", () => {
      const match = matchDictionary("Mazowieckie", VOIVODESHIPS);
      expect(match.value).toBe("mazowieckie");
      expect(match.confidence).toBe("exact");
    });

    it("should auto-match slightly misspelled voivodeships", () => {
      const match = matchDictionary("mazoweckie", VOIVODESHIPS);
      expect(match.value).toBe("mazowieckie");
      expect(match.confidence).toBe("auto");
    });

    it("should auto-match containment phrases", () => {
      const match = matchDictionary("województwo wielkopolskie", VOIVODESHIPS);
      expect(match.value).toBe("wielkopolskie");
      expect(match.confidence).toBe("auto");
    });

    it("should match guidance types via keyword hints", () => {
      const keywordHints: Array<[string, string[]]> = [
        [
          "w zakresie psychologii i rehabilitacji społecznej",
          ["psychol", "psychiat", "terapi", "emocj", "diagnoz", "rehabilitac"],
        ],
        [
          "prawno-obywatelskie",
          ["praw", "radc", "orzeczen", "odwolan", "wzon", "pfron", "prawnik"],
        ],
      ];

      const matchPsych = matchDictionary("konsultacja psychologiczna dziecka", GUIDANCE_TYPES, keywordHints);
      expect(matchPsych.value).toBe("w zakresie psychologii i rehabilitacji społecznej");
      expect(matchPsych.confidence).toBe("auto");

      const matchLaw = matchDictionary("pomoc prawna w odwołaniu WZON", GUIDANCE_TYPES, keywordHints);
      expect(matchLaw.value).toBe("prawno-obywatelskie");
      expect(matchLaw.confidence).toBe("auto");
    });

    it("should return none confidence for completely unrelated text", () => {
      const match = matchDictionary("qwertyuiop xyz 123", VOIVODESHIPS);
      expect(match.confidence).toBe("none");
    });
  });
});
