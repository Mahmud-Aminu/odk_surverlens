import useTheme from "@/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  const { mode } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <StatusBar
        backgroundColor={mode === "dark" ? "#1f2937" : "white"}
        style={mode === "dark" ? "light" : "dark"}
      />
    </Stack>
    //   {/* <Stack.Screen name="settings" options={{ headerShown: false }} />
    //   {/* <Stack.Screen name="server" options={{ headerShown: false }} /> */}

    //   {/* <Stack.Screen name="login" options={{ headerShown: false }} /> */}
    // </Stack>
  );
}
