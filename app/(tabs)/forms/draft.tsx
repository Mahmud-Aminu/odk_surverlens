import { AppCard, AppContainer, AppText } from "@/components";
import { FormHeader } from "@/components/home/Header";
import { useForm } from "@/context/FormContext";
import {
  deleteFromFileSystem,
  listDraftKeys,
  loadDraft,
} from "@/utils/storage";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

type DraftItem = {
  key: string;
  formId: string;
  instanceId: string;
  storageMode: "filesystem" | "asyncstorage";
  savedAt?: string;
  finalized?: boolean;
  data?: any;
};

const DraftsScreen: React.FC = () => {
  const router = useRouter();
  const { localForms, refreshLocalForms } = useForm();

  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAllDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const fsKeys = await listDraftKeys("filesystem");
      const asKeys = await listDraftKeys("asyncstorage");

      const items: DraftItem[] = [];

      for (const k of fsKeys) {
        try {
          const draft = await loadDraft(k, "filesystem");
          const formId = draft?.meta?.formId || k.replace(/^odk_form_/, "");
          const instanceId = draft?.meta?.instanceId || "";
          items.push({
            key: k,
            formId,
            instanceId,
            storageMode: "filesystem",
            savedAt: draft?.meta?.savedAt || draft?.meta?.startedAt,
            finalized: !!draft?.meta?.finalized,
            data: draft?.data,
          });
        } catch (e) {
          console.warn("Failed to load filesystem draft", k, e);
        }
      }

      for (const k of asKeys) {
        try {
          const draft = await loadDraft(k, "asyncstorage");
          const formId = draft?.meta?.formId || k.replace(/^odk_form_/, "");
          const instanceId = draft?.meta?.instanceId || "";
          if (items.find((it) => it.key === k)) continue;

          items.push({
            key: k,
            formId,
            instanceId,
            storageMode: "asyncstorage",
            savedAt: draft?.meta?.savedAt || draft?.meta?.startedAt,
            finalized: !!draft?.meta?.finalized,
            data: draft?.data,
          });
        } catch (e) {
          console.warn("Failed to load asyncstorage draft", k, e);
        }
      }

      const editable = items.filter((d) => !d.finalized);
      setDrafts(editable);
      console.log("Loaded drafts:", editable);
    } catch (error) {
      console.error("Failed to load drafts", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllDrafts();
    refreshLocalForms();
  }, [loadAllDrafts, refreshLocalForms]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLocalForms();
    await loadAllDrafts();
    setRefreshing(false);
  }, [loadAllDrafts, refreshLocalForms]);

  const handleEdit = (item: DraftItem) => {
    router.push(`/forms/${item.formId}?instanceId=${item.instanceId}`);
  };

  const handleDelete = async (item: DraftItem) => {
    Alert.alert(
      "Delete Draft",
      "Are you sure you want to delete this draft? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (item.storageMode === "filesystem") {
                await deleteFromFileSystem(item.key);
              } else {
                await AsyncStorage.removeItem(item.key);
              }
              await loadAllDrafts();
            } catch (e) {
              console.error("Failed to delete draft", e);
              Alert.alert("Error", "Failed to delete draft");
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: DraftItem }) => {
    const form = localForms.find((f) => f.id === item.formId);
    const title = form?.instanceName || item.formId;

    return (
      <AppCard className="mb-3 p-4" variant="elevated">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1 mr-3">
            <View className="flex-1">
              <AppText className="font-semibold text-base">{title}</AppText>
              <AppText className="text-xs text-gray-500 mt-0.5">
                {item.savedAt
                  ? new Date(item.savedAt).toLocaleString()
                  : "Saved"}
              </AppText>
            </View>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                <Feather name="edit-3" size={18} color="#3b82f6" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              className="px-3 py-2 bg-red-500 rounded-lg active:bg-red-600"
            >
              <Feather name="trash-2" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <AppContainer className="flex-1">
      <FormHeader
        currentRoute="Drafts"
        goBack={() => router.replace("/(tabs)")}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : drafts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
            <Feather name="file-text" size={36} color="#9ca3af" />
          </View>
          <AppText className="text-gray-400 text-base text-center">
            No editable drafts found.
          </AppText>
          <AppText className="text-gray-400 text-xs text-center mt-1">
            Start filling a form and save it as a draft.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={(i) => i.key}
          renderItem={renderItem}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </AppContainer>
  );
};

export default DraftsScreen;
