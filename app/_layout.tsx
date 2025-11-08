import AuthProvider from "@/context/AuthProvider";
import { FormProvider } from "@/context/FormProvider";
import { ThemeProvider } from "@/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <AuthProvider>
        <FormProvider>
          <ThemeProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="dark" backgroundColor="#1f2937" />
          </ThemeProvider>
        </FormProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
