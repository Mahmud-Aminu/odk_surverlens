import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

const MenuGrid = () => {
  const router = useRouter();
  const [menuItems] = useState([
    {
      id: "draft",
      label: "Drafts",
      icon: <Feather name="check-circle" size={24} color={"#10B981"} />,
      count: 2,
    },
    {
      id: "finalize",
      label: "Ready to send",
      icon: <Feather name="send" size={24} color={"#F59E0B"} />,
      count: 3,
    },
    {
      id: "get",
      label: "Download Form",
      icon: <Feather name="download" size={24} color={"#14b8a6"} />,
    },
    {
      id: "delete",
      label: "Delete Form",
      icon: <Feather name="trash" size={24} color="#ef4444" />,
    },
  ]);

  return (
    <View className="w-full gap-2">
      <View className="grid grid-cols-1 gap-3">
        <AppCard className={`flex-1 shadow rounded-full`}>
          <TouchableOpacity
            onPress={() => router.push(`/forms/fill` as never)}
            className="flex-row justify-center gap-2 items-center p-4 bg-[#3B82F6] rounded-full"
          >
            <Feather name="plus" size={24} />
            <AppText type="body" className="font-semibold tracking-wide">
              Start new form
            </AppText>
          </TouchableOpacity>
        </AppCard>
        {menuItems.map((item) => {
          return (
            <AppCard key={item.id} className={`shadow-sm rounded-full`}>
              <TouchableOpacity
                onPress={() => router.push(`/forms/${item.id}` as never)}
                className="flex-row justify-between items-center p-4"
              >
                <View className="flex-row gap-2 items-center">
                  <View
                    className="p-2 rounded-full mr-3"
                    // style={{ backgroundColor: item.color }}
                  >
                    {item.icon && item.icon}
                  </View>
                  <AppText type="body" className="tracking-wide">
                    {item.label}
                  </AppText>
                </View>

                <View className="items-end">
                  {item.count !== null && (
                    <AppText type="body" className="mt-1">
                      {item.count}
                    </AppText>
                  )}
                </View>
              </TouchableOpacity>
            </AppCard>
          );
        })}
      </View>
    </View>
  );
};

export default MenuGrid;
