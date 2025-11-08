// app/forms/AFPF002.tsx
import { useAFP } from "@/temp/context/AFPContext";
import { FacilityVisit } from "@/temp/types";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
