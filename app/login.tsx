import { AppButton, AppText, AppTextInput, ScreenWrapper } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const clearErrors = () => {
        setEmailError(null);
        setPasswordError(null);
        setFormError(null);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (emailError) setEmailError(null);
        if (formError) setFormError(null);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) setPasswordError(null);
        if (formError) setFormError(null);
    };

    const getSimpleErrorMessage = (errorCode: string): { field: "email" | "password" | "form"; message: string } => {
        switch (errorCode) {
            case "auth/invalid-email":
                return { field: "email", message: "Please enter a valid email address." };
            case "auth/user-disabled":
                return { field: "form", message: "This account has been disabled. Please contact your administrator." };
            case "auth/user-not-found":
                return { field: "email", message: "No account found with this email. Please check and try again." };
            case "auth/wrong-password":
                return { field: "password", message: "Incorrect password. Please try again." };
            case "auth/invalid-credential":
                return { field: "form", message: "Incorrect email or password. Please check and try again." };
            case "auth/too-many-requests":
                return { field: "form", message: "Too many failed attempts. Please wait a moment and try again." };
            case "auth/network-request-failed":
                return { field: "form", message: "No internet connection. Please check your network and try again." };
            default:
                return { field: "form", message: "Something went wrong. Please try again later." };
        }
    };

    const handleLogin = async () => {
        clearErrors();

        let hasError = false;

        if (!email.trim()) {
            setEmailError("Please enter your email address.");
            hasError = true;
        }

        if (!password) {
            setPasswordError("Please enter your password.");
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            await login(email.trim(), password);
        } catch (err: any) {
            if (err && err.code) {
                const { field, message } = getSimpleErrorMessage(err.code);
                if (field === "email") setEmailError(message);
                else if (field === "password") setPasswordError(message);
                else setFormError(message);
            } else if (err?.message) {
                setFormError(err.message);
            } else {
                setFormError("Something went wrong. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper className="flex-1">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                    className="px-6"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="mb-10">
                        <AppText type="heading" className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome Back
                        </AppText>
                        <AppText className="text-gray-500 dark:text-gray-400 text-lg">
                            Sign in to access your dashboard
                        </AppText>
                    </View>

                    <View className="gap-y-2">
                        <View>
                            <AppTextInput
                                label="Email Address"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={handleEmailChange}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                leftIcon={<Feather name="mail" size={20} color={emailError ? "#ef4444" : "#9ca3af"} />}
                            />
                            {emailError && (
                                <View className="flex-row items-center mt-1 ml-1">
                                    <Feather name="info" size={14} color="#ef4444" />
                                    <AppText className="text-red-500 text-xs ml-1">{emailError}</AppText>
                                </View>
                            )}
                        </View>

                        <View>
                            <AppTextInput
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={handlePasswordChange}
                                secureTextEntry={!showPassword}
                                leftIcon={<Feather name="lock" size={20} color={passwordError ? "#ef4444" : "#9ca3af"} />}
                                rightIcon={
                                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                                        <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#9ca3af" />
                                    </Pressable>
                                }
                            />
                            {passwordError && (
                                <View className="flex-row items-center mt-1 ml-1">
                                    <Feather name="info" size={14} color="#ef4444" />
                                    <AppText className="text-red-500 text-xs ml-1">{passwordError}</AppText>
                                </View>
                            )}
                        </View>

                        {formError && (
                            <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex-row items-center border border-red-200 dark:border-red-800">
                                <Feather name="alert-circle" size={18} color="#ef4444" />
                                <AppText className="text-red-600 dark:text-red-400 ml-2 flex-1 text-sm">
                                    {formError}
                                </AppText>
                            </View>
                        )}

                        <AppButton
                            title="Sign In"
                            onPress={handleLogin}
                            isLoading={loading}
                            variant="primary"
                            size="lg"
                            className="w-full mt-4 shadow-lg shadow-blue-500/20"
                        />

                        <AppButton
                            title="Back to Welcome"
                            onPress={() => router.back()}
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}
