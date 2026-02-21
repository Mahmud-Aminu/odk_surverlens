import { AppCard, AppContainer, AppText } from "@/components";
import { FormHeader } from "@/components/home/Header";
import { useForm } from "@/context/FormContext";
import { odkStorage } from "@/utils/StorageManager";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

type Tab = "blank" | "finalized";

const DeleteFormScreen: React.FC = () => {
  const [tab, setTab] = useState<Tab>("blank");
  const route = useRouter();
  const { localForms, refreshLocalForms, handleDeleteForm } = useForm();

  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<
    {
      formId: string;
      instanceId: string;
      displayName?: string;
      createdAt?: string;
      status?: string;
    }[]
  >([]);

  const loadFinalized = useCallback(async () => {
    setLoading(true);
    try {
      const rows: {
        formId: string;
        instanceId: string;
        displayName?: string;
        createdAt?: string;
        status?: string;
      }[] = [];
      for (const f of localForms) {
        try {
          const inst = await odkStorage.listInstances(f.id);
          for (const i of inst) {
            const status = (i as any).status as string;
            if (
              status === "complete" ||
              status === "submitted" ||
              status === "finalized"
            ) {
              rows.push({
                formId: f.id,
                instanceId:
                  i.instanceId || (i as any).instanceId || (i as any).id || "",
                displayName:
                  (i as any).displayName || i.instanceId || (i as any).id,
                createdAt: (i as any).createdAt || (i as any).updatedAt,
                status,
              });
            }
          }
        } catch (e) {
          console.warn(`Failed to list instances for ${f.id}`, e);
        }
      }
      setInstances(rows);
    } catch (e) {
      console.error("Failed to load finalized instances", e);
    } finally {
      setLoading(false);
    }
  }, [localForms]);

  useEffect(() => {
    if (tab === "finalized") loadFinalized();
  }, [tab, loadFinalized]);

  const onDeleteForm = async (formId: string) => {
    Alert.alert("Delete Form", "Delete this form and all its instances?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await handleDeleteForm(formId);
            setInstances((prev) => prev.filter((r) => r.formId !== formId));
          } catch (e) {
            console.error("Failed to delete form", e);
            Alert.alert("Error", "Failed to delete form");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const onDeleteInstance = async (formId: string, instanceId: string) => {
    Alert.alert("Delete Instance", "Delete this finalized instance?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            // @ts-ignore
            await odkStorage.deleteInstance(formId, instanceId);
            await loadFinalized();
            await refreshLocalForms();
          } catch (e) {
            console.error("Failed to delete instance", e);
            Alert.alert("Error", "Failed to delete instance");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderBlank = ({ item }: { item: any }) => (
    <AppCard className="mb-3 p-4" variant="elevated">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-3">
          <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
            <Feather name="file" size={18} color="#f97316" />
          </View>
          <View className="flex-1">
            <AppText className="font-semibold text-base">{item.title}</AppText>
            <AppText className="text-xs text-gray-500 mt-0.5">
              Version {item.version}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onDeleteForm(item.id)}
          className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center active:bg-red-200"
        >
          <Feather name="trash-2" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  const renderFinalized = ({ item }: { item: any }) => (
    <AppCard className="mb-3 p-4" variant="elevated">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-3">
          <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mr-3">
            <Feather name="check-square" size={18} color="#8b5cf6" />
          </View>
          <View className="flex-1">
            <AppText className="font-semibold text-base">
              {item.displayName || item.instanceId}
            </AppText>
            <AppText className="text-xs text-gray-500 mt-0.5">
              {item.formId}
              {item.createdAt
                ? ` • ${new Date(item.createdAt).toLocaleString()}`
                : ""}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onDeleteInstance(item.formId, item.instanceId)}
          className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center active:bg-red-200"
        >
          <Feather name="trash-2" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  return (
    <AppContainer className="flex-1">
      <FormHeader
        currentRoute="Delete Forms"
        goBack={() => route.replace("/(tabs)")}
      />

      {/* Tab Bar */}
      <View className="flex-row border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => setTab("blank")}
          className={`flex-1 items-center py-3 ${tab === "blank" ? "border-b-2 border-blue-500" : ""}`}
        >
          <AppText
            className={`font-semibold text-sm ${tab === "blank" ? "text-blue-500" : "text-gray-400"}`}
          >
            Blank Forms
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("finalized")}
          className={`flex-1 items-center py-3 ${tab === "finalized" ? "border-b-2 border-blue-500" : ""}`}
        >
          <AppText
            className={`font-semibold text-sm ${tab === "finalized" ? "text-blue-500" : "text-gray-400"}`}
          >
            Finalized Forms
          </AppText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : tab === "blank" ? (
        localForms.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
              <Feather name="download" size={36} color="#9ca3af" />
            </View>
            <AppText className="text-gray-400 text-base text-center">
              No downloaded forms found.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={localForms}
            keyExtractor={(i) => i.id}
            renderItem={renderBlank}
            contentContainerStyle={{ padding: 16 }}
          />
        )
      ) : instances.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
            <Feather name="file-text" size={36} color="#9ca3af" />
          </View>
          <AppText className="text-gray-400 text-base text-center">
            No finalized forms found.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={instances}
          keyExtractor={(i) => `${i.formId}_${i.instanceId}`}
          renderItem={renderFinalized}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </AppContainer>
  );
};

export default DeleteFormScreen;
