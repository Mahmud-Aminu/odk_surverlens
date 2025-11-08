import Header from "@/components/setting/Header";
import { Pressable, Text, View } from "react-native";

export default function FormManagement() {
  const handleSync = () => alert("Form schemas synced successfully!");
  const handleUpload = () => alert("New form uploaded!");

  return (
    <View className="flex-1 bg-gray-100">
      <Header title="Form Management" subtitle="Control AFP form schemas" />
      <View className="p-4">
        <Pressable
          onPress={handleSync}
          className="bg-white p-4 rounded-xl mb-3 shadow-sm"
        >
          <Text className="text-lg font-semibold text-blue-600">
            Sync Forms
          </Text>
          <Text className="text-sm text-gray-500">
            Download latest schema updates.
          </Text>
        </Pressable>

        <Pressable
          onPress={handleUpload}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <Text className="text-lg font-semibold text-blue-600">
            Upload Form
          </Text>
          <Text className="text-sm text-gray-500">
            Manually upload new form schema.
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
