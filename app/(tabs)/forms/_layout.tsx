// app/_layout.tsx
import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function Layout() {
  return (
    <View>
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
}
