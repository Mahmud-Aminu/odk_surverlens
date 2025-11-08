import { AppCard, AppContainer, AppText } from "@/components";
import { DynamicHeader } from "@/components/home/Header";
import { STORAGE_KEYS, useForm } from "@/context/FormContext";
import { FormSchema } from "@/odk/type/FormType";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const FillBlankFormsScreen = () => {
  const [downloadedForms, setDownloadedFormsState] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const route = useRouter();

  const { handleOpenForm } = useForm();

  useEffect(() => {
    getDownloadedForms();
  }, []);

  const getDownloadedForms = useCallback(async () => {
    try {
      setLoading(true);
      const storedForms = await AsyncStorage.getItem(
        STORAGE_KEYS.DOWNLOADED_FORMS
      );
      if (storedForms) {
        const parsedForms: FormSchema[] = JSON.parse(storedForms);
        setDownloadedFormsState(parsedForms);
      }
    } catch (error) {
      console.error("Error fetching downloaded forms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onOpenForm = (form: any) => {
    handleOpenForm(form);
    router.push({
      pathname: `/forms/${form.id}` as never,
      params: { form: JSON.stringify(form) },
    });
  };

  if (loading) {
    return (
      <View className="flex items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <AppContainer className="flex-1 w-full">
      <DynamicHeader
        currentRoute={"Start a new form"}
        goBack={() => route.replace("/(tabs)")}
        onInfoPress={() => route.push(`/${"help"}` as never)}
        onSettingsPress={() => route.push("/settings")}
      />

      {downloadedForms.length === 0 ? (
        <AppCard className="p-8 flex flex-col items-center justify-center">
          <AppText>No forms available. Please download forms first.</AppText>
        </AppCard>
      ) : (
        <View className="flex flex-col gap-3 justify-center px-4 w-full">
          <AppText type="body" className="font-bold tracking-wide mt-6">
            Downloaded Forms ({downloadedForms.length})
          </AppText>
          <FlatList
            data={downloadedForms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AppCard className="flex flex-row gap-3 itemms-center backdrop:shadow-sm rounded-md p-4 mb-2">
                <View className="items-center my-auto">
                  <AppText>
                    <Feather name="file" size={hp(3)} />
                  </AppText>
                </View>
                <TouchableOpacity
                  className="grid grid-cols-1 gap-1"
                  onPress={() => onOpenForm(item)}
                >
                  <AppText type="body" className="font-bold tracking-wide">
                    {item.title}
                  </AppText>
                  <AppText type="link">ID: {item.id}</AppText>
                  <AppText type="link">
                    Version {item.version} • {item.lastUpdated}
                  </AppText>
                </TouchableOpacity>
              </AppCard>
            )}
          />
        </View>
      )}
    </AppContainer>
  );
};
export default FillBlankFormsScreen;
