// app/forms/AFPF003.tsx
import { useAFP } from "@/temp/context/AFPContext";
import {
  exportCasesCSV,
  exportSummariesCSV,
  exportVisitsCSV,
} from "@/temp/utils/csvExport";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
