import useTheme from "@/theme";
import { clsx } from "clsx";
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
    children: React.ReactNode;
    className?: string;
    bg?: string;
}

export default function ScreenWrapper({
    children,
    className,
    bg
}: ScreenWrapperProps) {
    const { mode } = useTheme();

    // Default backgrounds
    const defaultBg = mode === "dark" ? "bg-gray-900" : "bg-gray-50";
    const backgroundClass = bg || defaultBg;

    return (
        <SafeAreaView
            className={clsx("flex-1 h-full", backgroundClass, className)}
            edges={['top', 'left', 'right']} // Usually don't want to enforce bottom if using tabs
        >
            <StatusBar
                barStyle={mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor={mode === "dark" ? "#111827" : "#F9FAFB"}
            />
            {children}
        </SafeAreaView>
    );
}
