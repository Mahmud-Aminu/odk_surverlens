import { AppCard, AppContainer, AppText } from "@/components";
import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";

const themes = [
  { value: "light", icon: "sun", label: "Light" },
  { value: "dark", icon: "moon", label: "Dark" },
];

export default function SettingsScreen() {
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();

  const settingsRoutes = [
    {
      id: "server",
      title: "Server Settings",
      description: "Configure API endpoints and sync behavior.",
      route: "/(settings)/server" as const,
      icon: "server",
      color: "#3b82f6", // blue-500
    },
    {
      id: "identity",
      title: "User & Device Identity",
      description: "Control user login and device authorization.",
      route: "/(settings)/identity" as const,
      icon: "shield",
      color: "#f59e0b", // amber-500
    },
  ];

  return (
    <AppContainer className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-8 mt-4">
          <AppText type="heading" className="text-3xl font-bold mb-2">
            Settings
          </AppText>
          <AppText className="text-gray-500 text-base">
            Manage your preferences and application configuration.
          </AppText>
        </View>

        {/* Theme Switcher */}
        <View className="mb-8">
          <AppText className="font-bold text-gray-500 mb-3 uppercase tracking-wider text-xs ml-1">
            Appearance
          </AppText>
          <View className="flex-row gap-4">
            {themes.map((t) => {
              const isActive = mode === t.value;
              return (
                <AppCard
                  key={t.value}
                  className={`flex-1 p-0 overflow-hidden ${isActive ? "border-blue-500 border-2" : ""}`}
                  variant="elevated"
                >
                  <TouchableOpacity
                    onPress={() => mode !== t.value && toggleTheme()}
                    className={`items-center justify-center p-4 ${isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={t.icon as any}
                      size={24}
                      color={isActive ? "#3b82f6" : "#9ca3af"}
                    />
                    <AppText
                      className={`mt-2 font-semibold ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`}
                    >
                      {t.label}
                    </AppText>
                  </TouchableOpacity>
                </AppCard>
              );
            })}
          </View>
        </View>

        {/* General Settings */}
        <View className="gap-4">
          <AppText className="font-bold text-gray-500 mb-1 uppercase tracking-wider text-xs ml-1">
            General
          </AppText>
          {settingsRoutes.map((setting) => (
            <AppCard key={setting.id} className="p-0 overflow-hidden" variant="elevated">
              <TouchableOpacity
                onPress={() => router.push(setting.route)}
                className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-gray-800"
                activeOpacity={0.6}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${setting.color}20` }} // 20% opacity
                >
                  <Feather name={setting.icon as any} size={20} color={setting.color} />
                </View>
                <View className="flex-1">
                  <AppText className="font-semibold text-lg">{setting.title}</AppText>
                  <AppText className="text-xs text-gray-500 leading-5">
                    {setting.description}
                  </AppText>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={mode === "dark" ? "#6b7280" : "#d1d5db"}
                />
              </TouchableOpacity>
            </AppCard>
          ))}
        </View>
      </ScrollView>
    </AppContainer>
  );
}
