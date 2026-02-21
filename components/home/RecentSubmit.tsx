import { useForm } from "@/context/FormContext";
import { FormInstance } from "@/context/FormContext.types";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

/**
 * Format a date string into a readable time like "10:30 AM" or "Feb 20, 10:30 AM"
 */
const formatTime = (dateStr?: string): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return time;

    const month = date.toLocaleString([], { month: "short" });
    return `${month} ${date.getDate()}, ${time}`;
  } catch {
    return "";
  }
};

const RecentSubmit = () => {
  const { formInstances, refreshFormInstances, loadingInstances } = useForm();

  // Load instances on mount
  useEffect(() => {
    refreshFormInstances();
  }, []);

  // Filter to only submitted instances and sort by most recent first (max 5)
  const submittedInstances = useMemo(() => {
    return formInstances
      .filter((inst: FormInstance) => inst.status === "submitted")
      .sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.updatedAt).getTime();
        const dateB = new Date(b.submittedAt || b.updatedAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [formInstances]);

  return (
    <View className="w-full mt-2">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <AppText type="subheading" className="text-lg font-bold">
          Recent Submissions
        </AppText>
        {submittedInstances.length > 0 && (
          <AppText type="link" className="text-blue-500">
            {submittedInstances.length} submitted
          </AppText>
        )}
      </View>

      <View className="gap-3">
        {loadingInstances ? (
          <View className="p-8 items-center justify-center">
            <ActivityIndicator size="small" color="#3b82f6" />
            <AppText className="text-gray-400 mt-2 text-sm">
              Loading submissions…
            </AppText>
          </View>
        ) : submittedInstances.length === 0 ? (
          <View className="p-8 items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Feather name="inbox" size={28} color="#9ca3af" />
            <AppText className="text-gray-400 mt-2">
              No submitted forms yet
            </AppText>
          </View>
        ) : (
          submittedInstances.map((instance) => (
            <AppCard
              key={instance.instanceId}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center flex-1 gap-3">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-green-100">
                  <Feather name="check-circle" size={20} color="#16a34a" />
                </View>

                <View className="flex-1">
                  <AppText type="body" className="font-semibold mb-0.5">
                    {instance.formName || instance.formId}
                  </AppText>
                  <AppText className="text-xs text-gray-500">
                    {formatTime(instance.submittedAt || instance.updatedAt)}
                  </AppText>
                </View>
              </View>

              <View className="px-2 py-1 rounded-full bg-green-100">
                <AppText type="tag" className="text-green-700">
                  Submitted
                </AppText>
              </View>
            </AppCard>
          ))
        )}
      </View>
    </View>
  );
};

export default RecentSubmit;
