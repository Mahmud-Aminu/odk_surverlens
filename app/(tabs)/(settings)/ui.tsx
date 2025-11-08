import Header from "@/components/setting/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";

export default function UISettings() {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    (async () => {
      const storedDark = await AsyncStorage.getItem("darkMode");
      const storedFont = await AsyncStorage.getItem("fontSize");
      if (storedDark) setDarkMode(JSON.parse(storedDark));
      if (storedFont) setFontSize(Number(storedFont));
    })();
  }, []);

  const save = async (key: string, value: any) => {
    await AsyncStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Header title="User Interface" subtitle="Visual preferences and themes" />
      <View className="p-4">
        <View className="flex-row items-center justify-between bg-white p-3 rounded-xl mb-4">
          <Text className="text-base font-semibold">Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={(v) => {
              setDarkMode(v);
              save("darkMode", v);
            }}
          />
        </View>

        <View className="bg-white p-3 rounded-xl">
          <Text className="text-base font-semibold mb-2">
            Font Size: {fontSize}
          </Text>
          <Slider
            minimumValue={12}
            maximumValue={22}
            step={1}
            value={fontSize}
            onValueChange={(v) => {
              setFontSize(v);
              save("fontSize", v);
            }}
          />
        </View>
      </View>
    </View>
  );
}
