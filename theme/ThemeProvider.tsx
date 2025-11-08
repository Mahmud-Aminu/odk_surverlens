import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { darkTheme, lightTheme } from "./theme";

const THEME_KEY = "surveylens_key";

export type ThemeType = typeof lightTheme;

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === "dark" || stored === "light") {
          setMode(stored);
          return;
        }

        // Detect system preference on the web. If matchMedia is unavailable, fall back to light.
        if (systemColorScheme) {
          const prefersDark = mode === "dark" || systemColorScheme === "dark";
          // const prefersDark = window.matchMedia(
          //   "(prefers-color-scheme: dark)"
          // ).matches;
          setMode(prefersDark ? "dark" : "light");
        } else {
          setMode("light");
        }
      } catch (err) {
        // If storage access fails, fall back to system or light

        console.warn("ThemeProvider: failed to read theme from storage", err);
        if (systemColorScheme) {
          const prefersDark = mode === "dark" || systemColorScheme === "dark";

          setMode(prefersDark ? "dark" : "light");
        } else {
          setMode("light");
        }
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_KEY, newMode);
    } catch (err) {
      console.warn("ThemeProvider: failed to persist theme", err);
    }
  };

  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeProvider;
// export const useTheme = () => {
//   const ctx = useContext(ThemeContext);
//   if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
//   return ctx;
// };
