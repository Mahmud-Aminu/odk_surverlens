import useTheme from "@/theme";
import { FormDefinition, GroupField } from "@/types/FormFieldTypes";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import AppButton from "../common/AppButton";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

type HeaderProps = {
  onInfoPress?: () => void;
  onSettingsPress?: () => void;
  goBack?: () => void;
  onSaveForm?: () => void;
  project?: { name: string, subtitle: string };
  currentRoute?: string;
};

type fillBlankFormProps = {
  onInfoPress?: () => void;
  onSettingsPress?: () => void;
  goBack?: () => void;
  onSaveForm?: () => void;
  project?: string;
  formDefinition: FormDefinition;
};

export default function Header({
  project,
  onInfoPress,
  onSettingsPress,
  goBack // Added support for goBack if passed
}: HeaderProps) {
  const { mode } = useTheme();
  const iconColor = mode === "dark" ? "#e5e7eb" : "#374151";

  return (
    <AppCard className="flex-row justify-between items-center py-4">
      <View className="flex-row items-center gap-2">
        <View>
          {/* <AppText type="tag" className="text-blue-500 font-bold mb-0.5">Project</AppText> */}
          <AppText type="heading" className="font-bold">
            {project?.name}
          </AppText>
          <AppText type="tag" className="font-bold">
            {project?.subtitle}
          </AppText>
        </View>
      </View>

      <View className="flex-row gap-2">

        <TouchableOpacity
          onPress={onInfoPress}
        >
          <AppCard className="p-2 rounded-full shadow-sm border"
          >
            <Feather name="help-circle" size={20} color={iconColor} />
          </AppCard>

        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSettingsPress}
        >
          <AppCard className="p-2 rounded-full shadow-sm border"
          >
            <Feather name="settings" size={20} color={iconColor} />
          </AppCard>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

// Keeping DynamicHeader and FormHeader as placeholders or for specific routes
export function DynamicHeader({
  formDefinition,
  goBack,
  onInfoPress,
  onSettingsPress,
}: fillBlankFormProps) {
  const [currentStep] = useState(0);
  const steps = formDefinition.fields as GroupField[];
  const { mode } = useTheme();
  const iconColor = mode === "dark" ? "#e5e7eb" : "#374151";

  return (
    <View className="flex-row justify-between items-center py-4">
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={goBack} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color={iconColor} />
        </TouchableOpacity>

        <View>
          <AppText className="text-xs text-gray-500 uppercase tracking-wider">
            Step {currentStep + 1} of {steps.length}
          </AppText>
          <AppText type="subheading" className="font-semibold">
            Form Entry
          </AppText>
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity onPress={onInfoPress} className="p-2">
          <Feather name="more-vertical" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function FormHeader({
  currentRoute,
  goBack,
  onInfoPress,
  onSettingsPress,
  onSaveForm,
}: HeaderProps) {
  const { mode } = useTheme();
  const iconColor = mode === "dark" ? "#e5e7eb" : "#374151";

  return (
    <View className="flex-row justify-between items-center py-4 px-2">
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={goBack} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color={iconColor} />
        </TouchableOpacity>
        <AppText type="subheading" className="font-semibold text-lg">
          {currentRoute}
        </AppText>
      </View>

      <View className="flex-row gap-2">
        {onSaveForm && (
          <AppButton
            onPress={onSaveForm}
            variant="primary"
            size="sm"
            className="px-4 py-2"
            leftIcon={<Feather name="save" size={16} color="white" />}
            title="Save"
          />
        )}

      </View>
    </View>
  );
}
