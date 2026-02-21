import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";
import { Modal, TouchableOpacity, View } from "react-native";
import AppButton from "../common/AppButton";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

type SignatureModalProps = {
  onClose: () => void;
  formData: {
    name: string;
    sign: string;
    hospital: { hname: string; haddrs: string };
  };
  setFormData?: (data: any) => void;
};

const SignatureModal = ({ onClose, formData, setFormData }: SignatureModalProps) => {

  const handleSubmit = () => {
    // In a real app, this would capture the drawing.
    // For now, we simulate signing by setting a dummy string if not present
    if (setFormData) {
      setFormData({ ...formData, sign: "signed_content_placeholder" });
    }
    onClose();
  };

  const { theme, mode } = useTheme();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <AppCard className="w-full max-w-md rounded-2xl p-0" variant="elevated">

          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <AppText className="font-bold text-lg">Signature</AppText>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={mode === "dark" ? "#e5e7eb" : "#374151"} />
            </TouchableOpacity>
          </View>

          {/* Canvas Area (Placeholder) */}
          <View className="p-6 items-center justify-center bg-gray-50 dark:bg-gray-900/50">
            <View className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center">
              <Feather name="edit-3" size={32} color={mode === "dark" ? "#4b5563" : "#9ca3af"} />
              <AppText className="text-gray-400 mt-2 text-sm">Draw signature here</AppText>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row p-4 gap-3 border-t border-gray-100 dark:border-gray-800">
            <AppButton
              variant="outline"
              onPress={onClose}
              className="flex-1"
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onPress={handleSubmit}
              className="flex-1"
            >
              Save Signature
            </AppButton>
          </View>

        </AppCard>
      </View>
    </Modal>
  );
};

export default SignatureModal;
