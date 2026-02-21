import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

// Components
import { AppContainer, AppText } from "@/components";
import { FormHeader } from "@/components/home/Header";

import { DownloadProgressBar } from "@/components/form/DownloadProgressBar";

// Context and utilities
import { EmptyFormsState } from "@/components/form/EmptyFormState";
import { FormActionButtons } from "@/components/form/FormActionButtons";
import { FormListItem } from "@/components/form/FormListItem";
import { useForm } from "@/context/FormContext";
import { ServerForm } from "@/types/form.types";

interface SelectedForm extends ServerForm {
  checked: boolean;
  downloading?: boolean;
  downloaded?: boolean;
  error?: string;
}

const GetBlankFormsScreen: React.FC = () => {
  const router = useRouter();

  const {
    serverForms,
    loading,
    refreshServerForms,
    handleDownloadForm,
  } = useForm();

  const [selectedForms, setSelectedForms] = useState<Map<string, SelectedForm>>(
    new Map(),
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const newSelectedForms = new Map<string, SelectedForm>();
    serverForms.forEach((form) => {
      const existing = selectedForms.get(form.id);
      newSelectedForms.set(form.id, {
        ...form,
        checked: existing?.checked || false,
        downloaded: existing?.downloaded || false,
        downloading: false,
        error: undefined,
      });
    });
    setSelectedForms(newSelectedForms);
  }, [serverForms]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsRefreshing(true);
        await refreshServerForms?.();
      } catch (e) {
        console.warn("Failed to auto-refresh server forms on mount:", e);
      } finally {
        if (mounted) setIsRefreshing(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [refreshServerForms]);

  const toggleFormSelection = useCallback((formId: string) => {
    setSelectedForms((prev) => {
      const newMap = new Map(prev);
      const form = newMap.get(formId);
      if (form) {
        newMap.set(formId, { ...form, checked: !form.checked });
      }
      return newMap;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedForms((prev) => {
      const newMap = new Map(prev);
      newMap.forEach((form, id) => {
        if (!form.downloaded) {
          newMap.set(id, { ...form, checked: true });
        }
      });
      return newMap;
    });
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedForms((prev) => {
      const newMap = new Map(prev);
      newMap.forEach((form, id) => {
        newMap.set(id, { ...form, checked: false });
      });
      return newMap;
    });
  }, []);

  const downloadSingleForm = useCallback(
    async (form: ServerForm, showAlert = true) => {
      try {
        setSelectedForms((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(form.id);
          if (existing) {
            newMap.set(form.id, {
              ...existing,
              downloading: true,
              error: undefined,
            });
          }
          return newMap;
        });

        await handleDownloadForm(form);

        setSelectedForms((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(form.id);
          if (existing) {
            newMap.set(form.id, {
              ...existing,
              downloading: false,
              downloaded: true,
              checked: false,
            });
          }
          return newMap;
        });

        if (showAlert) {
          Alert.alert("Success", `${form.title} downloaded successfully!`);
        }

        return { success: true, formId: form.id };
      } catch (error: any) {
        setSelectedForms((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(form.id);
          if (existing) {
            newMap.set(form.id, {
              ...existing,
              downloading: false,
              error: error.message || "Download failed",
            });
          }
          return newMap;
        });

        if (showAlert) {
          Alert.alert(
            "Error",
            `Failed to download ${form.title}: ${error.message}`,
          );
        }

        return { success: false, formId: form.id, error: error.message };
      }
    },
    [handleDownloadForm],
  );

  const downloadSelectedForms = useCallback(async () => {
    const selected = Array.from(selectedForms.values()).filter(
      (f) => f.checked && !f.downloaded,
    );

    if (selected.length === 0) {
      Alert.alert(
        "No Forms Selected",
        "Please select at least one form to download.",
      );
      return;
    }

    Alert.alert(
      "Download Forms",
      `Download ${selected.length} form${selected.length > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download",
          onPress: async () => {
            setIsDownloadingBatch(true);
            setBatchProgress({ current: 0, total: selected.length });

            const results = {
              successful: [] as string[],
              failed: [] as { formId: string; error: string }[],
            };

            for (let i = 0; i < selected.length; i++) {
              const form = selected[i];
              setBatchProgress({ current: i + 1, total: selected.length });

              const result = await downloadSingleForm(form, false);

              if (result.success) {
                results.successful.push(result.formId);
              } else {
                results.failed.push({
                  formId: result.formId,
                  error: result.error || "Unknown error",
                });
              }
            }

            setIsDownloadingBatch(false);
            setBatchProgress({ current: 0, total: 0 });

            if (results.failed.length === 0) {
              Alert.alert(
                "Success",
                `Successfully downloaded ${results.successful.length} form${results.successful.length > 1 ? "s" : ""
                }!`,
              );
            } else if (results.successful.length === 0) {
              Alert.alert("Error", "All downloads failed. Please try again.");
            } else {
              Alert.alert(
                "Partial Success",
                `Downloaded: ${results.successful.length}\nFailed: ${results.failed.length
                }\n\nFailed forms:\n${results.failed
                  .map((f) => f.formId)
                  .join("\n")}`,
              );
            }
          },
        },
      ],
    );
  }, [selectedForms, downloadSingleForm]);

  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refreshServerForms?.();
    } catch (error: any) {
      Alert.alert(
        "Refresh Failed",
        error.message || "Could not refresh forms.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshServerForms]);

  const selectedCount = Array.from(selectedForms.values()).filter(
    (f) => f.checked,
  ).length;

  const allSelected =
    selectedForms.size > 0 && selectedCount === selectedForms.size;

  const renderFormItem = useCallback(
    ({ item }: { item: ServerForm }) => {
      const formState = selectedForms.get(item.id);

      return (
        <FormListItem
          form={item}
          isChecked={formState?.checked || false}
          isDownloading={formState?.downloading || false}
          isDownloaded={formState?.downloaded || false}
          error={formState?.error}
          onToggleSelect={toggleFormSelection}
          onDownload={downloadSingleForm}
        />
      );
    },
    [selectedForms, toggleFormSelection, downloadSingleForm],
  );

  if (loading && !isRefreshing) {
    return (
      <AppContainer className="flex-1">
        <FormHeader
          currentRoute="Download Form"
          goBack={() => router.replace("/(tabs)")}
          onInfoPress={() => router.push("/help" as never)}
          onSettingsPress={() => router.push("/settings")}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <AppText className="mt-4 text-gray-600">Loading forms...</AppText>
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer className="flex-1">
      <FormHeader
        currentRoute="Download Form"
        goBack={() => router.replace("/(tabs)")}
        onInfoPress={() => router.push("/help" as never)}
        onSettingsPress={() => router.push("/settings")}
      />

      <View className="flex-1 px-4">
        <View className="flex flex-row justify-between items-center py-3">
          <View>
            <AppText type="body" className="font-bold tracking-wide">
              Available Forms
            </AppText>
            <AppText className="text-xs text-gray-500">
              {serverForms.length} form{serverForms.length !== 1 ? "s" : ""} available
              {selectedCount > 0 && ` • ${selectedCount} selected`}
            </AppText>
          </View>
        </View>

        <DownloadProgressBar
          current={batchProgress.current}
          total={batchProgress.total}
          visible={isDownloadingBatch}
        />

        <FlatList
          data={serverForms}
          keyExtractor={(item) => item.id}
          renderItem={renderFormItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#2563eb"]}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            <EmptyFormsState
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}
          removeClippedSubviews={true}
        />
      </View>

      <FormActionButtons
        selectedCount={selectedCount}
        totalCount={serverForms.length}
        allSelected={allSelected}
        isDownloading={isDownloadingBatch}
        isRefreshing={isRefreshing}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onDownloadSelected={downloadSelectedForms}
        onRefresh={onRefresh}
      />
    </AppContainer>
  );
};

export default GetBlankFormsScreen;
