import { AppCard, AppText } from "@/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { DraftForm, STORAGE_KEYS, useForm } from "../../../context/FormContext";

const EditSavedFormsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [draftForms, setDraftFormsState] = useState<DraftForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { handleOpenForm, handleDeleteDraft } = useForm();
  useEffect(() => {
    getDraftsForms();
  }, []);

  const getDraftsForms = useCallback(async () => {
    try {
      setLoading(true);
      const storedForms = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_FORMS);
      if (storedForms) {
        const parsedForms: DraftForm[] = JSON.parse(storedForms);
        setDraftFormsState(parsedForms);
      }
    } catch (error) {
      console.error("Error fetching downloaded forms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onEditDraft = (draft: any) => {
    handleOpenForm(draft.form, draft, true);
    navigation.navigate("FormEntry");
  };

  const onDeleteDraft = async (draftId: string, formName: string) => {
    Alert.alert(
      "Delete Draft",
      `Are you sure you want to delete "${formName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await handleDeleteDraft(draftId);
              Alert.alert("Success", "Draft deleted");
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
    <View className="flex flex-col gap-3 justify-center">
      {draftForms.length === 0 ? (
        <AppCard className="p-8 flex flex-col items-center justify-center">
          <AppText>No draft forms available.</AppText>
        </AppCard>
      ) : (
        <View className="flex flex-col gap-3 justify-center px-4 w-full">
          <AppText type="body" className="font-bold tracking-wide mt-6">
            Draft Forms ({draftForms.length})
          </AppText>
          <FlatList
            data={draftForms}
            keyExtractor={(item) => item.draftId}
            renderItem={({ item }) => (
              <AppCard className="shadow-sm rounded-md px-2 py-2">
                <TouchableOpacity
                  className="p-4 grid grid-cols-1 gap-2"
                  onPress={() => onEditDraft(item)}
                >
                  <AppText
                    type="subheading"
                    className="font-bold tracking-wide"
                  >
                    {item.form.id} - Draft
                  </AppText>
                  <AppText type="body" style={{ fontSize: hp(1.4) }}>
                    {item.form.title}
                  </AppText>
                  <AppText type="body" style={{ fontSize: hp(1.4) }}>
                    Saved: {item.savedDate}
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteDraft(item.draftId, item.form.id)}
                >
                  <AppText style={styles.deleteButtonText}>Delete</AppText>
                </TouchableOpacity>
              </AppCard>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default EditSavedFormsScreen;

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
