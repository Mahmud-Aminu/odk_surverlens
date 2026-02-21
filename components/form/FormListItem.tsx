import { AppCard, AppText } from "@/components";
import { ServerForm } from "@/types/form.types";
import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

interface FormListItemProps {
  form: ServerForm;
  isChecked: boolean;
  isDownloading: boolean;
  isDownloaded: boolean;
  error?: string;
  onToggleSelect: (formId: string) => void;
  onDownload: (form: ServerForm) => void;
}

export const FormListItem = memo<FormListItemProps>(
  ({
    form,
    isChecked,
    isDownloading,
    isDownloaded,
    error,
    onToggleSelect,
    onDownload,
  }) => {
    // Determine checkbox color based on state
    const checkboxColor = isDownloaded
      ? "#10b981"
      : isChecked
        ? "#2563eb"
        : "#9ca3af";

    return (
      <AppCard className="mb-3 p-4 border border-gray-100 dark:border-gray-800" variant="elevated">
        <View className="flex-row items-start justify-between">
          <View className="flex-row flex-1 mr-2">
            {/* Selection Checkbox */}
            <TouchableOpacity
              onPress={() => onToggleSelect(form.id)}
              disabled={isDownloading || isDownloaded}
              className="mr-3 pt-1"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
              accessibilityLabel={`Select ${form.title}`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name={isChecked ? "check-square" : "square"}
                size={24}
                color={checkboxColor}
              />
            </TouchableOpacity>

            <View className="flex-1">
              <AppText type="body" className="font-bold text-base mb-1">
                {form.title}
              </AppText>

              <AppText type="tag" className="mb-1">
                ID: {form.id} • v{form.version}
              </AppText>

              {form.lastUpdated && (
                <AppText type="link" className="text-gray-400">
                  Updated: {form.lastUpdated}
                </AppText>
              )}

              {error && (
                <View className="flex-row items-center mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded self-start">
                  <Feather name="alert-circle" size={14} color="#ef4444" />
                  <AppText className="text-xs text-red-600 dark:text-red-400 ml-1">
                    {error}
                  </AppText>
                </View>
              )}
            </View>
          </View>

          {/* Action Button */}
          <View className="justify-center">
            {isDownloading ? (
              <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full">
                <ActivityIndicator size="small" color="#2563eb" />
              </View>
            ) : isDownloaded ? (
              <View className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                <Feather name="check" size={20} color="#10b981" />
              </View>
            ) : (
              <TouchableOpacity
                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full active:bg-blue-100 dark:active:bg-blue-900/40"
                onPress={() => onDownload(form)}
                disabled={isDownloading}
                accessibilityRole="button"
                accessibilityLabel={`Download ${form.title}`}
              >
                <Feather name="download" size={20} color="#2563eb" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </AppCard>
    );
  }
);

FormListItem.displayName = "FormListItem";
