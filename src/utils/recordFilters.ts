import { Caller, CallRecord, FilterState } from "../types";

export function buildCallersMap(callers: Caller[]): Map<string, Caller> {
  const map = new Map<string, Caller>();
  callers.forEach((c) => map.set(c.id, c));
  return map;
}

// Jedno źródło prawdy dla filtrowania rejestru porad — używane przez tabelę
// rejestru oraz eksport, żeby wyeksportowany zbiór zawsze odpowiadał temu,
// co użytkownik widzi na ekranie.
export function filterCallRecords(
  records: CallRecord[],
  callersMap: Map<string, Caller>,
  filterState: FilterState
): CallRecord[] {
  return records.filter((rec) => {
    const caller = callersMap.get(rec.callerId);

    if (filterState.voivodeship && caller && caller.voivodeship !== filterState.voivodeship) {
      return false;
    }

    if (filterState.guidanceType && rec.guidanceType !== filterState.guidanceType) {
      return false;
    }

    if (
      filterState.beneficiaryType &&
      caller &&
      !caller.beneficiaryTypes?.includes(filterState.beneficiaryType as Caller["beneficiaryTypes"][number])
    ) {
      return false;
    }

    if (filterState.specialistId && rec.specialistId !== filterState.specialistId) {
      return false;
    }

    if (filterState.guidanceArea && !rec.guidanceAreas?.includes(filterState.guidanceArea)) {
      return false;
    }

    if (filterState.dateFrom && rec.callDate) {
      if (new Date(rec.callDate).getTime() < new Date(filterState.dateFrom).getTime()) {
        return false;
      }
    }

    if (filterState.dateTo && rec.callDate) {
      // dateTo traktujemy włącznie — do końca wskazanego dnia
      const to = new Date(filterState.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(rec.callDate).getTime() > to.getTime()) {
        return false;
      }
    }

    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const matchDesc = (rec.adviceDescription || "").toLowerCase().includes(q);
      const matchNotes = (rec.notes || "").toLowerCase().includes(q);
      const matchRef = (rec.referredTo || "").toLowerCase().includes(q);
      const matchCaller = caller
        ? (caller.firstName + " " + caller.lastName).toLowerCase().includes(q)
        : false;
      if (!matchDesc && !matchNotes && !matchRef && !matchCaller) {
        return false;
      }
    }

    return true;
  });
}
