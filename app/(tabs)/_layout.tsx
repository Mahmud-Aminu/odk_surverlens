import useTheme from "@/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function Layout() {
  const { mode } = useTheme();
  return (
    // avoid adding top safe-area padding here so header can align flush with the
    // status bar background. Keep left/right/bottom insets for correct layout.
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: mode === "dark" ? "#1f2937" : "#fff" }}
    >
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar
        backgroundColor={mode === "dark" ? "#1f2937" : "#fff"}
        style={mode === "dark" ? "light" : "dark"}
      />
    </SafeAreaView>
  );
}
