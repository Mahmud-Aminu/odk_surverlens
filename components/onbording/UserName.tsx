import { AppText } from "@/components";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

import useTheme from "@/theme";
import { useRouter } from "expo-router";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const UserDetails = ({ formData, setFormData, setOpenSignModal }) => {
  const route = useRouter();

  const { mode } = useTheme();
  const textColor = mode === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <View className="px-6 justify-center items-center space-y-6 w-full">
      {/* Name */}
      <View className="w-full">
        <AppText
          //  style={{ color: textColor }}
          className="block text-sm font-medium mb-2"
        >
          SPF Name
        </AppText>
        <View className="relative">
          <View className="absolute left-4 top-1/2 transform -translate-y-1/2 ">
            <Feather
              name="user"
              size={hp(3)}
              color={mode === "dark" ? "#9ca3af" : "#4b5563"}
            />
          </View>

          <TextInput
            value={formData.name}
            onChangeText={(t) => setFormData({ ...formData, name: t })}
            placeholderTextColor={mode === "dark" ? "#9ca3af" : "#4b5563"}
            placeholder="Survey Focal Person Name"
            className={`w-full pl-12 text-lg pr-12 py-5 rounded-xl ${textColor} border border-[#0a7ea4] focus:border-blue-500 focus:outline-none transition-colors`}
          />
        </View>
      </View>
      {/* Signature-btn */}
      <View className="w-full mt-5">
        <TouchableOpacity
          onPress={() => setOpenSignModal((prev) => !prev)}
          className={`flex flex-row justify-center gap-5 items-center w-full px-12 py-5 rounded-xl ${textColor} border border-[#0a7ea4] focus:border-blue-500 focus:outline-none transition-colors`}
        >
          <Feather
            name="tag"
            size={hp(3)}
            color={mode === "dark" ? "#9ca3af" : "#4b5563"}
          />
          <AppText>Sign (Optional)</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserDetails;
