import { Feather } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import AppButton from "../common/AppButton";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

type HeaderProps = {
  onInfoPress?: () => void;
  onSettingsPress?: () => void;
  goBack?: () => void;
  onSaveForm?: () => void;
  project?: string;
  currentRoute?: string;
};

export default function Header({
  project,
  onInfoPress,
  onSettingsPress,
}: HeaderProps) {
  return (
    <AppCard className="p-4 shadow-sm flex flex-row justify-between items-center">
      <AppText type="body" className="font-semibold">
        {project}
      </AppText>
      <View className="flex flex-row text-gray-200">
        <TouchableOpacity onPress={onInfoPress} className="p-2">
          <Feather name="info" size={hp(2.5)} color="#e5e7eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettingsPress} className="p-2">
          <Feather name="settings" size={hp(2.5)} color="#e5e7eb" />
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

export function DynamicHeader({
  currentRoute,
  goBack,
  onInfoPress,
  onSettingsPress,
}: HeaderProps) {
  return (
    <AppCard className="p-4 shadow-sm flex flex-row justify-between items-center w-full">
      <View className="flex flex-row items-center gap-2">
        <AppButton onPress={goBack} className="">
          <AppText type="none">
            <Feather name="arrow-left" size={hp(3)} />
          </AppText>
        </AppButton>
        <AppText type="subheading" className="p-2">
          {currentRoute}
        </AppText>
      </View>
      <View className="flex flex-row">
        <TouchableOpacity onPress={onInfoPress} className="p-2">
          <AppText type="none">
            <Feather name="menu" size={hp(3)} />
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettingsPress} className="p-2 ">
          <AppText type="none">
            <Feather name="search" size={hp(3)} />
          </AppText>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}
export function FormHeader({
  currentRoute,
  goBack,
  onInfoPress,
  onSettingsPress,
  onSaveForm,
}: HeaderProps) {
  return (
    <AppCard className="p-4 shadow-sm flex flex-row justify-between items-center w-full">
      <View className="flex flex-row items-center gap-2">
        <AppButton onPress={goBack} className="">
          <AppText type="none">
            <Feather name="arrow-left" size={hp(2.5)} />
          </AppText>
        </AppButton>
        <AppText type="subheading" className="p-2">
          {currentRoute}
        </AppText>
      </View>
      <View className="flex flex-row">
        <TouchableOpacity onPress={onInfoPress} className="p-2">
          <AppText type="none">
            <Feather name="save" size={hp(2.5)} />
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettingsPress} className="p-2">
          <AppText type="none">
            <Feather name="menu" size={hp(2.5)} />
          </AppText>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}
