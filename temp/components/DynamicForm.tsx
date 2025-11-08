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
