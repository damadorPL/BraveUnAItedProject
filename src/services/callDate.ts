/** Today's date in YYYY-MM-DD format (for input[type=date]). */
export const todayDateInputValue = (): string => new Date().toISOString().slice(0, 10);

/**
 * Converts a value from input[type=date] into an ISO date string.
 * For today's date (or empty), preserves the current time,
 * for past dates sets noon to avoid timezone shifts.
 */
export const callDateToIso = (dateInputValue: string): string => {
  if (!dateInputValue || dateInputValue === todayDateInputValue()) {
    return new Date().toISOString();
  }
  return new Date(dateInputValue + "T12:00:00").toISOString();
};
