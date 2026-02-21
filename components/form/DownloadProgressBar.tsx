import { AppText } from "@/components";
import React from "react";
import { View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

/**
 * DownloadProgressBar Component
 *
 * Displays a visual progress bar for batch form downloads.
 * Shows current progress, total count, and a percentage-based progress bar.
 *
 * Features:
 * - Animated progress bar
 * - Current/Total counter
 * - Percentage calculation
 * - Visual feedback with color-coded progress
 * - Accessible labels
 *
 * Used during batch download operations to show users:
 * - How many forms have been downloaded
 * - How many remain
 * - Visual progress representation
 *
 * @param current - Number of forms downloaded so far
 * @param total - Total number of forms to download
 * @param visible - Whether to show the progress bar
 */

interface DownloadProgressBarProps {
  current: number;
  total: number;
  visible: boolean;
}

export const DownloadProgressBar: React.FC<DownloadProgressBarProps> = ({
  current,
  total,
  visible,
}) => {
  // Don't render if not visible or invalid values
  if (!visible || total === 0) return null;

  // Calculate progress percentage (0-100)
  const progressPercentage = Math.min((current / total) * 100, 100);

  return (
    <View
      className="bg-blue-50 p-3 rounded-md mb-3"
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: total,
        now: current,
      }}
      accessibilityLabel={`Downloading forms: ${current} of ${total} complete`}
    >
      {/* 
        Progress Header
        Displays the download status text and numerical progress
      */}
      <View className="flex flex-row justify-between items-center mb-2">
        <AppText className="font-semibold text-gray-700">
          Downloading Forms...
        </AppText>
        <AppText className="text-gray-600">
          {current} / {total}
        </AppText>
      </View>

      {/* 
        Progress Bar Track
        The background bar that shows the full range
      */}
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* 
          Progress Bar Fill
          The filled portion that represents completed progress
          Width is calculated as a percentage of total
          
          Styling:
          - Blue color (#3b82f6) for active progress
          - Smooth transition (could add animation)
          - Rounded to match track
        */}
        <View
          className="h-full bg-blue-500 rounded-full"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </View>

      {/* 
        Optional: Percentage Display
        Shows exact percentage completion
      */}
      <AppText
        style={{ fontSize: hp(1.2) }}
        className="text-center mt-1 text-gray-600"
      >
        {progressPercentage.toFixed(0)}% Complete
      </AppText>
    </View>
  );
};
