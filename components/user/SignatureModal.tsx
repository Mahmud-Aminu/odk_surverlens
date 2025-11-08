import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";
import { clsx } from "clsx";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

type SignatureModalProps = {
  onClose: () => void;
  formData: {
    name: string;
    sign: string;
    hospital: { hname: string; haddrs: string };
  };
};

const SignatureModal = ({ onClose, formData }: SignatureModalProps) => {
  const handleSubmit = () => {};

  const { theme, mode } = useTheme();
  const bgColor = mode === "light" ? "bg-gray-100" : "bg-gray-900";
  const modalBase = "shadow-sm rounded-3xl w-full rounded-3xl";
  const merdgedStyle = clsx(modalBase);

  return (
    <Modal
      style={{ backgroundColor: theme.colors.background }}
      onRequestClose={onClose}
      transparent
    >
      <Pressable
        onPress={onClose}
        className={`flex items-center h-full absolute z-50 flex-1 justify-center p-4 w-full`}
      >
        <AppCard className={merdgedStyle}>
          {/* header */}
          <View
            className={`sticky top-0 border-b border-[#0a7ea4] px-6 py-4 flex flex-row items-center justify-between`}
          >
            <AppText type="subheading" className="">
              Signature
            </AppText>
            <Pressable
              style={{ backgroundColor: theme.colors.background }}
              onPress={onClose}
              className={`${bgColor} w-8 h-8 rounded-full flex items-center justify-center shadow-sm`}
            >
              <AppText>
                <Feather name="x" size={hp(2.5)} color={"#0a7ea4"} />
              </AppText>
            </Pressable>
          </View>
          <View className="pb-5 px-5 space-y-5">
            {/* signature input */}
            <View className="p-6 items-center overflow-y-auto max-h-[calc(90vh-80px)]">
              <View
                style={{ height: hp(20), width: wp(60) }}
                className="h-12 w-12 border border-[#0a7ea4]"
              />
            </View>
            {/* buttons */}
            <View className="flex flex-row items-center justify-between w-full ">
              <TouchableOpacity
                className={`py-3 w-2/6 rounded-xl bg-[#0a7ea4]`}
                onPress={onClose}
              >
                <AppText className="text-white text-center font-semibold">
                  Cancel
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-3 w-2/6 rounded-xl flex-row justify-center ${
                  formData.sign ? "bg-[#0a7ea4]" : "border border-[#0a7ea4]"
                }`}
                disabled={!formData.sign}
                onPress={handleSubmit}
              >
                <AppText className="text-white text-center font-semibold">
                  Submit
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </AppCard>
      </Pressable>
    </Modal>
  );
};
export default SignatureModal;
