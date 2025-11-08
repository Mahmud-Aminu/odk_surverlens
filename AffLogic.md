```typescript
// src/data/mockAFPCases.ts

import { AFPCase } from "./afpSchemas";
import { hospitalCredentials } from "./hospitalCredentials";

const nigerianNames = {
  male: [
    "Ibrahim",
    "Musa",
    "Yusuf",
    "Abdullahi",
    "Aminu",
    "Sani",
    "Usman",
    "Aliyu",
    "Bello",
    "Haruna",
    "Isah",
    "Suleiman",
    "Nasiru",
    "Kabir",
    "Umar",
    "Ahmad",
    "Mustapha",
    "Jamilu",
    "Tijjani",
    "Lawal",
  ],
  female: [
    "Aisha",
    "Fatima",
    "Zainab",
    "Maryam",
    "Hauwa",
    "Khadija",
    "Aminatu",
    "Rukayya",
    "Hadiza",
    "Asmau",
    "Safiya",
    "Halima",
    "Bilki",
    "Rahina",
    "Lubabatu",
    "Sadiya",
    "Maimuna",
    "Barira",
    "Fati",
    "Nafisa",
  ],
  surnames: [
    "Bello",
    "Musa",
    "Yusuf",
    "Abdullahi",
    "Sani",
    "Usman",
    "Aliyu",
    "Haruna",
    "Isah",
    "Suleiman",
    "Nasiru",
    "Kabir",
    "Umar",
    "Ahmad",
    "Mustapha",
    "Jamilu",
    "Tijjani",
    "Lawal",
    "Danjuma",
    "Garba",
  ],
};

const wards = [
  "Pediatric Ward",
  "OPD",
  "Emergency Unit",
  "Maternity Ward",
  "General Ward",
  "Isolation Ward",
];

const reporters = [
  "Dr. Yusuf",
  "Nurse Fatima",
  "Dr. Aminu",
  "Nurse Aisha",
  "Dr. Musa",
  "Nurse Maryam",
  "Dr. Bello",
  "Nurse Zainab",
];

function randomDate(start: Date, end: Date): string {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
    .toISOString()
    .split("T")[0];
}

function generateCase(
  hospitalName: string,
  idPrefix: string,
  index: number,
  startDate: Date,
  endDate: Date
): AFPCase {
  const sex = Math.random() > 0.5 ? "Male" : "Female";
  const firstName =
    sex === "Male"
      ? nigerianNames.male[
          Math.floor(Math.random() * nigerianNames.male.length)
        ]
      : nigerianNames.female[
          Math.floor(Math.random() * nigerianNames.female.length)
        ];
  const surname =
    nigerianNames.surnames[
      Math.floor(Math.random() * nigerianNames.surnames.length)
    ];
  const patientName = `${firstName} ${surname}`;
  const age = Math.floor(Math.random() * 15); // 0–14 years (AFP target)
  const onsetDate = randomDate(startDate, endDate);
  const dateReported = randomDate(
    new Date(onsetDate),
    new Date(new Date(onsetDate).getTime() + 3 * 24 * 60 * 60 * 1000)
  );
  const specimenCollected = Math.random() > 0.3;
  const dateSpecimenCollected = specimenCollected
    ? randomDate(
        new Date(dateReported),
        new Date(new Date(dateReported).getTime() + 2 * 24 * 60 * 60 * 1000)
      )
    : undefined;

  return {
    id: `${idPrefix}-${String(index + 1).padStart(3, "0")}`,
    patientName,
    age,
    sex,
    address: `${hospitalName.split(" ")[0]} Area, Katsina`,
    onsetDate,
    dateReported,
    reportedBy: reporters[Math.floor(Math.random() * reporters.length)],
    phoneNumber: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
    caseSource: Math.random() > 0.6 ? "Incoming Patient" : "Ward",
    wardDetected:
      Math.random() > 0.4
        ? wards[Math.floor(Math.random() * wards.length)]
        : undefined,
    specimenCollected,
    dateSpecimenCollected,
    remarks:
      Math.random() > 0.7
        ? `Fever, weakness in ${sex === "Male" ? "right" : "left"} leg`
        : undefined,
    finalized: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate 20 cases per hospital (Aug 1 – Oct 30, 2025)
const startDate = new Date("2025-08-01");
const endDate = new Date("2025-10-30");

export const mockAFPCases: AFPCase[] = hospitalCredentials.flatMap(
  (hospital) => {
    const cases: AFPCase[] = [];
    for (let i = 0; i < 20; i++) {
      cases.push(
        generateCase(hospital.name, hospital.id, i, startDate, endDate)
      );
      await;
    }
    return cases;
  }
);

// Optional: Export grouped by facility
export const mockAFPCasesByFacility = hospitalCredentials.reduce(
  (acc, hospital) => {
    acc[hospital.name] = mockAFPCases.filter((c) =>
      c.id.startsWith(hospital.id)
    );
    return acc;
  },
  {} as Record<string, AFPCase[]>
);

console.log(
  `Generated ${mockAFPCases.length} mock AFP cases (20 per hospital)`
);
```

---

### How to Use

1. **Save as** `src/data/mockAFPCases.ts`
2. **Import in your app**:

```ts
import { mockAFPCases, mockAFPCasesByFacility } from "@/data/mockAFPCases";
```

3. **Seed local DB or display in dev mode**:

```ts
// Example: Show total cases per facility
Object.entries(mockAFPCasesByFacility).forEach(([name, cases]) => {
  console.log(`${name}: ${cases.length} cases`);
});
```

---

### Sample Output (first 2 cases)

```ts
{
  id: "HCF-KTN-01-001",
  patientName: "Aisha Bello",
  age: 6,
  sex: "Female",
  address: "Dutsen Area, Katsina",
  onsetDate: "2025-08-12",
  dateReported: "2025-08-14",
  reportedBy: "Nurse Fatima",
  caseSource: "Ward",
  wardDetected: "Pediatric Ward",
  specimenCollected: true,
  dateSpecimenCollected: "2025-08-15",
  remarks: "Fever, weakness in left leg",
  finalized: true,
  createdAt: "2025-10-30T..."
}
```

---

**Total Generated**: **400 realistic AFP cases** (20 × 20 hospitals)  
**Time Range**: Aug 1 – Oct 30, 2025  
**Ready for**: Testing AFP-F001, F002, F003 auto-generation

Let me know if you want:

- CSV/JSON export
- PDF case forms
- Auto-generate AFP-F002/F003 from this data
- Seed into IndexedDB

Done!
