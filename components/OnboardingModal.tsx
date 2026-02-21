import { AppButton, AppCard, AppContainer, AppText } from "@/components";
import AppTextInput from "@/components/common/AppTextInput";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export const SFP_KEY = "sfp";

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

const OnboardingModal = ({ visible, onComplete }: OnboardingModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isFormValid = name.trim().length > 0 && phone.trim().length >= 10;

  const handleSave = async () => {
    if (!isFormValid) {
      Alert.alert("Missing Info", "Please enter your name and a valid phone number.");
      return;
    }

    setIsSaving(true);
    try {
      const sfpData = {
        name: name.trim(),
        phone: phone.trim(),
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(SFP_KEY, JSON.stringify(sfpData));
      setShowSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2500);
    } catch (error) {
      console.error("Failed to save SFP data:", error);
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      {showSuccess ? (
        <AppContainer className="flex-1 items-center justify-center">
          <LottieView
            source={require("../assets/lottie/Success.json")}
            autoPlay
            loop={false}
            style={{ width: width * 0.5, height: width * 0.5 }}
          />
          <AppText className="text-green-500 text-xl font-bold mt-4">
            Profile saved!
          </AppText>
          <AppText className="text-gray-400 text-sm mt-2">
            Redirecting to dashboard...
          </AppText>
        </AppContainer>
      ) : (
        <AppContainer className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 rounded-full bg-blue-500/10 items-center justify-center mb-4">
                  <Feather name="user-check" size={32} color="#3b82f6" />
                </View>
                <AppText className="text-2xl font-bold text-center">
                  Focal Person Details
                </AppText>
                <AppText className="text-gray-400 text-sm text-center mt-2">
                  Enter your information to get started
                </AppText>
              </View>

              {/* Form */}
              <AppCard variant="elevated" className="p-6 gap-5">
                {/* Name */}
                <View>
                  <AppText className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    Full Name
                  </AppText>
                  <AppTextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Survey Focal Person Name"
                    leftIcon={<Feather name="user" size={18} color="#9ca3af" />}
                  />
                </View>

                {/* Phone Number */}
                <View>
                  <AppText className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    Phone Number
                  </AppText>
                  <AppTextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. 08012345678"
                    keyboardType="phone-pad"
                    leftIcon={<Feather name="phone" size={18} color="#9ca3af" />}
                  />
                </View>
              </AppCard>

              {/* Save Button */}
              <View className="mt-8">
                <AppButton
                  title="Continue"
                  onPress={handleSave}
                  isLoading={isSaving}
                  disabled={!isFormValid}
                  className="w-full"
                  rightIcon={<Feather name="arrow-right" size={20} color="white" />}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </AppContainer>
      )}
    </Modal>
  );
};

export default OnboardingModal;
