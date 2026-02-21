import { AppText } from "@/components";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

/**
 * EmptyFormsState Component
 *
 * Displays a helpful empty state when no forms are available on the server.
 * Provides visual feedback and an action button to refresh.
 *
 * Features:
 * - Large icon for visual clarity
 * - Helpful message
 * - Call-to-action button
 * - Centered layout
 * - Accessibility support
 *
 * ODK Pattern:
 * Empty states should guide users on what to do next:
 * - Check server configuration
 * - Refresh to try again
 * - Contact administrator
 *
 * Shown when:
 * - No forms available on server
 * - Server returned empty form list
 * - Network request succeeded but returned no data
 *
 * @param onRefresh - Callback when refresh button is pressed
 * @param isRefreshing - Whether a refresh is currently in progress
 */

interface EmptyFormsStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const EmptyFormsState: React.FC<EmptyFormsStateProps> = ({
  onRefresh,
  isRefreshing,
}) => {
  return (
    <View
      className="flex-1 items-center justify-center py-20 px-6"
      accessibilityRole="alert"
      accessibilityLabel="No forms available"
    >
      {/* 
        Empty State Icon
        Large inbox icon to visually represent "no content"
        Gray color to indicate inactive/empty state
      */}
      <Feather
        name="inbox"
        size={64}
        color="#9ca3af"
        accessibilityLabel="Empty inbox icon"
      />

      {/* 
        Primary Message
        Tells user why they're seeing this state
        Clear and concise explanation
      */}
      <AppText className="mt-4 text-gray-600 dark:text-gray-400 text-center font-medium text-base">
        No forms available on server
      </AppText>

      {/* 
        Secondary Message (Optional)
        Provides additional context or guidance
      */}
      <AppText className="mt-2 text-gray-500 dark:text-gray-400 text-center text-sm max-w-[280px]">
        There are currently no forms available for download. Please check your
        server connection or contact your administrator.
      </AppText>

      {/* 
        Action Button
        Primary call-to-action to resolve the empty state
        
        Design considerations:
        - Prominent blue color for primary action
        - Adequate padding for touch target (min 44x44 pts)
        - Rounded corners for modern appearance
        - Disabled state during refresh
      */}
      <TouchableOpacity
        onPress={onRefresh}
        disabled={isRefreshing}
        className={`mt-6 px-6 py-3 rounded-md ${isRefreshing ? "bg-gray-400" : "bg-blue-500 active:bg-blue-600"
          }`}
        accessibilityRole="button"
        accessibilityLabel="Refresh form list"
        accessibilityHint="Tap to reload forms from server"
        accessibilityState={{ disabled: isRefreshing, busy: isRefreshing }}
      >
        <View className="flex flex-row items-center">
          <Feather name="refresh-cw" size={18} color="white" />
          <AppText className="ml-2 text-white font-semibold">
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </AppText>
        </View>
      </TouchableOpacity>

      {/* 
        Optional: Additional Help Links
        Could add links to:
        - Server settings
        - Help documentation
        - Contact support
      */}
      <TouchableOpacity
        className="mt-4"
        accessibilityRole="link"
        accessibilityLabel="Go to server settings"
      >
        <AppText className="text-blue-500 text-sm underline">
          Check server settings
        </AppText>
      </TouchableOpacity>
    </View>
  );
};
