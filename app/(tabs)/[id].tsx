// import DeleteFormScreen from "@/app/(tabs)/(forms)/delete";
// import InfoScreen from "@/app/(tabs)/(forms)/info";
import { AppContainer } from "@/components";
import { DynamicHeader } from "@/components/home/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function FormDetails() {
  const [activeView, setActiveView] = useState<string>("");
  const { id } = useLocalSearchParams();
  const route = useRouter();
  const label = id;
  useEffect(() => {
    setActiveView(label.toString());
  }, [label]); // 👈 grab the dynamic id
  const getCurrentRoute = () => {
    if (activeView === "fill") {
      return "Fill New Form";
    } else if (activeView === "edit") {
      return "Edit Save Form";
    } else if (activeView === "send") {
      return "Send Finalized Form";
    } else if (activeView === "get") {
      return "Get New Blank Form";
    } else if (activeView === "delete") {
      return "Delete Form";
    } else if (activeView === "help") {
      return "Get Help";
    }
  };

  return (
    <AppContainer className="flex-1 items-center">
      <DynamicHeader
        currentRoute={getCurrentRoute()}
        goBack={() => route.replace("/(tabs)")}
        onInfoPress={() => route.push(`/${"help"}` as never)}
        onSettingsPress={() => route.push("/settings")}
      />

      <View className="rounded-l py-6 px-4 w-full">
        <View className="space-y-4">
          {/* {activeView === "fill" && <FillBlankFormsScreen navigation={route} />}

          {activeView === "edit" && <EditSavedFormsScreen navigation={route} />}
          {activeView === "send" && <SendFinalizedFormsScreen />}

          {activeView === "get" && <GetBlankFormsScreen />} */}

          {/* {activeView === "delete" && <DeleteFormScreen />}

          {activeView === "help" && <InfoScreen />} */}
        </View>
      </View>
    </AppContainer>
  );
}
