Perfect! Let’s build this out step by step. I’ll create a **role-based hospital credential setup**, then show a **React + TypeScript login example** with role-based dashboards. This will all work **locally**, using your existing credentials data.

---

### 1️⃣ Updated Hospital Credential Array with Roles

```ts
export interface HospitalCredential {
  id: string;
  name: string;
  username: string;
  password: string;
  role: "admin" | "health_worker" | "supervisor";
}

export const hospitalCredentials: HospitalCredential[] = [
  {
    id: "HCF-KTN-01",
    name: "Dutsen Safe Health Centre",
    username: "dutsensafe_admin",
    password: "Dut$enSafe2025!",
    role: "admin",
  },
  {
    id: "HCF-KTN-02",
    name: "Hajiya Murja Mangal Health Clinic",
    username: "hajiyamurjamangal_admin",
    password: "H@jiyaMurjaSecure",
    role: "health_worker",
  },
  {
    id: "HCF-KTN-03",
    name: "K. Dara Clinic",
    username: "kdara_admin",
    password: "KD@raClinic123!",
    role: "supervisor",
  },
  {
    id: "HCF-KTN-04",
    name: "Katsina Government House Clinic",
    username: "katsinagovernmenthouse_admin",
    password: "K@tsinaGovPass",
    role: "admin",
  },
  {
    id: "HCF-KTN-05",
    name: "Kofar Marusa Maternal and Child Health Clinic",
    username: "kofarmarusamaternal_admin",
    password: "Kof@rMarusa2025",
    role: "health_worker",
  },
  {
    id: "HCF-KTN-06",
    name: "Kukar Gesa Health Centre",
    username: "kukargesa_admin",
    password: "Kuk@rGesaHealth!",
    role: "supervisor",
  },
  {
    id: "HCF-KTN-07",
    name: "Kwarin Tama Health Clinic",
    username: "kwarintama_admin",
    password: "Kw@rinTamaPass123",
    role: "health_worker",
  },
  {
    id: "HCF-KTN-08",
    name: "Kwado Health Centre",
    username: "kwado_admin",
    password: "Kw@doCentreSecure",
    role: "admin",
  },
  {
    id: "HCF-KTN-09",
    name: "Labmina Maternal Child and Health Clinic",
    username: "labminamaternal_admin",
    password: "L@bm1na2025!",
    role: "health_worker",
  },
  {
    id: "HCF-KTN-10",
    name: "Makudawa Health Clinic",
    username: "makudawa_admin",
    password: "M@kuDawaClinicPass",
    role: "supervisor",
  },
  {
    id: "HCF-KTN-11",
    name: "Modoji Health Clinic",
    username: "modoji_admin",
    password: "M0dojiHealth123",
    role: "admin",
  },
  {
    id: "HCF-KTN-12",
    name: "Nasarawa Day Health Clinic",
    username: "nasarawaday_admin",
    password: "N@sarawaDay2025!",
    role: "health_worker",
  },
  {
    id: "HCF-KTN-13",
    name: "New Millenium Clinic",
    username: "newmillenium_admin",
    password: "NewM1lleniumSecure",
    role: "supervisor",
  },
  {
    id: "HCF-KTN-14",
    name: "Rafin Dadi Maternal and Child Health Clinic",
    username: "rafindadimaternal_admin",
    password: "R@finDadiPass!",
    role: "health_worker",
  },
  {
    id: "HCF-KTN-15",
    name: "Sabo Unguwa Health Clinic",
    username: "sabounguwa_admin",
    password: "S@boUnguwa123",
    role: "admin",
  },
  {
    id: "HCF-KTN-16",
    name: "Sauki Clinic",
    username: "sauki_admin",
    password: "S@ukiClinicSecure",
    role: "health_worker",
  },
  {
    id: "HCF-KTN-17",
    name: "Shinkafi Health Centre",
    username: "shinkafi_admin",
    password: "Sh1nk@fi2025",
    role: "supervisor",
  },
  {
    id: "HCF-KTN-18",
    name: "Tudun Matawalle Health Clinic",
    username: "tudunmatawalle_admin",
    password: "TudunM@tawallePass",
    role: "health_worker",
  },
  {
    id: "HCF-KTN-19",
    name: "Unguwar Mammadee Health Clinic",
    username: "unguwarmammadee_admin",
    password: "UnguwarM@mma2025!",
    role: "admin",
  },
  {
    id: "HCF-KTN-20",
    name: "Wakilala Arewa Health Centre",
    username: "wakilalaarewa_admin",
    password: "W@kilalaArewaSecure",
    role: "supervisor",
  },
];
```

---

### 2️⃣ React Login + Role-Based Dashboard (Basic Example)

```tsx
import React, { useState } from "react";
import { hospitalCredentials, HospitalCredential } from "./hospitalCredentials";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<HospitalCredential | null>(null);

  const handleLogin = () => {
    const foundUser = hospitalCredentials.find(
      (h) => h.username === username && h.password === password
    );

    if (foundUser) setUser(foundUser);
    else alert("Invalid credentials!");
  };

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.name}</h1>
        {user.role === "admin" && <div>🛠 Admin Dashboard</div>}
        {user.role === "health_worker" && <div>📝 Data Entry Panel</div>}
        {user.role === "supervisor" && <div>📊 Reports & Analytics</div>}
      </div>
    );
  }

  return (
    <div>
      <h1>Hospital Login</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

---

✅ **This setup:**

- Supports **role-based dashboards**.
- Works entirely **locally** (good for testing / offline demo).
- Can easily scale with **permissions per role** later.

---

Next level move: I can **upgrade this to a full Expo/React Native app** with **role-based routing, navigation, and protected screens** so each hospital sees only their relevant features.

Do you want me to do that?
