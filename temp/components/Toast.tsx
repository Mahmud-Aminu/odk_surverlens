// components/Toast.tsx
import React from "react";
import { View, Text } from "react-native";

export const Toast: React.FC<{ msg: string; type?: "success" | "error" }> = ({
  msg,
  type = "success",
}) => {
  return (
    <View
      className={`absolute top-6 right-4 px-4 py-3 rounded-lg ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <Text className="text-white">{msg}</Text>
    </View>
  );
};
