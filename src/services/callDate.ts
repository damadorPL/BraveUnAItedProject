/** Dzisiejsza data w formacie YYYY-MM-DD (dla input[type=date]). */
export const todayDateInputValue = (): string => new Date().toISOString().slice(0, 10);

/**
 * Zamienia wartość z input[type=date] na ISO string porady.
 * Dla daty dzisiejszej (lub pustej) zachowuje bieżącą godzinę,
 * dla wstecznej ustawia południe, żeby uniknąć przesunięć stref czasowych.
 */
export const callDateToIso = (dateInputValue: string): string => {
  if (!dateInputValue || dateInputValue === todayDateInputValue()) {
    return new Date().toISOString();
  }
  return new Date(dateInputValue + "T12:00:00").toISOString();
};
