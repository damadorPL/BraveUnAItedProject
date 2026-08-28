import { normalizeText } from "./storage";

export type MatchConfidence = "exact" | "auto" | "uncertain" | "none";

export interface DictionaryMatch {
  value: string;
  confidence: MatchConfidence;
}

/**
 * Ordered keyword hints: first entry whose keyword occurs in the normalized
 * input wins, so more specific values must come before more generic ones
 * (e.g. "psycholog..." before "społeczne").
 */
export type KeywordHints = Array<[value: string, keywords: string[]]>;

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

function autoThreshold(len: number): number {
  if (len <= 5) return 1;
  if (len <= 12) return 2;
  return 3;
}

function uncertainThreshold(len: number): number {
  return Math.max(autoThreshold(len) + 1, Math.ceil(len * 0.34));
}

/**
 * Matches free-text input against a controlled vocabulary.
 * Pipeline: exact (after diacritic/whitespace normalization) → keyword hint →
 * containment → Levenshtein distance with length-relative thresholds.
 * Ambiguous ties are downgraded to "uncertain" so they land in manual review.
 */
export function matchDictionary(
  raw: string,
  dictionary: readonly string[],
  keywords?: KeywordHints
): DictionaryMatch {
  const norm = normalizeText(raw);
  if (!norm) return { value: "", confidence: "none" };

  for (const entry of dictionary) {
    if (normalizeText(entry) === norm) return { value: entry, confidence: "exact" };
  }

  if (keywords) {
    for (const [value, hints] of keywords) {
      if (hints.some((k) => norm.includes(normalizeText(k)))) {
        return { value, confidence: "auto" };
      }
    }
  }

  // Input containing the full dictionary value (longest match first to avoid substring conflicts like "opolskie" in "wielkopolskie")
  const sortedByLen = [...dictionary].sort(
    (a, b) => normalizeText(b).length - normalizeText(a).length
  );
  for (const entry of sortedByLen) {
    const entryNorm = normalizeText(entry);
    if (entryNorm.length >= 5 && norm.includes(entryNorm)) {
      return { value: entry, confidence: "auto" };
    }
  }

  let best: string | null = null;
  let bestDist = Infinity;
  let secondDist = Infinity;
  for (const entry of dictionary) {
    const dist = levenshtein(norm, normalizeText(entry));
    if (dist < bestDist) {
      secondDist = bestDist;
      bestDist = dist;
      best = entry;
    } else if (dist < secondDist) {
      secondDist = dist;
    }
  }

  if (best === null) return { value: "", confidence: "none" };

  const refLen = normalizeText(best).length;
  if (bestDist <= autoThreshold(refLen)) {
    // Two dictionary values equally close — let a human decide
    if (bestDist === secondDist) return { value: best, confidence: "uncertain" };
    return { value: best, confidence: "auto" };
  }
  if (bestDist <= uncertainThreshold(refLen)) {
    return { value: best, confidence: "uncertain" };
  }
  return { value: best, confidence: "none" };
}
