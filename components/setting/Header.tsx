// components/Header.tsx
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

export default function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <AppCard className=" py-3 px-4 flex-row items-center shadow-sm">
      <Pressable
        onPress={() => router.back()}
        className="mr-3 p-2 rounded-full "
      >
        <AppText>
          <Feather name="arrow-left" size={22} color="" />
        </AppText>
      </Pressable>

      <View className="flex-1">
        <AppText type="subheading" className="semi-bold">
          {title}
        </AppText>
        {subtitle && (
          <AppText className="text-xs text-gray-500">{subtitle}</AppText>
        )}
      </View>
    </AppCard>
  );
}
