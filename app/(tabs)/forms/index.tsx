// app/index.tsx
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center p-4 bg-gray-50">
      <Text className="text-2xl font-bold mb-4">AFP Surveillance App</Text>

      <View className="w-full space-y-3">
        <Link href="/form/forms/AFPF001" asChild>
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
