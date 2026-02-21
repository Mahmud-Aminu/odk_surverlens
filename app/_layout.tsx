import NativeForms from "@/constants/forms/forms.json";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FormProvider } from "@/context/FormContext";
import { ThemeProvider } from "@/theme";
import { odkStorage } from "@/utils/StorageManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// No anchor setting — the auth guard in RootLayoutNav controls
// which route group (auth vs tabs) the user lands on.

function RootLayoutNav() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Initialization logic moved from index.tsx
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing ODK storage...");
        await odkStorage.initialize();

        // Clear existing forms to force fresh load (debugging duplicates)
        await AsyncStorage.removeItem("@serverforms");

        console.log("Saving AFP forms to AsyncStorage...");
        await AsyncStorage.setItem("@serverforms", JSON.stringify(NativeForms));
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (authLoading || !isReady) return;

    if (user) {
      router.replace("/(tabs)");
    }
  }, [user, authLoading, isReady, router]);



  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <AuthProvider>
        <FormProvider>
          <ThemeProvider>
            <RootLayoutNav />
            <StatusBar style="light" backgroundColor="#1f2937" />
          </ThemeProvider>
        </FormProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
