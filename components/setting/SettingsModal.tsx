import useTheme, { ThemeToggleButton } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

type SettingsModalProps = {
  onClose: () => void;
  openSettings: () => void;
  setOpenEditUserModal: () => void;
  setOpenEditFacility: () => void;
};

const SettingsModal = ({
  onClose,
  openSettings,
  setOpenEditUserModal,
  setOpenEditFacility,
}: SettingsModalProps) => {
  const { theme, mode } = useTheme();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/50 px-6"
        onPress={onClose}
      >
        {/* Stop propagation on card press */}
        <Pressable className="w-full max-w-sm">
          <AppCard className="rounded-2xl w-full p-0" variant="elevated">

            {/* Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <View>
                <AppText className="font-bold text-lg">Quick Settings</AppText>
                <AppText className="text-xs text-gray-500">Manage app preferences</AppText>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={mode === "dark" ? "#e5e7eb" : "#374151"} />
              </TouchableOpacity>
            </View>

            <View className="p-4 gap-4">

              {/* Project Info */}
              <View className="flex-row justify-between items-center bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl">
                <View>
                  <AppText className="font-bold text-blue-800 dark:text-blue-300">Current Project</AppText>
                  <AppText className="text-sm text-blue-600 dark:text-blue-400">AFP Surveillance</AppText>
                </View>
                <ThemeToggleButton />
              </View>

              {/* Main Settings Link */}
              <TouchableOpacity
                onPress={openSettings}
                className="flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-700"
              >
                <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                  <Feather name="settings" size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <AppText className="font-semibold">Full Settings</AppText>
                  <AppText className="text-xs text-gray-500">Configure connection & storage</AppText>
                </View>
                <Feather name="chevron-right" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />

              {/* User & Facility Quick Links */}
              <AppText className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Defaults</AppText>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  setOpenEditUserModal();
                }}
                className="flex-row items-center gap-3 p-3 active:bg-gray-50 dark:active:bg-gray-800 rounded-lg"
              >
                <Feather name="user" size={20} color={mode === "dark" ? "#e5e7eb" : "#374151"} />
                <AppText className="flex-1 font-medium">Edit Default User</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  setOpenEditFacility();
                }}
                className="flex-row items-center gap-3 p-3 active:bg-gray-50 dark:active:bg-gray-800 rounded-lg"
              >
                <Feather name="map-pin" size={20} color={mode === "dark" ? "#e5e7eb" : "#374151"} />
                <AppText className="flex-1 font-medium">Edit Default Facility</AppText>
              </TouchableOpacity>

            </View>
          </AppCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SettingsModal;
