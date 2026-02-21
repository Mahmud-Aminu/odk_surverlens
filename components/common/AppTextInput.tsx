import { useTheme } from "@/theme/ThemeContext";
import { clsx } from "clsx";
import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
import AppText from "./AppText";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  multiline?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function AppTextInput({
  label,
  error,
  multiline,
  className,
  containerClassName,
  style,
  leftIcon,
  rightIcon,
  ...rest
}: Props) {
  const { mode } = useTheme();

  // Theme-based colors
  const bgColor = mode === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = error
    ? "border-red-500"
    : mode === "dark" ? "border-gray-700" : "border-gray-200";
  const textColor = mode === "dark" ? "text-white" : "text-gray-900";
  const placeholderColor = mode === "dark" ? "#9ca3af" : "#9ca3af";

  // Container style (Input wrapper)
  const inputContainerBase = "flex-row items-center w-full rounded-xl border px-3";
  const inputContainerParams = multiline ? "py-3 h-24 items-start" : "h-12";

  const inputContainerClass = clsx(
    inputContainerBase,
    inputContainerParams,
    bgColor,
    borderColor,
    className
  );

  return (
    <View className={clsx("w-full mb-4", containerClassName)}>
      {label && (
        <AppText className="mb-1.5 font-medium text-gray-700 dark:text-gray-300 ml-1">
          {label}
        </AppText>
      )}

      <View className={inputContainerClass}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          style={[{ textAlignVertical: multiline ? "top" : "center" }, style]}
          className={clsx("flex-1 text-base", textColor)}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          placeholderTextColor={placeholderColor}
          {...rest}
        />

        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>

      {error && (
        <AppText className="mt-1 text-sm text-red-500 ml-1">
          {error}
        </AppText>
      )}
    </View>
  );
}
