import { AppCard, AppContainer, AppText } from "@/components";
import Header from "@/components/setting/Header";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

export default function IdentitySettings() {
  const handleReset = () => alert("Device identity reset successfully.");
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of this device?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login");
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <AppContainer className="flex-1">
      <Header
        title="User & Device Identity"
        subtitle="Authentication & device control"
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="gap-4 mt-4">
          <AppText className="font-bold text-gray-500 mb-1 uppercase tracking-wider text-xs ml-1">
            Device Management
          </AppText>

          <AppCard className="p-0 overflow-hidden" variant="elevated">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-gray-800"
            >
              <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-4">
                <Feather name="refresh-cw" size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <AppText className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  Reset Device ID
                </AppText>
                <AppText className="text-xs text-gray-500 leading-5">
                  Regenerate new device identity.
                </AppText>
              </View>
              <Feather name="chevron-right" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </AppCard>

          <AppText className="font-bold text-gray-500 mb-1 uppercase tracking-wider text-xs ml-1 mt-4">
            Account
          </AppText>

          <AppCard className="p-0 overflow-hidden" variant="elevated">
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center p-4 active:bg-red-50 dark:active:bg-red-900/10"
            >
              <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-4">
                <Feather name="log-out" size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <AppText className="font-semibold text-lg text-red-600 dark:text-red-400">
                  Logout
                </AppText>
                <AppText className="text-xs text-gray-500 leading-5">
                  Sign out from this device.
                </AppText>
              </View>
              <Feather name="chevron-right" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </AppCard>
        </View>
      </ScrollView>
    </AppContainer>
  );
}
