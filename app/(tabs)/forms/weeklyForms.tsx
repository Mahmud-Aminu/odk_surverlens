import { AppCard, AppContainer, AppText } from "@/components";
import { FormHeader } from "@/components/home/Header";
import { useAuth } from "@/context/AuthContext";
import { getUserWeeklyAfpStats } from "@/services/afpServces";
import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

const WeeklyForms = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [weekNumber, setWeekNumber] = useState(0);
  const [weekRange, setWeekRange] = useState("");
  const router = useRouter();
  const { mode } = useTheme();
  const { user } = useAuth();
  // const { weekNumber } = getISOWeekInfo();

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const stats = await getUserWeeklyAfpStats(user.id);

      setWeeklyCount(stats.weeklyCount);
      setWeekNumber(stats.weekNumber);
      setWeekRange(stats.weekRange);
    } catch (err: any) {
      console.error("Weekly AFP fetch failed:", err);
      setError(err.message || "Failed to load weekly stats");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ---- UI ----

  const isDark = mode === "dark";

  const handleGenerateAFPSummaryReport = () => {
    router.push({
      pathname: "/(tabs)/forms/afp-f003",
      params: {
        state: "Katsina",
        lga: "Katsina",
        health_facility: "MCHC Katsina",
        reporting_week: weekNumber,
        year: "2026",
        count: weeklyCount,
        currentWeekNumber: weekNumber,
        currentWeekRange: weekRange,
      },
    });
  };

  return (
    <AppContainer className="flex-1">
      <FormHeader
        currentRoute="Weekly Form Submissions"
        goBack={() => router.replace("/(tabs)")}
      />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <AppText className="p-4">Loading weekly submission data...</AppText>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-4">
            <Feather name="alert-triangle" size={36} color="#ef4444" />
          </View>
          <AppText className="text-red-500 text-base text-center mb-4">
            {error}
          </AppText>
          <TouchableOpacity
            onPress={fetchStats}
            className="flex-row justify-center gap-2 items-center p-4 bg-blue-600 active:bg-blue-700 rounded-xl"
            activeOpacity={0.8}
          >
            <Feather name="refresh-ccw" size={20} color="white" />
            <AppText
              type="body"
              className="font-semibold text-white tracking-wide"
            >
              Retry
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="p-4">
          {/* ── Summary Cards ── */}
          <View>
            <AppText type="subheading" className="mb-2">
              Current Week no. {weekNumber}
            </AppText>
            <AppText type="subheading" className="mb-2">
              Submission for {weekRange}
            </AppText>
          </View>
          <View className="flex-row gap-3 mb-5">
            <AppCard className="flex-1 items-center py-5" variant="elevated">
              <View className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-3">
                <Feather name="clipboard" size={22} color="#3b82f6" />
              </View>
              <AppText
                type="heading"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1"
              >
                {weeklyCount}
              </AppText>
              <AppText type="tag" className="text-gray-500 dark:text-gray-400">
                AFP Forms Submitted this Week
              </AppText>
            </AppCard>
          </View>

          {/* ── Detail Cards ── */}
          <View className="gap-3">
            {/* AFP Detail */}

            {/* Total Card */}
            <AppCard
              className="mt-1 border border-dashed border-gray-300 dark:border-gray-700"
              variant="flat"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                    <Feather
                      name="bar-chart-2"
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </View>
                  <AppText type="body" className="font-semibold text-lg">
                    Total Submissions
                  </AppText>
                </View>

                <AppText type="heading" className="text-xl font-bold">
                  {weeklyCount}
                </AppText>
              </View>
            </AppCard>
          </View>

          {/* ── AFP Button ── */}
          <View className="gap-3 mt-6">
            <TouchableOpacity
              onPress={handleGenerateAFPSummaryReport}
              className="flex-row justify-center gap-2 items-center p-4 bg-blue-600 active:bg-blue-700 rounded-xl"
              activeOpacity={0.8}
            >
              <Feather name="clipboard" size={20} color="white" />
              <AppText
                type="body"
                className="font-semibold text-white tracking-wide"
              >
                Generate AFP Weekly Summary
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </AppContainer>
  );
};

export default WeeklyForms;
