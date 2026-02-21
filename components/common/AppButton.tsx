import { useTheme } from "@/theme/ThemeContext";
import { clsx } from "clsx";
import React from "react";
import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import AppText from "./AppText";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string; // Additional classes
  children?: React.ReactNode;
}

const AppButton = ({
  onPress,
  className,
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: AppButtonProps) => {
  const { mode } = useTheme();

  // Base styles
  const baseStyles = "flex-row items-center justify-center rounded-xl";

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 active:bg-blue-700";
      case "secondary":
        return mode === "dark"
          ? "bg-gray-700 active:bg-gray-600"
          : "bg-gray-100 active:bg-gray-200";
      case "outline":
        return mode === "dark"
          ? "border border-gray-600 bg-transparent active:bg-gray-800"
          : "border border-gray-300 bg-transparent active:bg-gray-50";
      case "ghost":
        return "bg-transparent active:bg-gray-700/10";
      case "danger":
        return "bg-red-500 active:bg-red-600";
      default:
        return "bg-blue-600";
    }
  };

  // Text color based on variant
  const getTextColor = () => {
    if (variant === "outline" || variant === "ghost") {
      return mode === "dark" ? "text-gray-300" : "text-gray-700";
    }
    if (variant === "secondary") {
      return mode === "dark" ? "text-gray-200" : "text-gray-900";
    }
    return "text-white";
  };

  // Disabled state
  const isDisabled = disabled || isLoading;
  const disabledStyles = isDisabled ? "opacity-50" : "shadow-sm";

  const mergedClass = clsx(
    baseStyles,
    sizeStyles[size],
    getVariantStyles(),
    disabledStyles,
    className
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      className={mergedClass}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? "#3b82f6" : "white"}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          {children ? (
            typeof children === "string" || typeof children === "number" ? (
              <AppText
                className={clsx(
                  "font-semibold text-center",
                  getTextColor(),
                  size === "sm" ? "text-xs" : "text-base"
                )}
              >
                {children}
              </AppText>
            ) : (
              children
            )
          ) : (
            <AppText
              className={clsx("font-semibold text-center", getTextColor(), size === "sm" ? "text-xs" : "text-base")}
            >
              {title}
            </AppText>
          )}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
