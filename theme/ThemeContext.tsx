import { createContext, useContext } from "react";
import { lightTheme } from "./theme";
// const THEME_KEY = "selehub_theme";

export type ThemeType = typeof lightTheme;

interface ThemeContextProps {
  theme: ThemeType;
  mode: "light" | "dark";
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined
);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
