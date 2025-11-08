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
