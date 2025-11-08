import useTheme from "@/theme";
import { clsx } from "clsx";
import React from "react";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

type AppCardProps = ViewProps & {
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export default function AppCard({
  className,
  style,
  children,
  ...otherProps
}: AppCardProps) {
  const { mode } = useTheme();
  const bgColor = mode === "dark" ? "bg-gray-800" : "bg-white";
  const mergedClassname = clsx(bgColor, className);

  return (
    <View className={mergedClassname} {...otherProps}>
      {children}
    </View>
  );
}
