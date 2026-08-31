import { Caller, CallRecord, GUIDANCE_TYPES, GuidanceType, VOIVODESHIPS } from "../types";

// Reporting labels for guidance types — shared between statistics view (StatsBar)
// and report export, so that grantor files use identical naming seen in the app.
export const GUIDANCE_TYPE_LABELS: Record<GuidanceType, string> = {
  "prawno-obywatelskie": "Prawno-obywatelskie (WZON, szkoła, ZUS, prawo)",
  "w zakresie psychologii i rehabilitacji społecznej":
    "W zakresie psychologii i rehabilitacji społecznej",
  "Parent to Parent": "Parent to Parent (doradztwo rodzicielskie)",
  "społeczne": "Społeczne (diagnostyka, wsparcie terapeutyczne)",
  "inne": "Inne",
};

export interface GuidanceStatsRow {
  type: GuidanceType;
  label: string;
  count: number;
  percent: number;
}

export interface VoivodeshipStatsRow {
  name: string;
  count: number;
  percent: number;
}

export interface ReportStats {
  totalRecords: number;
  // Sum of actually recorded minutes only — no manufactured time.
  totalMinutes: number;
  uniqueBeneficiaries: number;
  certifiedBeneficiaries: number;
  certifiedPercent: number;
  guidanceRows: GuidanceStatsRow[];
  voivodeshipRows: VoivodeshipStatsRow[];
}

// Single source of truth for computing reporting statistics — StatsBar and
// report export must produce identical values for the same dataset.
export function computeReportStats(
  records: CallRecord[],
  callersMap: Map<string, Caller>
): ReportStats {
  const totalMinutes = records.reduce(
    (acc, r) =>
      acc + (typeof r.durationMinutes === "number" && r.durationMinutes > 0 ? r.durationMinutes : 0),
    0
  );

  const beneficiaryIds = new Set(records.map((r) => r.callerId));
  const beneficiaries = [...beneficiaryIds]
    .map((id) => callersMap.get(id))
    .filter((c): c is Caller => Boolean(c));
  const certifiedBeneficiaries = beneficiaries.filter(
    (c) => c.hasDisabilityCertificate === "tak"
  ).length;

  const guidanceCounts = new Map<GuidanceType, number>();
  records.forEach((r) => {
    guidanceCounts.set(r.guidanceType, (guidanceCounts.get(r.guidanceType) || 0) + 1);
  });
  const guidanceRows = GUIDANCE_TYPES.map((type) => {
    const count = guidanceCounts.get(type) || 0;
    return {
      type,
      label: GUIDANCE_TYPE_LABELS[type],
      count,
      percent: records.length > 0 ? Math.round((count / records.length) * 100) : 0,
    };
  });

  // Number of consultations (not callers) per voivodeship — full list of 16 for
  // PFRON reports, "none" only when there are consultations without assigned voivodeship.
  const voivodeshipCounts = new Map<string, number>();
  records.forEach((r) => {
    const voivodeship = callersMap.get(r.callerId)?.voivodeship || "brak";
    voivodeshipCounts.set(voivodeship, (voivodeshipCounts.get(voivodeship) || 0) + 1);
  });
  const voivodeshipRows = VOIVODESHIPS.filter(
    (v) => v !== "brak" || (voivodeshipCounts.get("brak") || 0) > 0
  ).map((v) => {
    const count = voivodeshipCounts.get(v) || 0;
    return {
      name: v,
      count,
      percent: records.length > 0 ? Math.round((count / records.length) * 100) : 0,
    };
  });

  return {
    totalRecords: records.length,
    totalMinutes,
    uniqueBeneficiaries: beneficiaryIds.size,
    certifiedBeneficiaries,
    certifiedPercent:
      beneficiaries.length > 0
        ? Math.round((certifiedBeneficiaries / beneficiaries.length) * 100)
        : 0,
    guidanceRows,
    voivodeshipRows,
  };
}
