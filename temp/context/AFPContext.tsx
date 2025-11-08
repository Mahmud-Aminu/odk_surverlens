// context/AFPContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AFPCase, FacilityVisit, WeeklySummary } from "../types";
import { loadData, saveData } from "../utils/storage";
import { mockCases, mockVisits } from "../utils/mockData";
import { formatISO, addDays } from "date-fns";

interface AFPContextType {
  cases: AFPCase[];
  visits: FacilityVisit[];
  summaries: WeeklySummary[];
  loading: boolean;
  addCase: (c: AFPCase) => Promise<void>;
  updateCase: (id: string, c: Partial<AFPCase>) => Promise<void>;
  finalizeCase: (id: string) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  addVisit: (v: FacilityVisit) => Promise<void>;
  updateVisit: (id: string, v: Partial<FacilityVisit>) => Promise<void>;
  finalizeVisit: (id: string) => Promise<void>;
  generateWeeklySummary: (
    weekNumber: number,
    facilityName: string
  ) => Promise<void>;
  seedDataIfNeeded: () => Promise<void>;
}

const AFPContext = createContext<AFPContextType | null>(null);

export const useAFP = () => {
  const c = useContext(AFPContext);
  if (!c) throw new Error("useAFP must be used within AFPProvider");
  return c;
};

export const AFPProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cases, setCases] = useState<AFPCase[]>([]);
  const [visits, setVisits] = useState<FacilityVisit[]>([]);
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await seedDataIfNeeded();
      setLoading(false);
    })();
  }, []);

  const seedDataIfNeeded = async () => {
    const savedCases = await loadData("afpCases");
    const savedVisits = await loadData("facilityVisits");
    const savedSummaries = await loadData("weeklySummaries");

    if (!savedCases) {
      await saveData("afpCases", mockCases);
      setCases(mockCases);
    } else {
      setCases(savedCases);
    }

    if (!savedVisits) {
      await saveData("facilityVisits", mockVisits);
      setVisits(mockVisits);
    } else {
      setVisits(savedVisits);
    }

    if (savedSummaries) setSummaries(savedSummaries);
  };

  const persistCases = async (next: AFPCase[]) => {
    setCases(next);
    await saveData("afpCases", next);
  };

  const persistVisits = async (next: FacilityVisit[]) => {
    setVisits(next);
    await saveData("facilityVisits", next);
  };

  const persistSummaries = async (next: WeeklySummary[]) => {
    setSummaries(next);
    await saveData("weeklySummaries", next);
  };

  const addCase = async (c: AFPCase) => {
    await persistCases([...cases, c]);
  };

  const updateCase = async (id: string, updates: Partial<AFPCase>) => {
    const next = cases.map((x) =>
      x.id === id
        ? { ...x, ...updates, updatedAt: new Date().toISOString() }
        : x
    );
    await persistCases(next);
  };

  const finalizeCase = async (id: string) => {
    const next = cases.map((x) =>
      x.id === id
        ? { ...x, finalized: true, updatedAt: new Date().toISOString() }
        : x
    );
    await persistCases(next);
    const c = next.find((x) => x.id === id);
    if (c) await generateWeeklySummary(c.weekNumber, c.facilityName);
  };

  const deleteCase = async (id: string) => {
    const next = cases.filter((x) => x.id !== id);
    await persistCases(next);
  };

  const addVisit = async (v: FacilityVisit) => {
    await persistVisits([...visits, v]);
  };

  const updateVisit = async (id: string, updates: Partial<FacilityVisit>) => {
    const next = visits.map((x) =>
      x.id === id
        ? { ...x, ...updates, finalized: updates.finalized ?? x.finalized }
        : x
    );
    await persistVisits(next);
  };

  const finalizeVisit = async (id: string) => {
    const next = visits.map((x) =>
      x.id === id ? { ...x, finalized: true } : x
    );
    await persistVisits(next);
  };

  const generateWeeklySummary = async (
    weekNumber: number,
    facilityName: string
  ) => {
    // compute weeklyCases from finalized cases
    const weeklyCases = cases.filter(
      (c) =>
        c.weekNumber === weekNumber &&
        c.facilityName === facilityName &&
        c.finalized
    );

    const existing = summaries.find(
      (s) => s.weekNumber === weekNumber && s.facilityName === facilityName
    );

    const start = new Date(2025, 9, 1 + (weekNumber - 40) * 7); // Oct 1 + offset — safe enough for seeded 2025 data
    const end = addDays(start, 6);

    if (existing) {
      const next = summaries.map((s) =>
        s.id === existing.id
          ? {
              ...s,
              totalCases: weeklyCases.length,
              createdAt: new Date().toISOString(),
            }
          : s
      );
      await persistSummaries(next);
    } else {
      const newSummary: WeeklySummary = {
        id: `summary-${Date.now()}`,
        facilityName,
        state: weeklyCases[0]?.state || "Lagos",
        lga: weeklyCases[0]?.lga || "Ikeja",
        weekNumber,
        periodStart: start.toISOString().split("T")[0],
        periodEnd: end.toISOString().split("T")[0],
        totalCases: weeklyCases.length,
        officerName: "Surveillance Officer",
        officerSignature: "Digital Signature",
        dateSent: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };
      await persistSummaries([...summaries, newSummary]);
    }
  };

  return (
    <AFPContext.Provider
      value={{
        cases,
        visits,
        summaries,
        loading,
        addCase,
        updateCase,
        finalizeCase,
        deleteCase,
        addVisit,
        updateVisit,
        finalizeVisit,
        generateWeeklySummary,
        seedDataIfNeeded,
      }}
    >
      {children}
    </AFPContext.Provider>
  );
};
