import { AppCard, AppContainer, AppText } from "@/components";
import { DynamicHeader } from "@/components/home/Header";
import { useForm } from "@/context/FormContext";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const SendFinalizedFormsScreen: React.FC = () => {
  const { finalizedForms, handleSendForms, loading } = useForm();
  const route = useRouter();
  const onSendAll = async () => {
    Alert.alert(
      "Send Forms",
      `Send ${finalizedForms.length} finalized form(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            try {
              await handleSendForms();
              Alert.alert(
                "Success",
                `${finalizedForms.length} form(s) sent successfully!`
              );
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
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

      {finalizedForms.length === 0 ? (
        <AppCard className="p-8 flex flex-col items-center justify-center">
          <AppText>No finalized forms to send.</AppText>
        </AppCard>
      ) : (
        <View className="flex flex-col gap-3 justify-center px-4 w-full">
          <AppText type="body" className="font-bold tracking-wide mt-6">
            Finalized Forms ({finalizedForms.length})
          </AppText>

          <FlatList
            data={finalizedForms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AppCard className="shadow-sm rounded-md px-2 py-2">
                <AppText type="subheading" className="font-bold tracking-wide">
                  {item.form.id}
                </AppText>
                <AppText type="body" style={{ fontSize: hp(1.4) }}>
                  Finalized: {item.finalizedDate}
                </AppText>
              </AppCard>
            )}
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSendAll}>
            <AppText>Send All Forms ({finalizedForms.length})</AppText>
          </TouchableOpacity>
        </View>
      )}
    </AppContainer>
  );
};
const styles = StyleSheet.create({
  sendButton: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
});

export default SendFinalizedFormsScreen;
