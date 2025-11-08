import { Feather } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { AppHapticTab, AppText } from "..";

export default function HelpCard({ onHelp }: { onHelp: () => void }) {
  return (
    <View className="mt-6 rounded-xl overflow-hidden">
      <AppHapticTab onPress={onHelp} className="flex-row items-center p-4">
        <View className="bg-gray-500 p-3 rounded-full mr-3">
          <Feather name="help-circle" size={24} color="white" />
        </View>
        <View>
          <AppText className="text-base font-medium mb-0.5">Get Help</AppText>
          <AppText className="text-sm text-gray-500">
            Documentation and support
          </AppText>
        </View>
      </AppHapticTab>
    </View>
  );
}
