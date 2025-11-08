import { AppCard, AppContainer, AppText } from "@/components";
import Header from "@/components/setting/Header";
import useTheme from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Switch, TextInput, View } from "react-native";

export default function ServerSettings() {
  const [serverUrl, setServerUrl] = useState("");
  const [autoSync, setAutoSync] = useState(false);

  useEffect(() => {
    (async () => {
      const storedUrl = await AsyncStorage.getItem("serverUrl");
      const storedSync = await AsyncStorage.getItem("autoSync");
      if (storedUrl) setServerUrl(storedUrl);
      if (storedSync) setAutoSync(JSON.parse(storedSync));
    })();
  }, []);

  const saveSettings = async (key: string, value: any) => {
    await AsyncStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  };
  const { mode } = useTheme();
  const bgColor = mode === "dark" ? "bg-gray-800" : "bg-white";
  const mergedClassname = clsx(bgColor);

  return (
    <AppContainer className="flex-1">
      <Header title="Server Settings" subtitle="Manage server connections" />
      <View className="p-4">
        <AppText className="text-base font-semibold mb-1">Server URL</AppText>
        <TextInput
          className={`w-full p-3 mb-4 rounded-xl ${mergedClassname} border border-[#0a7ea4] focus:border-blue-500 focus:outline-none transition-colors`}
          value={serverUrl}
          placeholder="https://api.example.com"
          onChangeText={(text) => {
            setServerUrl(text);
            saveSettings("serverUrl", text);
          }}
        />

        <AppCard className="flex-row items-center justify-between  p-3 rounded-xl">
          <AppText className="text-base font-semibold">
            Enable Auto Sync
          </AppText>
          <Switch
            value={autoSync}
            onValueChange={(val) => {
              setAutoSync(val);
              saveSettings("autoSync", val);
            }}
          />
        </AppCard>
      </View>
    </AppContainer>
  );
}
