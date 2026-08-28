/**
 * Uniwersalna polska odmiana rzeczowników i przymiotników przez liczby
 * 
 * Zasada:
 * - 1: forma pojedyncza (np. "1 porada", "1 wpis", "1 załącznik", "1 oczekująca")
 * - 2, 3, 4 (oraz liczby z końcówką 2, 3, 4 z wyjątkiem 12, 13, 14): forma nieliczna (np. "2 porady", "23 porady")
 * - 0, 5..21 (oraz liczby z końcówkami 0, 1 poza 1, 5..9, 12..14): forma mnoga / dopełniacz (np. "0 porad", "5 porad", "12 porad", "21 porad")
 */

export function pluralize(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count);
  if (abs === 1) return one;
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return few;
  }
  return many;
}

/**
 * 1 porada, 2 porady, 5 porad, 6 porad, 22 porady, 25 porad, 112 porad
 */
export function pluralizePorady(count: number, withNumber = true): string {
  const label = pluralize(count, "porada", "porady", "porad");
  return withNumber ? `${count} ${label}` : label;
}

/**
 * 1 porada w historii, 2 porady w historii, 5 porad w historii, 6 porad w historii
 */
export function pluralizePoradyWHistorii(count: number): string {
  const label = pluralize(count, "porada w historii", "porady w historii", "porad w historii");
  return `${count} ${label}`;
}

/**
 * 1 wpis, 2 wpisy, 5 wpisów
 */
export function pluralizeWpisy(count: number, withNumber = true): string {
  const label = pluralize(count, "wpis", "wpisy", "wpisów");
  return withNumber ? `${count} ${label}` : label;
}

/**
 * 1 kontakt, 2 kontakty, 5 kontaktów
 */
export function pluralizeKontakty(count: number, withNumber = true): string {
  const label = pluralize(count, "kontakt", "kontakty", "kontaktów");
  return withNumber ? `${count} ${label}` : label;
}

/**
 * 1 osoba, 2 osoby, 5 osób
 */
export function pluralizeOsoby(count: number, withNumber = true): string {
  const label = pluralize(count, "osoba", "osoby", "osób");
  return withNumber ? `${count} ${label}` : label;
}

/**
 * Znaleziono: 1 osobę, 2 osoby, 5 osób, 21 osób, 22 osoby
 */
export function pluralizeZnalezionoOsoby(count: number): string {
  const label = pluralize(count, "osobę", "osoby", "osób");
  return `${count} ${label}`;
}

/**
 * 1 załącznik, 2 załączniki, 5 załączników
 */
export function pluralizeZalaczniki(count: number, withNumber = true): string {
  const label = pluralize(count, "załącznik", "załączniki", "załączników");
  return withNumber ? `${count} ${label}` : label;
}

/**
 * 1 sprawa, 2 sprawy, 5 spraw
 */
export function pluralizeSprawy(count: number, withNumber = true): string {
  const label = pluralize(count, "sprawa", "sprawy", "spraw");
  return withNumber ? `${count} ${label}` : label;
}

/**
 * 1 oczekująca, 2 oczekujące, 5 oczekujących
 */
export function pluralizeOczekujace(count: number, withNumber = true): string {
  const label = pluralize(count, "oczekująca", "oczekujące", "oczekujących");
  return withNumber ? `${count} ${label}` : label;
}
