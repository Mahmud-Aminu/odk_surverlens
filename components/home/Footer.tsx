import React from "react";
import { View } from "react-native";
import AppText from "../common/AppText";

export default function Footer() {
  return (
    <View className="items-center mt-8 mb-4">
      <AppText className="text-sm text-gray-500">
        Powered by Open Data Kit
      </AppText>
      <AppText className="text-sm text-gray-500 mt-1">Version 2024.1.0</AppText>
    </View>
  );
}
