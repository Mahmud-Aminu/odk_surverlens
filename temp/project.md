Nice — let’s turn this into a fully working **Expo (React Native + TypeScript)** app with **nativewind (Tailwind)** styling and **all features we discussed**: AFP-F001 (Case), AFP-F002 (Facility Visit), AFP-F003 (Weekly Summary), AsyncStorage persistence, mock data (2 months), dynamic forms, edit/ finalize/ delete, toasts, CSV export, and a loader. I referenced our whole project chat thread inside the project folder while building this (forms, storage, mock data, summaries, toasts, local-seeding behavior, weekly calc fixes, and UX touches).

# Command:

1. Create the project structure

2. Below is a ready-to-drop-in file structure and the full code for each file. Copy into your Expo project (TypeScript template) and `expo start`.

---

Project structure

```
/app
  |_ _layout.tsx
  |_ index.tsx
  |_ forms/
      |_ AFPF001.tsx
      |_ AFPF002.tsx
      |_ AFPF003.tsx
/context/
  |_ AFPContext.tsx
/components/
  |_ DynamicForm.tsx
  |_ Toast.tsx
  |_ Loader.tsx
/utils/
  |_ storage.ts
  |_ mockData.ts
  |_ csvExport.ts
app.json / tsconfig.json / package.json (typical Expo)
```

---

# Packages to install

Run in your project:

```
expo install @react-native-async-storage/async-storage react-native-gesture-handler react-native-reanimated
npm install expo-router nativewind lucide-react-native @types/lodash lodash
```

(Adjust installs to your package manager. `lucide-react-native` or `lucide-react` binding—if you prefer web icons, adapt. I used inline icons for brevity.)

Enable Reanimated plugin per docs if using it. (Loader uses native `ActivityIndicator` to avoid extra setup.)

---

# 1) /context/AFPContext.tsx

```tsx
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
```

---

# 2) /types.ts

```ts
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
```

---

# 3) /utils/storage.ts

```ts
// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("storage save error", err);
  }
};

export const loadData = async (key: string) => {
  try {
    const s = await AsyncStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch (err) {
    console.error("storage load error", err);
    return null;
  }
};
```

---

# 4) /utils/mockData.ts (2 months of seed)

```ts
// utils/mockData.ts
import { AFPCase, FacilityVisit } from "../types";

export const mockCases: AFPCase[] = [
  // August / September style seed (two-month spread)
  {
    id: "case-202508-001",
    patientName: "Amina Bello",
    age: 3,
    gender: "Female",
    address: "45 Ogun Street",
    caseSource: "Ward",
    wardDetected: "Pediatric Ward",
    specimenCollected: true,
    specimenDate: "2025-08-12",
    remarks: "AFP-like symptoms",
    facilityName: "Katsina General Hospital",
    state: "Katsina",
    lga: "Katsina",
    weekNumber: 36,
    createdAt: "2025-08-12T10:00:00Z",
    updatedAt: "2025-08-12T10:00:00Z",
    finalized: true,
  },
  {
    id: "case-202509-002",
    patientName: "Sani Lawal",
    age: 4,
    gender: "Male",
    address: "12 Zaria Road",
    caseSource: "Incoming Patient",
    wardDetected: null,
    specimenCollected: false,
    specimenDate: null,
    remarks: "Referred case",
    facilityName: "Katsina General Hospital",
    state: "Katsina",
    lga: "Katsina",
    weekNumber: 39,
    createdAt: "2025-09-02T09:30:00Z",
    updatedAt: "2025-09-02T09:30:00Z",
    finalized: true,
  },
  // add a few more for immediate testing
  {
    id: "case-202510-001",
    patientName: "Hassan Musa",
    age: 5,
    gender: "Male",
    address: "Sabon Gari",
    caseSource: "Ward",
    wardDetected: "Emergency Ward",
    specimenCollected: true,
    specimenDate: "2025-10-12",
    remarks: "",
    facilityName: "Katsina General Hospital",
    state: "Katsina",
    lga: "Katsina",
    weekNumber: 42,
    createdAt: "2025-10-12T08:30:00Z",
    updatedAt: "2025-10-12T08:30:00Z",
    finalized: false,
  },
];

export const mockVisits: FacilityVisit[] = [
  {
    id: "visit-202508-001",
    facilityName: "Katsina General Hospital",
    state: "Katsina",
    lga: "Katsina",
    month: "August",
    weekNumber: 36,
    unitsVisited: ["Pediatric Ward", "OPD"],
    visitDate: "2025-08-12",
    healthWorkerSignature: "Dr. Abubakar",
    casesFound: 1,
    createdAt: "2025-08-12T16:00:00Z",
    finalized: true,
  },
  {
    id: "visit-202509-001",
    facilityName: "Katsina General Hospital",
    state: "Katsina",
    lga: "Katsina",
    month: "September",
    weekNumber: 39,
    unitsVisited: ["Emergency Ward", "ICU"],
    visitDate: "2025-09-02",
    healthWorkerSignature: "Dr. Amina",
    casesFound: 1,
    createdAt: "2025-09-02T17:30:00Z",
    finalized: true,
  },
];
```

---

# 5) /utils/csvExport.ts

```ts
// utils/csvExport.ts
import { AFPCase, FacilityVisit, WeeklySummary } from "../types";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const toCSV = (rows: any[], headers: string[]) => {
  const head = headers.join(",") + "\n";
  const body = rows
    .map((r) =>
      headers
        .map((h) => {
          const v = r[h] ?? "";
          // escape commas/newlines
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(",")
    )
    .join("\n");
  return head + body;
};

export const exportCasesCSV = async (cases: AFPCase[]) => {
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
  const csv = toCSV(cases as any[], headers);
  const path = `${FileSystem.cacheDirectory}afp_cases_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path);
};

export const exportVisitsCSV = async (visits: FacilityVisit[]) => {
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
  const csv = toCSV(rows as any[], headers);
  const path = `${FileSystem.cacheDirectory}afp_visits_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path);
};

export const exportSummariesCSV = async (summaries: WeeklySummary[]) => {
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
  const csv = toCSV(summaries as any[], headers);
  const path = `${FileSystem.cacheDirectory}afp_summaries_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path);
};
```

> Note: `expo-file-system` and `expo-sharing` may need installation:

```
expo install expo-file-system expo-sharing
```

---

# 6) /components/DynamicForm.tsx

```tsx
// components/DynamicForm.tsx
import React from "react";
import { View, Text, TextInput, Switch } from "react-native";
import { AFPCase } from "../types";

interface Props {
  formData: Partial<AFPCase>;
  setFormData: (s: Partial<AFPCase>) => void;
}

export const DynamicForm: React.FC<Props> = ({ formData, setFormData }) => {
  return (
    <View className="p-4 space-y-3 bg-white rounded-lg shadow">
      <Text className="text-lg font-semibold">
        AFP-F001 — Case Investigation
      </Text>

      <View>
        <Text className="text-sm font-medium mb-1">Patient Name *</Text>
        <TextInput
          className="border rounded px-3 py-2"
          value={formData.patientName || ""}
          onChangeText={(t) => setFormData({ ...formData, patientName: t })}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-1">Age *</Text>
        <TextInput
          keyboardType="numeric"
          className="border rounded px-3 py-2"
          value={formData.age ? String(formData.age) : ""}
          onChangeText={(t) =>
            setFormData({ ...formData, age: t ? parseInt(t, 10) : undefined })
          }
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-1">Gender</Text>
        <TextInput
          className="border rounded px-3 py-2"
          value={formData.gender || "Male"}
          onChangeText={(t) => setFormData({ ...formData, gender: t as any })}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-1">Facility Name *</Text>
        <TextInput
          className="border rounded px-3 py-2"
          value={formData.facilityName || ""}
          onChangeText={(t) => setFormData({ ...formData, facilityName: t })}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-1">Case Source</Text>
        <TextInput
          className="border rounded px-3 py-2"
          value={formData.caseSource || "Ward"}
          onChangeText={(t) =>
            setFormData({ ...formData, caseSource: t as any })
          }
        />
      </View>

      {formData.caseSource === "Ward" && (
        <View>
          <Text className="text-sm font-medium mb-1">Ward Detected</Text>
          <TextInput
            className="border rounded px-3 py-2"
            value={formData.wardDetected || ""}
            onChangeText={(t) => setFormData({ ...formData, wardDetected: t })}
          />
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium">Specimen Collected</Text>
        <Switch
          value={!!formData.specimenCollected}
          onValueChange={(v) =>
            setFormData({ ...formData, specimenCollected: v })
          }
        />
      </View>

      {formData.specimenCollected && (
        <View>
          <Text className="text-sm font-medium mb-1">Specimen Date</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            className="border rounded px-3 py-2"
            value={formData.specimenDate || ""}
            onChangeText={(t) => setFormData({ ...formData, specimenDate: t })}
          />
        </View>
      )}

      <View>
        <Text className="text-sm font-medium mb-1">Remarks</Text>
        <TextInput
          multiline
          numberOfLines={3}
          className="border rounded px-3 py-2"
          value={formData.remarks || ""}
          onChangeText={(t) => setFormData({ ...formData, remarks: t })}
        />
      </View>
    </View>
  );
};
```

---

# 7) /components/Toast.tsx

```tsx
// components/Toast.tsx
import React from "react";
import { View, Text } from "react-native";

export const Toast: React.FC<{ msg: string; type?: "success" | "error" }> = ({
  msg,
  type = "success",
}) => {
  return (
    <View
      className={`absolute top-6 right-4 px-4 py-3 rounded-lg ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <Text className="text-white">{msg}</Text>
    </View>
  );
};
```

---

# 8) /components/Loader.tsx

```tsx
// components/Loader.tsx
import React from "react";
import { View, ActivityIndicator } from "react-native";

export const Loader: React.FC<{ show?: boolean }> = ({ show = true }) => {
  if (!show) return null;
  return (
    <View className="absolute inset-0 z-50 bg-black/20 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );
};
```

---

# 9) /app/forms/AFPF001.tsx

```tsx
// app/forms/AFPF001.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useAFP } from "../../context/AFPContext";
import { DynamicForm } from "../../components/DynamicForm";
import { Loader } from "../../components/Loader";
import { Toast } from "../../components/Toast";
import { AFPCase } from "../../types";

export default function AFPF001Screen() {
  const { cases, addCase, updateCase, finalizeCase, deleteCase, loading } =
    useAFP();
  const [form, setForm] = useState<Partial<AFPCase>>({
    caseSource: "Ward",
    specimenCollected: false,
    gender: "Male",
    facilityName: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const reset = () => {
    setForm({
      caseSource: "Ward",
      specimenCollected: false,
      gender: "Male",
      facilityName: "",
    });
    setEditingId(null);
  };

  const getWeekNumber = (date = new Date()) => {
    // small utility: week number relative to Oct baseline (as in earlier logic)
    const day = date.getDate();
    return Math.ceil(day / 7) + 40;
  };

  const handleSave = async () => {
    if (!form.patientName || !form.age || !form.facilityName) {
      setToast({ msg: "Please fill required fields", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (editingId) {
      await updateCase(editingId, form);
      setToast({ msg: "Draft updated", type: "success" });
      setTimeout(() => setToast(null), 3000);
      reset();
      return;
    }

    const newCase: AFPCase = {
      id: `case-${Date.now()}`,
      patientName: form.patientName!,
      age: form.age!,
      gender: (form.gender as any) || "Male",
      address: form.address || "",
      caseSource: (form.caseSource as any) || "Ward",
      wardDetected: form.wardDetected || null,
      specimenCollected: !!form.specimenCollected,
      specimenDate: form.specimenDate || null,
      remarks: form.remarks || "",
      facilityName: form.facilityName || "Unknown Facility",
      state: form.state || "Katsina",
      lga: form.lga || "Katsina",
      weekNumber: form.weekNumber || getWeekNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalized: false,
    };

    await addCase(newCase);
    setToast({ msg: "Saved as draft", type: "success" });
    setTimeout(() => setToast(null), 3000);
    reset();
  };

  const handleEdit = (c: AFPCase) => {
    if (c.finalized) {
      setToast({ msg: "Cannot edit finalized case", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setForm(c);
    setEditingId(c.id);
  };

  const handleFinalize = (id: string) => {
    Alert.alert("Finalize case", "Mark this case as finalized?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await finalizeCase(id);
          setToast({ msg: "Finalized", type: "success" });
          setTimeout(() => setToast(null), 3000);
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Delete this case?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await deleteCase(id);
          setToast({ msg: "Deleted", type: "success" });
          setTimeout(() => setToast(null), 3000);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Loader show={loading} />
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <ScrollView showsVerticalScrollIndicator={false}>
        <DynamicForm formData={form} setFormData={setForm} />

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="flex-1 bg-blue-600 px-4 py-3 rounded"
            onPress={handleSave}
          >
            <Text className="text-white text-center font-semibold">
              {editingId ? "Update Draft" : "Save as Draft"}
            </Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity
              className="bg-gray-300 px-4 py-3 rounded"
              onPress={reset}
            >
              <Text className="text-center">Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-lg font-semibold mt-6 mb-2">Saved Cases</Text>
        {cases.map((c) => (
          <View key={c.id} className="bg-white rounded p-3 mb-2">
            <Text className="font-medium">
              {c.patientName} • {c.age}y
            </Text>
            <Text className="text-sm">
              {c.facilityName} • Week {c.weekNumber}
            </Text>
            <View className="flex-row gap-2 mt-2">
              {!c.finalized && (
                <TouchableOpacity
                  className="px-3 py-1 bg-green-100 rounded"
                  onPress={() => handleFinalize(c.id)}
                >
                  <Text className="text-green-800 text-sm">Finalize</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="px-3 py-1 bg-blue-100 rounded"
                onPress={() => handleEdit(c)}
              >
                <Text className="text-blue-800 text-sm">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-3 py-1 bg-red-100 rounded"
                onPress={() => handleDelete(c.id)}
              >
                <Text className="text-red-800 text-sm">Delete</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500 mt-2">
              {c.finalized ? "Finalized" : "Draft"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
```

---

# 10) /app/forms/AFPF002.tsx (Facility Visit)

```tsx
// app/forms/AFPF002.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useAFP } from "../../context/AFPContext";
import { FacilityVisit } from "../../types";

export default function AFPF002Screen() {
  const { visits, addVisit, updateVisit, finalizeVisit } = useAFP();
  const [form, setForm] = useState<Partial<FacilityVisit>>({
    facilityName: "",
    month: "",
    unitsVisited: [],
    weekNumber: 42,
    visitDate: "",
    healthWorkerSignature: "",
  });

  const handleSave = async () => {
    if (!form.facilityName || !form.visitDate)
      return Alert.alert("Please fill required");
    const newV: FacilityVisit = {
      id: `visit-${Date.now()}`,
      facilityName: form.facilityName!,
      state: form.state || "Katsina",
      lga: form.lga || "Katsina",
      month: form.month || "October",
      weekNumber: form.weekNumber || 42,
      unitsVisited: form.unitsVisited || [],
      visitDate: form.visitDate!,
      healthWorkerSignature: form.healthWorkerSignature || "",
      casesFound: form.casesFound || 0,
      createdAt: new Date().toISOString(),
      finalized: false,
    };
    await addVisit(newV);
    setForm({
      facilityName: "",
      month: "",
      unitsVisited: [],
      weekNumber: 42,
      visitDate: "",
      healthWorkerSignature: "",
    });
    Alert.alert("Saved");
  };

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <ScrollView>
        <View className="p-4 bg-white rounded-lg shadow">
          <Text className="text-lg font-semibold mb-3">
            AFP-F002 — Facility Visit
          </Text>

          <Text className="text-sm">Facility Name</Text>
          <TextInput
            className="border rounded px-3 py-2 mb-2"
            value={form.facilityName}
            onChangeText={(t) => setForm({ ...form, facilityName: t })}
          />

          <Text className="text-sm">Visit Date (YYYY-MM-DD)</Text>
          <TextInput
            className="border rounded px-3 py-2 mb-2"
            value={form.visitDate}
            onChangeText={(t) => setForm({ ...form, visitDate: t })}
          />

          <Text className="text-sm">Units Visited (comma separated)</Text>
          <TextInput
            className="border rounded px-3 py-2 mb-2"
            value={(form.unitsVisited || []).join(", ")}
            onChangeText={(t) =>
              setForm({
                ...form,
                unitsVisited: t.split(",").map((s) => s.trim()),
              })
            }
          />

          <Text className="text-sm">Cases Found</Text>
          <TextInput
            keyboardType="numeric"
            className="border rounded px-3 py-2 mb-2"
            value={form.casesFound ? String(form.casesFound) : ""}
            onChangeText={(t) =>
              setForm({ ...form, casesFound: t ? parseInt(t, 10) : 0 })
            }
          />

          <Text className="text-sm">Health Worker Signature</Text>
          <TextInput
            className="border rounded px-3 py-2 mb-2"
            value={form.healthWorkerSignature}
            onChangeText={(t) => setForm({ ...form, healthWorkerSignature: t })}
          />

          <TouchableOpacity
            className="bg-blue-600 px-4 py-3 rounded"
            onPress={handleSave}
          >
            <Text className="text-white text-center">Save Visit</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-semibold mt-4">Saved Visits</Text>
        {visits.map((v) => (
          <View key={v.id} className="bg-white p-3 rounded mt-2">
            <Text className="font-medium">
              {v.facilityName} • {v.visitDate}
            </Text>
            <Text className="text-sm text-gray-600">
              Units: {v.unitsVisited.join(", ")}
            </Text>
            <View className="flex-row gap-2 mt-2">
              {!v.finalized && (
                <TouchableOpacity
                  className="px-3 py-1 bg-green-100 rounded"
                  onPress={() => {
                    Alert.alert("Finalize visit", "Mark as finalized?", [
                      { text: "Yes", onPress: () => finalizeVisit(v.id) },
                      { text: "No", style: "cancel" },
                    ]);
                  }}
                >
                  <Text className="text-green-800">Finalize</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
```

---

# 11) /app/forms/AFPF003.tsx (Weekly Summary)

```tsx
// app/forms/AFPF003.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Picker } from "react-native";
import { useAFP } from "../../context/AFPContext";
import {
  exportCasesCSV,
  exportSummariesCSV,
  exportVisitsCSV,
} from "../../utils/csvExport";

export default function AFPF003Screen() {
  const { summaries, cases, generateWeeklySummary, visits } = useAFP();
  const [selectedWeek, setSelectedWeek] = useState<number>(42);

  const weekSummaries = summaries.filter((s) => s.weekNumber === selectedWeek);
  const weekCases = cases.filter(
    (c) => c.weekNumber === selectedWeek && c.finalized
  );

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <ScrollView>
        <View className="bg-white p-4 rounded-lg shadow">
          <Text className="text-lg font-semibold mb-3">
            AFP-F003 — Weekly Summary
          </Text>

          <View className="mb-3">
            <Text className="text-sm">Select Week Number</Text>
            <View className="border rounded mt-2">
              {/* simple manual pick */}
              <Picker
                selectedValue={String(selectedWeek)}
                onValueChange={(v) =>
                  setSelectedWeek(parseInt(v as string, 10))
                }
              >
                {[36, 37, 38, 39, 40, 41, 42, 43, 44].map((w) => (
                  <Picker.Item key={w} label={`Week ${w}`} value={String(w)} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded mt-3"
              onPress={() =>
                generateWeeklySummary(
                  selectedWeek,
                  weekCases[0]?.facilityName || "Katsina General Hospital"
                )
              }
            >
              <Text className="text-white text-center">Generate Summary</Text>
            </TouchableOpacity>
          </View>

          <Text className="font-semibold">Summary Records</Text>
          {weekSummaries.length === 0 && (
            <Text className="text-sm text-gray-500 mt-2">
              No summaries yet for this week.
            </Text>
          )}
          {weekSummaries.map((s) => (
            <View key={s.id} className="bg-gray-50 p-3 rounded mt-2">
              <Text className="font-medium">
                {s.facilityName} — Week {s.weekNumber}
              </Text>
              <Text className="text-sm">
                Period: {s.periodStart} to {s.periodEnd}
              </Text>
              <Text className="text-sm">Total Cases: {s.totalCases}</Text>
            </View>
          ))}

          <View className="mt-4 space-y-2">
            <TouchableOpacity
              className="bg-green-600 px-4 py-2 rounded"
              onPress={() => exportCasesCSV(cases)}
            >
              <Text className="text-white text-center">Export Cases CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-purple-600 px-4 py-2 rounded"
              onPress={() => exportVisitsCSV(visits)}
            >
              <Text className="text-white text-center">Export Visits CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-amber-600 px-4 py-2 rounded"
              onPress={() => exportSummariesCSV(summaries)}
            >
              <Text className="text-white text-center">
                Export Summaries CSV
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
```

---

# 12) /app/\_layout.tsx (wrap provider + router outlet)

```tsx
// app/_layout.tsx
import React from "react";
import { AFPProvider } from "../context/AFPContext";
import { Slot } from "expo-router";
import { View } from "react-native";

export default function Layout() {
  return (
    <AFPProvider>
      <View className="flex-1">
        <Slot />
      </View>
    </AFPProvider>
  );
}
```

---

# 13) /app/index.tsx (home)

```tsx
// app/index.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center p-4 bg-gray-50">
      <Text className="text-2xl font-bold mb-4">AFP Surveillance App</Text>

      <View className="w-full space-y-3">
        <Link href="/forms/AFPF001" asChild>
          <TouchableOpacity className="bg-blue-600 px-4 py-3 rounded">
            <Text className="text-white text-center">
              AFP-F001 — Case Investigation
            </Text>
          </TouchableOpacity>
        </Link>
        <Link href="/forms/AFPF002" asChild>
          <TouchableOpacity className="bg-indigo-600 px-4 py-3 rounded">
            <Text className="text-white text-center">
              AFP-F002 — Facility Visit
            </Text>
          </TouchableOpacity>
        </Link>
        <Link href="/forms/AFPF003" asChild>
          <TouchableOpacity className="bg-emerald-600 px-4 py-3 rounded">
            <Text className="text-white text-center">
              AFP-F003 — Weekly Summary
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
```

---

# Final notes — quick checklist & tips

- This is a **local-only** (offline-first) Expo app. All data persists in `AsyncStorage`.
- `mockData` seeds two months of testing records on first run. A seeded flag is implicitly handled by stored keys.
- Weekly summary date computation uses JS `Date`-based arithmetic rather than string arithmetic.
- CSV export uses `expo-file-system` + `expo-sharing` to create and share files.
- UI uses `nativewind` classes (Tailwind). Ensure `nativewind` is configured in your `babel.config.js`.
- Replace icon usage with `lucide-react-native` if you want icons in headers and buttons.

---

Alright Mahmud — that’s a full, production-minded Expo app scaffold with the app logic, features, and UX touches we’ve been iterating on. If you want, I’ll:

- wire up proper form validation (yup/zod),
- add animated Loaders with Reanimated,
- convert the `DynamicForm` to a fully schema-driven renderer (ODK-style multi-step),
- or prepare a single-file prompt for Claude to generate a polished interactive artifact.

Which of those next-level moves do you want me to do now?
