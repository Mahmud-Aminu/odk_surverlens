import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";

import React from "react";
import { View } from "react-native";
export const OnbordingProgessBar = ({
  formData,
  step,
}: {
  formData: {
    name: string;
    hospital: { hname: string; haddrs: string };
  };
  step: number;
}) => {
  const { mode } = useTheme();
  const bgColor = mode === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = mode === "dark" ? "text-gray-400" : "text-gray-600";

  const enteredFormData = formData.name ? "bg-[#0a7ea4]" : bgColor;
  const enteredFacility =
    formData.name && formData.hospital.hname ? "bg-[#0a7ea4]" : bgColor;
  const PreviewDetails = step === 2 ? "bg-[#0a7ea4]" : bgColor;
  return (
    <View className="flex flex-row justify-center items-center gap-3 w-full">
      <View
        className={`p-3 rounded-full shadow-sm flex items-center ${enteredFormData}`}
      >
        <Feather name="user" size={20} className={`font-bold ${textColor}`} />
      </View>
      <View
        className={`h-2 w-1/4  rounded-full ${step === 1 || step === 2 ? "bg-[#0a7ea4]" : "bg-white"}`}
      />
      <View
        className={`p-3 rounded-full shadow-sm flex justify-center items-center ${enteredFacility}`}
      >
        <Feather name="home" size={20} className={`font-bold ${textColor}`} />
      </View>
      <View
        className={`h-2 w-1/4  rounded-full ${step === 2 ? "bg-[#0a7ea4]" : "bg-white"}`}
      />
      <View
        className={`p-3 rounded-full shadow-sm flex justify-center items-center ${PreviewDetails}`}
      >
        <Feather name="eye" size={20} className={`font-bold ${textColor}`} />
      </View>
    </View>
  );
};
