import useTheme from "@/theme";
import { clsx } from "clsx";
import React from "react";
import { TouchableOpacity } from "react-native";
import AppText from "./AppText";

const AppButton = ({
  onPress,
  className,
  title,
  children,
}: {
  onPress?: () => void;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}) => {
  const { mode } = useTheme();

  const bgClass = mode === "light" ? "bg-gray-100" : "bg-gray-900";

  const baseClass = "p-1 rounded-lg shadow-sm";
  const mergedClass = clsx(className, bgClass, baseClass);
  return (
    <TouchableOpacity onPress={onPress} className={mergedClass}>
      {children || (title && <AppText type="body">{title}</AppText>)}
    </TouchableOpacity>
  );
};

export default AppButton;
