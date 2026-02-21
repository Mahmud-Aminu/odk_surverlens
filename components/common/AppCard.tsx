import useTheme from "@/theme";
import { clsx } from "clsx";
import React from "react";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

type AppCardProps = ViewProps & {
  className?: string;
  style?: StyleProp<ViewStyle>;
  variant?: "elevated" | "outlined" | "flat";
  noPadding?: boolean;
};

export default function AppCard({
  className,
  style,
  children,
  variant = "elevated",
  noPadding = false,
  ...otherProps
}: AppCardProps) {
  const { mode } = useTheme();

  const bgColor = mode === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = mode === "dark" ? "border-gray-700" : "border-gray-200";

  let variantClass = "";
  if (variant === "elevated") variantClass = "shadow-sm border-0"; // NativeWind uses shadow-sm for elevation
  if (variant === "outlined") variantClass = `border ${borderColor} shadow-none`;
  if (variant === "flat") variantClass = "bg-transparent border-0 shadow-none";

  const paddingClass = noPadding ? "" : "p-4";
  const roundedClass = "rounded-xl";

  const mergedClassname = clsx(
    bgColor,
    variantClass,
    paddingClass,
    roundedClass,
    className
  );

  return (
    <View className={mergedClassname} style={style} {...otherProps}>
      {children}
    </View>
  );
}
