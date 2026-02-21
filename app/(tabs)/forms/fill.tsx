import { AppCard, AppContainer, AppText } from "@/components";
import { EmptyFormsState } from "@/components/form/fill/EmptyComponent";
import { FormHeader } from "@/components/home/Header";
import { useForm } from "@/context/FormContext";
import { odkStorage } from "@/utils/StorageManager";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View
} from "react-native";

const FillScreen = () => {
  const { localForms, refreshLocalForms, loadingLocalForms } = useForm();
  const [loadingLocal, setLoadingLocal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Debug helper to check storage stats
    (async () => {
      try {
        const stats = await odkStorage.getStorageStats();
        console.log("Storage stats:", stats);
      } catch (err) {
        console.warn("Failed to read storage stats:", err);
      }
    })();

    const load = async () => {
      try {
        if (mounted) setLoadingLocal(true);
        // Refresh local forms from storage
        await refreshLocalForms();
      } catch (e) {
        console.warn("Failed to refresh local forms:", e);
      } finally {
        if (mounted) setLoadingLocal(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [refreshLocalForms]);

  return (
    <AppContainer className="flex-1">
      <FormHeader
        currentRoute="Local Forms"
        goBack={() => router.replace("/(tabs)")}
      />

      <View className="flex-1 px-4 pt-2">
        {loadingLocal && !localForms.length ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <AppText className="mt-4 text-gray-600">Loading local forms...</AppText>
          </View>
        ) : (
          <>
            <View className="mb-4">
              <AppText type="body" className="font-bold tracking-wide">
                Ready to Fill
              </AppText>
              <AppText className="text-xs text-gray-500">
                {localForms.length} form{localForms.length !== 1 ? "s" : ""} available on device
              </AppText>
            </View>

            <FlatList
              data={localForms}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AppCard className="mb-3 p-0 overflow-hidden" variant="elevated">
                  <TouchableOpacity
                    onPress={() => router.push(`/forms/${item.id}`)}
                    className="p-4 flex-row justify-between items-center active:bg-gray-50 dark:active:bg-gray-800"
                  >
                    <View className="flex-1 mr-4">
                      <AppText type="body" className="font-bold text-base mb-1">
                        {item.title}
                      </AppText>
                      <AppText className="text-xs text-gray-500">
                        v{item.version} • ID: {item.id}
                      </AppText>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <View className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                        <Feather name="edit-3" size={14} color="#2563eb" />
                        <AppText className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
                          Fill
                        </AppText>
                      </View>
                      <Feather name="chevron-right" size={20} color="#9ca3af" />
                    </View>
                  </TouchableOpacity>
                </AppCard>
              )}
              ListEmptyComponent={
                <EmptyFormsState
                  onRefresh={refreshLocalForms}
                  isRefreshing={loadingLocalForms}
                />
              }
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={loadingLocalForms}
                  onRefresh={refreshLocalForms}
                  colors={["#2563eb"]}
                  tintColor="#2563eb"
                />
              }
            />
          </>
        )}
      </View>
    </AppContainer>
  );
};

export default FillScreen;
