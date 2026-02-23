import NativeForms from "@/constants/forms/forms.json";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FormProvider } from "@/context/FormContext";
import { ThemeProvider } from "@/theme";
import { odkStorage } from "@/utils/StorageManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    async function lockSplash() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch {}
    }
    lockSplash();
  }, []);

  // Initialization logic
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize ODK storage
        await odkStorage.initialize();

        // Clear existing forms to force fresh load
        await AsyncStorage.removeItem("@serverforms");

        await AsyncStorage.setItem("@serverforms", JSON.stringify(NativeForms));
      } catch (error) {
        console.error("[Init] Initialization error:", error);
        // Don't block app startup on init errors
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  // Hide splash screen when both auth and app are ready
  useEffect(() => {
    const shouldHideSplash = !authLoading && isReady;

    if (!shouldHideSplash || splashHidden) return;

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
        setSplashHidden(true);
      } catch (error) {
        console.warn("[Splash] Error hiding splash screen:", error);
        setSplashHidden(true); // Hide flag even on error
      }
    };

    hideSplash();
  }, [authLoading, isReady, splashHidden]);

  // Navigate once everything is ready
  useEffect(() => {
    if (!splashHidden) return; // Wait for splash to hide first

    if (user) {
      router.replace("/(tabs)");
    } else if (!authLoading) {
      router.replace("/");
    }
  }, [user, authLoading, splashHidden, router]);

  if (!isReady || authLoading) {
    return null; // keep native splash visible
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{}} />
      <Stack.Screen name="login" options={{}} />
      <Stack.Screen name="(tabs)" options={{}} />
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
