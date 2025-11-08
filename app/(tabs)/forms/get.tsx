import { AppCard, AppContainer, AppText } from "@/components";
import { DynamicHeader } from "@/components/home/Header";
import { useForm } from "@/context/FormContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
const GetBlankFormsScreen: React.FC = () => {
  const [forms, setForms] = useState<any[]>([]);
  const { serverForms, handleDownloadForm, loading } = useForm();
  const route = useRouter();
  const onDownload = async (form: any) => {
    try {
      await handleDownloadForm(form);
      Alert.alert("Success", `${form.name} downloaded successfully!`);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  if (loading) {
    return (
      <View className="flex items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <AppContainer className="flex-1 flex-col gap-3">
      <DynamicHeader
        currentRoute={"Download form"}
        goBack={() => route.replace("/(tabs)")}
        onInfoPress={() => route.push(`/${"help"}` as never)}
        onSettingsPress={() => route.push("/settings")}
      />

      <View className="flex flex-col gap-3 justify-center px-4 w-full">
        <AppText type="body" className="font-bold tracking-wide">
          Available Forms on Server
        </AppText>
        <FlatList
          data={serverForms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppCard className="flex flex-row justify-between items-center my-2 p-3 shadow-sm rounded-md">
              <View style={{ width: wp(60) }} className="flex flex-col">
                <AppText type="subheading" className="font-bold tracking-wide">
                  {item.id}
                </AppText>
                <AppText style={{ fontSize: hp(1.4) }} className="mb-1">
                  {item.title}
                </AppText>
                <AppText type="link">
                  Version {item.version} • {item.lastUpdated}
                </AppText>
              </View>
              <View></View>
              <TouchableOpacity
                className={`p-2 shadow-sm  rounded-md`}
                onPress={() =>
                  setForms((form) => [...form, { form: item, checked: false }])
                }
              >
                <Feather name="arrow-down" size={4} color={"#0a7ea4"} />
              </TouchableOpacity>
            </AppCard>
          )}
        />
      </View>
      <View className="absolute bottom-2 left-0 right-0 w-full flex flex-row justify-evenly">
        <Pressable className="p-4 border border-[#0a7ea4] rounded-full">
          <AppText>Select all</AppText>
        </Pressable>
        <Pressable className="p-4 border rounded-full border-[#0a7ea4]">
          <AppText>Get selected</AppText>
        </Pressable>
        <Pressable className="p-4 border border-[#0a7ea4] rounded-full">
          <AppText>Refresh</AppText>
        </Pressable>
      </View>
    </AppContainer>
  );
};
export default GetBlankFormsScreen;
