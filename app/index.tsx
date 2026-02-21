import { AppButton, AppText, ScreenWrapper } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

/**
 * Passive splash / loading screen.
 * The root layout's auth guard handles all navigation —
 * this screen never navigates on its own.
 */
const Index = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenWrapper bg="bg-gray-900" className="flex-1 justify-center items-center px-6">
      <View className="items-center mb-10 w-full">
        <View className="bg-blue-500/20 p-8 rounded-full mb-8">
          <Feather name="shield" size={64} color="#3b82f6" />
        </View>

        <AppText type="heading" className="text-4xl font-bold text-white mb-3 text-center">
          SurveilPro
        </AppText>

        <AppText type="subheading" className="text-gray-400 text-center text-lg max-w-[80%]">
          Secure Health Surveillance System
        </AppText>
      </View>

      {!user && <View className="w-full absolute bottom-12 px-6 mb-10">
        <AppButton
          title="Login to Dashboard"
          onPress={() => router.push("/login")}
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-blue-500/30"
          rightIcon={<Feather name="arrow-right" size={20} color="white" />}
        />
      </View>}
    </ScreenWrapper>
  );
};

export default Index;
