import { useForm } from "@/context/FormContext";
import useTheme from "@/theme";
import { odkStorage } from "@/utils/StorageManager";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

const MenuGrid = () => {
  const router = useRouter();
  const { mode } = useTheme();
  const { localForms } = useForm();

  const [draftCount, setDraftCount] = useState(0);
  const [finalizedCount, setFinalizedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const calculateCounts = async () => {
        let drafts = 0;
        let finalized = 0;

        for (const form of localForms) {
          try {
            const instances = await odkStorage.listInstances(form.id);
            for (const inst of instances) {
              if (inst.status === "incomplete") {
                drafts++;
              } else if (
                inst.status === "complete" ||
                inst.status === "submitted"
              ) {
                finalized++;
              }
            }
          } catch (e) {
            console.warn(`Failed to count instances for ${form.id}:`, e);
          }
        }

        setDraftCount(drafts);
        setFinalizedCount(finalized);
      };

      calculateCounts();
    }, [localForms])
  );

  const menuItems = [
    {
      id: "draft",
      label: "Drafts",
      icon: <Feather name="edit-3" size={24} color={"#10B981"} />,
      count: draftCount,
    },
    {
      id: "finalize",
      label: "Ready to Send",
      icon: <Feather name="send" size={24} color={"#F59E0B"} />,
      count: finalizedCount,
    },
    {
      id: "get",
      label: "Download Form",
      icon: <Feather name="download" size={24} color={"#0ea5e9"} />,
      count: null,
    },
    {
      id: "delete",
      label: "Delete Form",
      icon: <Feather name="trash-2" size={24} color="#ef4444" />,
      count: null,
    },
  ];

  return (
    <View className="w-full gap-4">
      <View className="grid grid-cols-1 gap-4">
        {/* Main Action Cards */}
        <View className="flex-row gap-3">
          <AppCard className="flex-1 bg-blue-600 border-blue-600 active:bg-blue-700 p-0 overflow-hidden">
            <TouchableOpacity
              onPress={() => router.push(`/forms/fill` as never)}
              className="items-center justify-center p-4 py-6"
              activeOpacity={0.8}
            >
              <View className="bg-white/20 p-3 rounded-full mb-2">
                <Feather name="plus" size={24} color="white" />
              </View>
              <AppText
                type="body"
                className="font-semibold text-white text-center"
              >
                New Form
              </AppText>
            </TouchableOpacity>
          </AppCard>

          <AppCard className="flex-1 bg-indigo-600 border-indigo-600 active:bg-indigo-700 p-0 overflow-hidden">
            <TouchableOpacity
              onPress={() => router.push(`/forms/weeklyForms` as never)}
              className="items-center justify-center p-4 py-6"
              activeOpacity={0.8}
            >
              <View className="bg-white/20 p-3 rounded-full mb-2">
                <Feather name="calendar" size={24} color="white" />
              </View>
              <AppText
                type="body"
                className="font-semibold text-white text-center"
              >
                Weekly
              </AppText>
            </TouchableOpacity>
          </AppCard>
        </View>

        {/* List Items */}
        <View className="gap-3">
          {menuItems.map((item) => (
            <AppCard
              key={item.id}
              className="p-0 overflow-hidden"
              variant="elevated"
            >
              <TouchableOpacity
                onPress={() => router.push(`/forms/${item.id}` as never)}
                className="flex-row justify-between items-center p-4 active:bg-gray-50 dark:active:bg-gray-800"
              >
                <View className="flex-row gap-3 items-center">
                  <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                    {item.icon}
                  </View>
                  <AppText type="body" className="font-medium text-lg">
                    {item.label}
                  </AppText>
                </View>

                <View className="flex-row items-center gap-2">
                  {item.count !== null && (
                    <View className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      <AppText
                        type="body"
                        className="text-xs font-bold text-gray-600 dark:text-gray-300"
                      >
                        {item.count}
                      </AppText>
                    </View>
                  )}
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={mode === "dark" ? "#4b5563" : "#9ca3af"}
                  />
                </View>
              </TouchableOpacity>
            </AppCard>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MenuGrid;
