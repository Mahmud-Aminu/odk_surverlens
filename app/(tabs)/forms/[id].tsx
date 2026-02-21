import { AppContainer, AppText } from "@/components";
import FormRenderer from "@/components/form/fill/FormRenderer";
import { FormHeader } from "@/components/home/Header";
import { useFormDraft } from "@/hooks/useFormDraft";
import {
  FormData,
  FormDefinition,
  FormField,
  GroupField,
  ValidationError,
} from "@/types/FormFieldTypes";
import { odkStorage } from "@/utils/StorageManager";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";

// ... (keep helper functions like parseAndTransform if they are not exported elsewhere)
// Since I cannot move `parseAndTransform` easily without creating a new file, I will keep it here
// or I can assume it should be in a utility. For now I'll keep it to avoid breaking logic.

const parseAndTransform = (rawForm: any): FormDefinition => {
  const fields: FormField[] = [];
  const groupStack: GroupField[] = [];

  const surveyArray =
    rawForm.survey ||
    rawForm.questions ||
    rawForm.form_fields ||
    rawForm.fields ||
    [];

  surveyArray.forEach((field: any) => {
    if (field.type === "begin_group") {
      const group: GroupField = {
        type: "group",
        name: field.name,
        label: field.label,
        fields: [],
      };
      if (groupStack.length > 0) {
        groupStack[groupStack.length - 1].fields.push(group);
      } else {
        fields.push(group);
      }
      groupStack.push(group);
    } else if (field.type === "end_group") {
      groupStack.pop();
    } else {
      // Simple transformation for choices if they exist in a flat format
      const newField: FormField = {
        ...field,
        ...(field.choices && {
          choices: field.choices.map((c: any) => ({
            value: c.name,
            label: c.label,
          })),
        }),
      };
      if (groupStack.length > 0) {
        groupStack[groupStack.length - 1].fields.push(newField);
      } else {
        fields.push(newField);
      }
    }
  });

  return {
    id: rawForm.form_id || rawForm.id || rawForm.formID,
    title: rawForm.title,
    version: rawForm.version,
    fields: fields,
  };
};

const FormByIdScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { id, instanceId } = useLocalSearchParams<{
    id: string;
    instanceId?: string;
  }>();
  const fid = typeof id === "string" && id.length > 0 ? id : "";

  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [isFinalizing, setIsFinalizing] = useState(false);

  const placeholderIdRef = useRef(
    `__noop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  );
  const hookFormId = fid || placeholderIdRef.current;

  const {
    draftData,
    draftMeta,
    updateFields,
    finalizeDraft,
    saveNow,
    isFinalized,
    isSaving,
  } = useFormDraft(hookFormId, instanceId, { storageMode: "filesystem" });

  const loadFormDefinition = useCallback(async () => {
    try {
      setLoading(true);

      const metadata = await odkStorage.getFormMetadata(fid);
      if (!metadata) {
        Alert.alert("Error", "Form not found");
        router.back();
        return;
      }

      const def = await odkStorage.getFormDefinition(fid);
      if (!def) {
        Alert.alert("Error", "Form definition not found");
        router.back();
        return;
      }

      if (def.type === "json") {
        // Logic to parse JSON form definition
        // (Simplified for brevity, assuming standard ODK structure or the custom parser above)
        try {
          const jsonContent =
            typeof def.content === "string"
              ? JSON.parse(def.content)
              : def.content;

          // ... (keep the finding logic from original file)
          const findForm = (node: any): any => {
            if (!node) return null;
            if (typeof node === "object" && !Array.isArray(node)) {
              const nodeId = node.id || node.formID || node.form_id;
              if (nodeId === fid) return node;
              for (const v of Object.values(node)) {
                const found = findForm(v);
                if (found) return found;
              }
            }
            if (Array.isArray(node)) {
              for (const item of node) {
                const found = findForm(item);
                if (found) return found;
              }
            }
            return null;
          };

          const rawForm = findForm(jsonContent);
          const hasQuestions =
            rawForm &&
            (rawForm.survey ||
              rawForm.questions ||
              rawForm.form_fields ||
              rawForm.fields);

          if (rawForm && hasQuestions) {
            const parsed = parseAndTransform(rawForm);
            setFormDefinition(parsed);
          } else {
            Alert.alert("Error", "Form definition invalid or not found.");
            router.back();
          }
        } catch (err) {
          console.warn("Invalid JSON form definition", err);
          Alert.alert("Error", "Failed to parse form definition.");
          router.back();
        }
      } else {
        Alert.alert("Error", "XML forms are not supported in this version.");
        router.back();
      }
    } catch (err) {
      console.error("Failed to load form:", err);
      Alert.alert("Error", "Failed to load form");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [fid, router]);

  useEffect(() => {
    if (!fid) return;
    loadFormDefinition();
  }, [fid, loadFormDefinition]);

  // Prevent back navigation if unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Logic for confirming discard
      if (isFinalized || Object.keys(draftData).length === 0) return;
      e.preventDefault();
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              navigation.dispatch((e as any).data?.action);
            },
          },
        ],
      );
    });
    return unsubscribe;
  }, [isFinalized, draftData, navigation]);

  const handleDataChange = useCallback(
    (data: FormData) => {
      updateFields(data);
    },
    [updateFields],
  );

  const handleValidation = useCallback((errors: ValidationError[]) => {
    setValidationErrors(errors);
  }, []);

  const handleSaveDraft = async () => {
    try {
      await saveNow();
      Alert.alert("Success", "Draft saved successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save draft");
    }
  };

  const handleFinalize = async () => {
    if (validationErrors.length > 0) {
      Alert.alert(
        "Validation Errors",
        "Please fix all errors before finalizing",
        [{ text: "OK" }],
      );
      return;
    }

    Alert.alert(
      "Finalize Form?",
      "Once finalized, you cannot edit this form. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finalize",
          onPress: async () => {
            try {
              setIsFinalizing(true);
              const finalizedDraft = await finalizeDraft();

              const instanceData = JSON.stringify(finalizedDraft);
              await odkStorage.saveInstance(
                fid,
                finalizedDraft.meta.instanceId!,
                instanceData,
                [],
                {
                  formVersion: formDefinition!.version,
                  status: "incomplete",
                  displayName: `${formDefinition!.title} - ${new Date().toLocaleDateString()}`,
                },
              );

              // 2. Finalize (Validate, Hash, Queue)
              await odkStorage.finalizeInstance(
                fid,
                finalizedDraft.meta.instanceId!,
              );

              Alert.alert("Success", "Form finalized and submitted!", [
                { text: "OK", onPress: () => router.replace("/(tabs)") },
              ]);
            } catch (error) {
              console.error("Finalization error:", error);
              Alert.alert("Error", "Failed to finalize form");
            } finally {
              setIsFinalizing(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <AppContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <AppText className="mt-4 text-gray-500">Loading form...</AppText>
      </AppContainer>
    );
  }

  if (!formDefinition) {
    return (
      <AppContainer className="flex-1">
        <FormHeader currentRoute="Error" goBack={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <Feather name="alert-triangle" size={48} color="#ef4444" />
          <AppText className="mt-4 font-bold text-lg text-gray-700">
            Form not found
          </AppText>
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer className="flex-1">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {/* We can use DynamicHeader or just FormHeader. FormHeader is simpler for now. 
            DynamicHeader was imported in the original but commented out. 
            I'll stick to FormHeader to correspond with other screens.
        */}
        <FormHeader
          currentRoute={formDefinition.title || "Fill Form"}
          goBack={() => router.back()}
          onSaveForm={handleSaveDraft}
        />

        <FormRenderer
          formDefinition={formDefinition}
          initialData={draftData}
          onChange={handleDataChange}
          onValidation={handleValidation}
          onSave={handleSaveDraft}
          onFinalize={handleFinalize}
          isSaving={isSaving}
          isFinalizing={isFinalizing}
          readOnly={isFinalized}
        />

        {isFinalized && (
          <View className="bg-green-50 dark:bg-green-900/20 p-4 flex-row items-center justify-center border-t border-green-200 dark:border-green-800">
            <Feather name="check-circle" size={20} color="#10b981" />
            <AppText className="ml-2 text-green-800 dark:text-green-300 font-bold">
              Form finalized - Ready for submission
            </AppText>
          </View>
        )}
      </KeyboardAvoidingView>
    </AppContainer>
  );
};

export default FormByIdScreen;
