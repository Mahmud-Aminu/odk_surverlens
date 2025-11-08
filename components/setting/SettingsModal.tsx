import useTheme, { ThemeToggleButton } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { clsx } from "clsx";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
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
  const bgColor = mode === "light" ? "bg-gray-100" : "bg-gray-900";
  const modalBase = "shadow w-full px-8 py-8 rounded-3xl gap-2";
  const merdgedStyle = clsx(modalBase);

  return (
    <Modal
      style={{
        backgroundColor: theme.colors.background,
      }}
      onRequestClose={onClose}
      transparent
    >
      <Pressable
        onPress={onClose}
        style={{ width: wp(70) }}
        className={`flex items-center h-full z-50 flex-1 justify-center w-full mx-auto`}
      >
        <AppCard className={merdgedStyle}>
          <TouchableOpacity className="absolute top-3 left-3" onPress={onClose}>
            <Feather name="x" size={hp(3)} color={theme.colors.text} />
          </TouchableOpacity>
          <View className="flex flex-row justify-between py-4 items-center gap-3">
            <AppText>Projects</AppText>
            <ThemeToggleButton />
          </View>
          <AppText>AFP survelence</AppText>
          <TouchableOpacity
            onPress={openSettings}
            className="p-4 flex flex-row gap-2 bg-[#3B82F6] rounded-full"
          >
            <Feather name="settings" size={hp(2.5)} />
            <AppText>Settings</AppText>
          </TouchableOpacity>
          <View
            style={{ borderColor: theme.colors.background }}
            className="w-full border-t h-1 my-2"
          />
          <View className="flex flex-col gap-2 rounded-full">
            <TouchableOpacity
              onPress={setOpenEditUserModal}
              className="flex flex-row gap-2 rounded-full"
            >
              <Feather name="user" size={hp(2.5)} />
              <AppText>Default User</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={setOpenEditFacility}
              className="flex flex-row gap-2 rounded-full"
            >
              <Feather name="lock" size={hp(2.5)} />
              <AppText>Default Facility</AppText>
            </TouchableOpacity>
          </View>
        </AppCard>
      </Pressable>
    </Modal>
  );
};
export default SettingsModal;
