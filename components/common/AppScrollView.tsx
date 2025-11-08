import useTheme from "@/theme";
import React, { ReactNode } from "react";
import { ScrollView } from "react-native";

const AppScrollView = ({ children }: { children: ReactNode }) => {
  const { mode } = useTheme();
  const bgColor = mode === "light" ? "bg-gray-100" : "bg-gray-900";

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        alignItems: "center",
        backgroundColor: bgColor,
      }}
    >
      {children}
    </ScrollView>
  );
};

export default AppScrollView;
