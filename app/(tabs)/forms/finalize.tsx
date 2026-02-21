import { AppButton, AppCard, AppContainer, AppText } from "@/components";
import { FormHeader } from "@/components/home/Header";
import { sendDocument } from "@/services/SubmissionService";
import { odkStorage } from "@/utils/StorageManager";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";

interface FinalizedForm {
  form: any;
  instance: any;
  displayName?: string;
}

const SendFinalizedFormsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [finalizedForms, setFinalizedForms] = useState<FinalizedForm[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const route = useRouter();

  const interpolateInstanceName = (template: string, formData: any): string => {
    if (!template) return formData?.displayName || "Form Instance";

    // Replace ${variable} with values from formData
    return template.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      return formData?.[varName] || match;
    });
  };

  const loadFinalizedForms = async () => {
    try {
      setLoading(true);
      // Load all forms and their instances, then filter finalized/complete instances
      const forms = await odkStorage.listForms(true); // Force rescan to get fresh metadata
      const allFinalized: FinalizedForm[] = [];

      for (const f of forms) {
        const instances = await odkStorage.listInstances(f.formId);
        for (const inst of instances) {
          if (inst.status === "complete" || inst.status === "submitted") {
            let displayName = inst.displayName;
            let instanceNameTemplate = f.instanceName;

            try {
              // If instanceName not in metadata, try to read from form definition
              if (!instanceNameTemplate) {
                const formDefResult = await odkStorage.getFormDefinition(
                  f.formId,
                );
                if (formDefResult && formDefResult.type === "json") {
                  try {
                    const formDef = JSON.parse(formDefResult.content);
                    if (formDef.metadata?.instanceName) {
                      instanceNameTemplate = formDef.metadata.instanceName;
                      console.log(instanceNameTemplate)
                    }
                  } catch (e) {
                    // JSON parse failed - skip
                  }
                }
              }

              // Get instance data and interpolate the template
              const instanceData = await odkStorage.getInstanceData(
                f.formId,
                inst.instanceId,
              );
              if (instanceData && instanceNameTemplate) {
                const parsedData = JSON.parse(instanceData);
                displayName = interpolateInstanceName(
                  instanceNameTemplate,
                  parsedData,
                );
              }
            } catch (e) {
              console.warn("Failed to interpolate instance name:", e);
            }

            allFinalized.push({ form: f, instance: inst, displayName });
          }
        }
      }

      setFinalizedForms(allFinalized);
    } catch (e) {
      console.warn("Failed to load finalized forms:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinalizedForms();
  }, []);

  const handleSend = async (form: any, instance: any) => {
    const instanceId = instance.instanceId;
    setSendingId(instanceId);

    try {
      // Log the form data before sending
      const formData = await odkStorage.getInstanceData(
        form.formId,
        instanceId,
      );

      // Placeholder: actual send implementation depends on server config
      const parsed = JSON.parse(formData || "{}");
      const data = JSON.stringify(parsed.data, null, 2);

      await sendDocument(data)

      // Mark instance as submitted locally for now
      await odkStorage.updateInstanceStatus(
        form.formId,
        instanceId,
        "submitted",
      );

      Alert.alert("Success", "Form submitted successfully.");

      // Refresh the list
      // await loadFinalizedForms();
    } catch (error: any) {
      Alert.alert("Error", error.message || String(error));
    } finally {
      setSendingId(null);
    }
  };

  if (loading && !finalizedForms.length) {
    return (
      <AppContainer className="flex-1">
        <FormHeader
          currentRoute={"Start a new form"}
          goBack={() => route.replace("/(tabs)")}
          onInfoPress={() => route.push(`/${"help"}` as never)}
          onSettingsPress={() => route.push("/settings")}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer className="flex-1 w-full">
      <FormHeader
        currentRoute={"Start a new form"}
        goBack={() => route.replace("/(tabs)")}
        onInfoPress={() => route.push(`/${"help"}` as never)}
        onSettingsPress={() => route.push("/settings")}
      />

      {finalizedForms.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
            <Feather name="file-text" size={36} color="#9ca3af" />
          </View>
          <AppText className="text-gray-400 text-base text-center">
            No finalized form Found.
          </AppText>
          <AppText className="text-gray-400 text-xs text-center mt-1">
            Start filling a form and finalized it or finalized a draft form.
          </AppText>
        </View>
      ) : (
        <View className="flex flex-col gap-3 justify-center px-4 w-full flex-1">
          <AppText type="body" className="font-bold tracking-wide mt-6 mb-2">
            Finalized Forms ({finalizedForms.length})
          </AppText>

          <FlatList
            data={finalizedForms}
            keyExtractor={(item) => item.instance.instanceId}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <AppCard className="px-4 py-4 mb-3">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1">
                    <AppText
                      type="subheading"
                      className="font-bold tracking-wide text-lg text-gray-900 dark:text-gray-100"
                    >
                      {item.displayName}
                    </AppText>
                    <AppText type="body" className="text-xs mt-1">
                      Finalized:{" "}
                      {new Date(item.instance.createdAt).toLocaleDateString()}
                    </AppText>
                  </View>
                </View>

                <AppButton
                  onPress={() => handleSend(item.form, item.instance)}
                  isLoading={sendingId === item.instance.instanceId}
                  disabled={
                    sendingId !== null && sendingId !== item.instance.instanceId
                  }
                  variant="primary"
                  size="sm"
                  title="Send Form"
                />
              </AppCard>
            )}
          />
        </View>
      )}
    </AppContainer>
  );
};

export default SendFinalizedFormsScreen;
