import { AppText } from "@/components";
import { Link } from "expo-router";
import React from "react";
import { View } from "react-native";

const InfoScreen = () => {
  return (
    <View className="space-y-4">
      <AppText>Access documentation and support resources:</AppText>
      <View className="space-y-3">
        <Link
          href="https://docs.getodk.org"
          target="_blank"
          rel="noopener noreferrer"
          // className={`block p-4 border ${borderClass} rounded-lg ${hoverBgClass} ${activeBgClass} transition-colors`}
        >
          <AppText className="font-medium text-blue-600">
            ODK Documentation
          </AppText>
          <AppText className="text-sm">Complete guides and tutorials</AppText>
        </Link>
        <Link
          href="https://forum.getodk.org"
          target="_blank"
          rel="noopener noreferrer"
          // className={`block p-4 border ${borderClass} rounded-lg ${hoverBgClass} ${activeBgClass} transition-colors`}
        >
          <AppText className="font-medium text-blue-600">
            Community Forum
          </AppText>
          <AppText className="text-sm">Get help from the community</AppText>
        </Link>
      </View>
    </View>
  );
};

export default InfoScreen;
