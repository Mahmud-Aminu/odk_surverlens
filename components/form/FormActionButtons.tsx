import { AppCard, AppText } from "@/components";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

/**
 * FormActionButtons Component
 *
 * Bottom action bar with three primary actions for form management:
 * 1. Select All / Deselect All - Toggle selection of all forms
 * 2. Get Selected - Download all selected forms
 * 3. Refresh - Reload form list from server
 *
 * Features:
 * - Sticky bottom positioning
 * - Disabled states during operations
 * - Visual feedback for selections
 * - Counter badge on download button
 * - Loading indicators
 * - Accessibility support
 *
 * ODK Pattern:
 * Follows ODK Collect's pattern of bottom action buttons for:
 * - Bulk operations
 * - Server synchronization
 * - Selection management
 *
 * @param selectedCount - Number of currently selected forms
 * @param totalCount - Total number of available forms
 * @param allSelected - Whether all forms are selected
 * @param isDownloading - Whether batch download is in progress
 * @param isRefreshing - Whether form list is being refreshed
 * @param onSelectAll - Callback to select all forms
 * @param onDeselectAll - Callback to deselect all forms
 * @param onDownloadSelected - Callback to download selected forms
 * @param onRefresh - Callback to refresh form list
 */

interface FormActionButtonsProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  isDownloading: boolean;
  isRefreshing: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownloadSelected: () => void;
  onRefresh: () => void;
}

export const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  selectedCount,
  totalCount,
  allSelected,
  isDownloading,
  isRefreshing,
  onSelectAll,
  onDeselectAll,
  onDownloadSelected,
  onRefresh,
}) => {
  // Don't show action bar if no forms available
  if (totalCount === 0) return null;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-4 py-3"
      style={{
        // Elevation for Android shadow
        elevation: 8,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View className="flex flex-row justify-between items-center">
        {/* 
          SELECT ALL / DESELECT ALL BUTTON
          
          Behavior:
          - Shows "Select All" when not all forms are selected
          - Shows "Deselect All" when all forms are selected
          - Disabled during download operations
          - Visual highlight when all selected
          
          ODK Pattern: Quick selection toggle for efficiency
        */}
        <Pressable
          className={`flex-1 mx-1 p-3 border rounded-lg ${allSelected ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" : "border-gray-300 dark:border-gray-600"
            }`}
          onPress={allSelected ? onDeselectAll : onSelectAll}
          disabled={isDownloading}
          accessibilityRole="button"
          accessibilityLabel={
            allSelected ? "Deselect all forms" : "Select all forms"
          }
          accessibilityState={{ disabled: isDownloading }}
        >
          <AppText
            type="body"
            className={`text-center font-semibold ${allSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
              }`}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </AppText>
        </Pressable>

        {/* 
          REFRESH BUTTON
          
          Behavior:
          - Reloads form list from server
          - Shows loading spinner during refresh
          - Disabled during download operations
          - Icon + text for clarity
          
          ODK Pattern: Server synchronization control
        */}
        <Pressable
          onPress={onRefresh}
          disabled={isRefreshing || isDownloading}
          accessibilityRole="button"
          accessibilityLabel="Refresh form list from server"
          accessibilityState={{
            disabled: isRefreshing || isDownloading,
            busy: isRefreshing,
          }}
        >
          <AppCard className="flex flex-row items-center justify-center">
            {isRefreshing ? (
              // Show spinner while refreshing
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : (
              // Show refresh icon when idle
              <>
                <Feather name="refresh-cw" size={16} color="#0a7ea4" />

              </>
            )}
          </AppCard>
        </Pressable>

        {/* 
          GET SELECTED BUTTON
          
          Behavior:
          - Enabled only when forms are selected
          - Shows count of selected forms
          - Primary action button (highlighted)
          - Disabled during download
          - Shows "Downloading..." state
          
          ODK Pattern: Primary action for batch operations
        */}
        <Pressable
          className={`flex-1 mx-1 p-3 rounded-lg ${selectedCount > 0 && !isDownloading
            ? "bg-blue-500 active:bg-blue-600"
            : "bg-gray-300"
            }`}
          onPress={onDownloadSelected}
          disabled={selectedCount === 0 || isDownloading}
          accessibilityRole="button"
          accessibilityLabel={
            isDownloading
              ? "Downloading forms"
              : `Download ${selectedCount} selected form${selectedCount !== 1 ? "s" : ""}`
          }
          accessibilityState={{
            disabled: selectedCount === 0 || isDownloading,
            busy: isDownloading,
          }}
        >
          <AppText
            type="body"
            className={`text-center font-semibold ${selectedCount > 0 && !isDownloading
              ? "text-white"
              : "text-gray-500"
              }`}
          >
            {isDownloading
              ? "Downloading..."
              : `Get Selected${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
          </AppText>
        </Pressable>
      </View>

      {/* 
        Optional: Helper Text
        Shows additional context about selections
      */}
      {selectedCount > 0 && !isDownloading && (
        <AppText className="text-center text-gray-600 dark:text-gray-400 text-xs mt-2">
          {selectedCount} of {totalCount} form{totalCount !== 1 ? "s" : ""}{" "}
          selected
        </AppText>
      )}
    </View>
  );
};
