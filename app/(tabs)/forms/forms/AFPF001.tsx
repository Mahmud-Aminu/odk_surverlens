// app/forms/AFPF001.tsx
import { DynamicForm } from "@/temp/components/DynamicForm";
import { Loader } from "@/temp/components/Loader";
import { Toast } from "@/temp/components/Toast";
import { useAFP } from "@/temp/context/AFPContext";
import { AFPCase } from "@/temp/types";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
