import { FormProvider } from "@/context/FormProvider";
import useTheme from "@/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function Layout() {
  const { mode } = useTheme();
  return (
    <FormProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar
        backgroundColor={mode === "dark" ? "#1f2937" : "white"}
        style={mode === "dark" ? "light" : "dark"}
      />
    </FormProvider>
  );
}
