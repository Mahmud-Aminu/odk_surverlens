import Header from "@/components/setting/Header";
import { Pressable, Text, View } from "react-native";

export default function IdentitySettings() {
  const handleReset = () => alert("Device identity reset successfully.");
  const handleLogout = () => alert("Logged out successfully.");

  return (
    <View className="flex-1 bg-gray-100">
      <Header
        title="User & Device Identity"
        subtitle="Authentication & device control"
      />
      <View className="p-4">
        <Pressable
          onPress={handleReset}
          className="bg-white p-4 rounded-xl mb-3 shadow-sm"
        >
          <Text className="text-lg font-semibold text-red-500">
            Reset Device ID
          </Text>
          <Text className="text-sm text-gray-500">
            Regenerate new device identity.
          </Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <Text className="text-lg font-semibold text-red-500">Logout</Text>
          <Text className="text-sm text-gray-500">
            Sign out from this device.
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
