// app/_layout.tsx
import React from "react";
import { AFPProvider } from "@/temp/context/AFPContext";
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
