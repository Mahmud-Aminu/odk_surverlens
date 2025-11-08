// types.ts
export interface AFPCase {
  id: string;
  patientName: string;
  age: number;
  gender: "Male" | "Female";
  address: string;
  caseSource: "Ward" | "Incoming Patient";
  wardDetected?: string | null;
  specimenCollected: boolean;
  specimenDate?: string | null;
  remarks?: string;
  facilityName: string;
  state: string;
  lga: string;
  weekNumber: number;
  createdAt: string;
  updatedAt: string;
  finalized: boolean;
}

export interface FacilityVisit {
  id: string;
  facilityName: string;
  state: string;
  lga: string;
  month: string;
  weekNumber: number;
  unitsVisited: string[];
  visitDate: string;
  healthWorkerSignature: string;
  casesFound: number;
  createdAt: string;
  finalized: boolean;
}

export interface WeeklySummary {
  id: string;
  facilityName: string;
  state: string;
  lga: string;
  weekNumber: number;
  periodStart: string;
  periodEnd: string;
  totalCases: number;
  officerName: string;
  officerSignature: string;
  dateSent: string;
  createdAt: string;
}
