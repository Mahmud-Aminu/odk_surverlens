// utils/csvExport.ts
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { AFPCase, FacilityVisit, WeeklySummary } from "../types";

const toCSV = <T extends Record<string, unknown>>(
  rows: T[],
  headers: string[]
) => {
  const head = headers.join(",") + "\n";
  const body = rows
    .map((r) =>
      headers
        .map((h) => {
          const v = (r as any)[h] ?? "";
          // escape commas/newlines
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(",")
    )
    .join("\n");
  return head + body;
};

export const exportCasesCSV = async (cases: AFPCase[]): Promise<void> => {
  const headers = [
    "id",
    "patientName",
    "age",
    "gender",
    "address",
    "caseSource",
    "wardDetected",
    "specimenCollected",
    "specimenDate",
    "remarks",
    "facilityName",
    "state",
    "lga",
    "weekNumber",
    "createdAt",
    "updatedAt",
    "finalized",
  ];
  const csv = toCSV<AFPCase>(cases, headers);
  const path = `${FileSystem.cacheDirectory}afp_cases_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv);
  await Sharing.shareAsync(path);
};

export const exportVisitsCSV = async (
  visits: FacilityVisit[]
): Promise<void> => {
  const headers = [
    "id",
    "facilityName",
    "state",
    "lga",
    "month",
    "weekNumber",
    "unitsVisited",
    "visitDate",
    "healthWorkerSignature",
    "casesFound",
    "createdAt",
    "finalized",
  ];
  const rows = visits.map((v) => ({
    ...v,
    unitsVisited: (v.unitsVisited || []).join(";"),
  }));
  const csv = toCSV<(typeof rows)[number]>(rows, headers);
  const path = `${FileSystem.cacheDirectory}afp_visits_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv);
  await Sharing.shareAsync(path);
};

export const exportSummariesCSV = async (
  summaries: WeeklySummary[]
): Promise<void> => {
  const headers = [
    "id",
    "facilityName",
    "state",
    "lga",
    "weekNumber",
    "periodStart",
    "periodEnd",
    "totalCases",
    "officerName",
    "officerSignature",
    "dateSent",
    "createdAt",
  ];
  const csv = toCSV<WeeklySummary>(summaries, headers);
  const path = `${FileSystem.cacheDirectory}afp_summaries_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv);
  await Sharing.shareAsync(path);
};
