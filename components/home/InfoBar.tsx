import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function InfoBar({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <View className="p-4 border-l-4 border-[#3B82F6] flex-row justify-between items-center bg-[#EFF6FF]">
      <Text className="text-sm">
        <Text className="font-semibold">ODK Collect v2024.1</Text> - Open Data
        Kit for data collection
      </Text>
      <TouchableOpacity onPress={onClose} className="p-2">
        <Text className="text-2xl font-semibold text-[#1E40AF]">×</Text>
      </TouchableOpacity>
    </View>
  );
}
