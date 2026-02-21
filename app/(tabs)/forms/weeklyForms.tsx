import { AppCard, AppContainer, AppText } from "@/components";
import { FormHeader } from "@/components/home/Header";
import { getCurrentWeekNumber, getCurrentWeekRange } from "@/helpers/helpers";
import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

type Period = "weekly" | "monthly";

// Static submission data (UI-only, no backend)
const submissionData = {
  weekly: {
    afp: { count: 12, label: "This Week" },
    idsr: { count: 8, label: "This Week" },
  },
  monthly: {
    afp: { count: 47, label: "This Month" },
    idsr: { count: 34, label: "This Month" },
  },
};

const WeeklyForms = () => {
  const router = useRouter();
  const { mode } = useTheme();
  const [period, setPeriod] = useState<Period>("weekly");

  const isDark = mode === "dark";
  const data = submissionData[period];

  const activeBg = "bg-blue-600";
  const activeText = "text-white";
  const inactiveBg = isDark ? "bg-gray-800" : "bg-gray-100";
  const inactiveText = isDark ? "text-gray-400" : "text-gray-500";

  const handleGenerateAFPSummaryReport = () => {
    if (period === "weekly") {
      router.push({
        pathname: "/(tabs)/forms/afp-f003",
        params: {
          state: "Katsina",
          lga: "Katsina",
          health_facility: "MCHC Katsina",
          reporting_week: "6",
          year: "2026",
          count: data.afp.count,
        },
      });
    } else {
      router.push({
        pathname: "/(tabs)/forms/afp-f003",
        params: {
          state: "Katsina",
          lga: "Katsina",
          health_facility: "MCHC Katsina",
          reporting_week: "6",
          year: "2026",
          count: data.afp.count,
        },
      });
    }
  };

  const idsrRoute = () =>
    period === "weekly"
      ? "/(tabs)/forms/idsr-f001"
      : "/(tabs)/forms/idsr-monthly";

  return (
    <AppContainer className="flex-1">
      <FormHeader
        currentRoute="Form Submissions"
        goBack={() => router.replace("/(tabs)")}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Period Toggle ── */}
        <View
          className={`flex-row rounded-xl p-1 mb-5 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
        >
          <TouchableOpacity
            onPress={() => setPeriod("weekly")}
            className={`flex-1 py-2.5 rounded-lg items-center ${period === "weekly" ? activeBg : "bg-transparent"}`}
            activeOpacity={0.8}
          >
            <AppText
              type="body"
              className={`font-semibold ${period === "weekly" ? activeText : inactiveText}`}
            >
              Weekly
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPeriod("monthly")}
            className={`flex-1 py-2.5 rounded-lg items-center ${period === "monthly" ? activeBg : "bg-transparent"}`}
            activeOpacity={0.8}
          >
            <AppText
              type="body"
              className={`font-semibold ${period === "monthly" ? activeText : inactiveText}`}
            >
              Monthly
            </AppText>
          </TouchableOpacity>
        </View>

        {/* ── Summary Cards ── */}
        <View>
          <AppText type="subheading" className="mb-2">
            Current Week no. {getCurrentWeekNumber()}
          </AppText>
          <AppText type="subheading" className="mb-2">
            Submission for {getCurrentWeekRange()}
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
              {data.afp.count}
            </AppText>
            <AppText type="tag" className="text-gray-500 dark:text-gray-400">
              AFP Forms
            </AppText>
          </AppCard>

          <AppCard className="flex-1 items-center py-5" variant="elevated">
            <View className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full mb-3">
              <Feather name="activity" size={22} color="#10b981" />
            </View>
            <AppText
              type="heading"
              className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1"
            >
              {data.idsr.count}
            </AppText>
            <AppText type="tag" className="text-gray-500 dark:text-gray-400">
              IDSR Forms
            </AppText>
          </AppCard>
        </View>

        {/* ── Detail Cards ── */}
        <View className="gap-3">
          {/* AFP Detail */}
          <AppCard variant="elevated">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                  <Feather name="clipboard" size={20} color="#3b82f6" />
                </View>
                <View>
                  <AppText type="body" className="font-semibold text-lg">
                    AFP Forms
                  </AppText>
                  <AppText type="tag" className="text-gray-400">
                    {data.afp.label}
                  </AppText>
                </View>
              </View>

              <View className="items-end">
                <AppText
                  type="heading"
                  className="text-xl font-bold text-blue-600 dark:text-blue-400"
                >
                  {data.afp.count}
                </AppText>
                <AppText type="tag" className="text-gray-400">
                  Submitted
                </AppText>
              </View>
            </View>
          </AppCard>

          {/* IDSR Detail */}
          <AppCard variant="elevated">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center">
                  <Feather name="activity" size={20} color="#10b981" />
                </View>
                <View>
                  <AppText type="body" className="font-semibold text-lg">
                    IDSR Forms
                  </AppText>
                  <AppText type="tag" className="text-gray-400">
                    {data.idsr.label}
                  </AppText>
                </View>
              </View>

              <View className="items-end">
                <AppText
                  type="heading"
                  className="text-xl font-bold text-emerald-600 dark:text-emerald-400"
                >
                  {data.idsr.count}
                </AppText>
                <AppText type="tag" className="text-gray-400">
                  Submitted
                </AppText>
              </View>
            </View>
          </AppCard>

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
                {data.afp.count + data.idsr.count}
              </AppText>
            </View>
          </AppCard>
        </View>

        {/* ── AFP & IDSR Buttons ── */}
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
              {period === "weekly"
                ? "Generate AFP Weekly Summary"
                : "Generate AFP Monthly Summary"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(idsrRoute() as never)}
            className="flex-row justify-center gap-2 items-center p-4 bg-emerald-600 active:bg-emerald-700 rounded-xl"
            activeOpacity={0.8}
            disabled={true}
          >
            <Feather name="activity" size={20} color="white" />
            <AppText
              type="body"
              className="font-semibold text-white tracking-wide"
            >
              {period === "weekly"
                ? "Generate IDSR Weekly Summary"
                : "Generate IDSR Monthly Summary"}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppContainer>
  );
};

export default WeeklyForms;
