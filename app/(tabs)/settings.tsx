import { AppCard, AppContainer, AppHapticTab, AppText } from "@/components";
import Header from "@/components/setting/Header";
import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

const themes = [
  { value: "light", icon: <Feather name="sun" size={24} />, label: "Light" },
  { value: "dark", icon: <Feather name="moon" size={24} />, label: "Dark" },
];

export default function Settingas() {
  const { mode, toggleTheme } = useTheme();
  const route = useRouter();

  const settingsRoutes = [
    {
      id: "server",
      title: "Server Settings",
      description: "Configure API endpoints and sync behavior.",
      route: "/(settings)/server" as const,
    },
    {
      id: "ui",
      title: "User Interface",
      description: "Customize the look and feel of the app.",
      route: "/(settings)/ui" as const,
    },
    {
      id: "forms",
      title: "Form Management",
      description: "Manage AFP form schemas and sync settings.",
      route: "/(settings)/forms" as const,
    },
    {
      id: "identity",
      title: "User & Device Identity",
      description: "Control user login and device authorization.",
      route: "/(settings)/identity" as const,
    },
  ];

  return (
    <AppContainer className="flex-1 ">
      <Header title="Settings" />
      <View className="mb-6   pt-10">
        <View className="flex-row space-x-8 w-full px-28">
          {themes.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => toggleTheme()}
              className={`flex-1 rounded-md border`}
              style={{
                borderColor: mode === t.value ? "#0a7ea4" : "gray",
                backgroundColor:
                  mode === t.value ? "transparent" : "transparent",
              }}
            >
              <View className="flex flex-col items-center p-4 w-full h-full">
                <AppText
                  style={{
                    color: mode === t.value ? "#0a7ea4" : undefined,
                  }}
                >
                  {t.icon}
                </AppText>

                <AppText
                  className="mt-2 text-sm font-medium"
                  style={{
                    color: mode === t.value ? "#0a7ea4" : undefined,
                  }}
                >
                  {t.label}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="space-y-3 px-4">
        {settingsRoutes.map((setting, i) => (
          <AppCard key={i} className="rounded-md shadow-sm">
            <AppHapticTab
              className="p-4 rounded-md"
              onPress={() => route.push(setting.route)}
            >
              <AppText className="text-base font-medium">
                {setting.title}
              </AppText>
            </AppHapticTab>
          </AppCard>
        ))}
      </View>
    </AppContainer>
  );
}
