import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFormDraft } from "../../hooks/useFormDraft";

// ODK Form Field Types
type FieldType =
  | "text"
  | "integer"
  | "decimal"
  | "select_one"
  | "select_multiple"
  | "date"
  | "time"
  | "datetime"
  | "geopoint"
  | "image"
  | "note"
  | "calculate"
  | "repeat";

type Choice = {
  name: string;
  label: string;
};

type FormField = {
  type: FieldType;
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  appearance?: string;
  choices?: Choice[];
  constraint?: string;
  relevant?: string;
  calculation?: string;
  default?: any;
  repeat_count?: string;
  children?: FormField[];
};

type FormDefinition = {
  formId: string;
  title: string;
  version?: string;
  instanceName?: string;
  fields: FormField[];
};

type ODKFormRendererProps = {
  formDefinition: FormDefinition;
  onSubmit?: (data: any) => Promise<void>;
  onSave?: () => void;
};

export const ODKFormRenderer: React.FC<ODKFormRendererProps> = ({
  formDefinition,
  onSubmit,
  onSave,
}) => {
  const {
    draftData,
    updateField,
    updateFields,
    getField,
    finalizeDraft,
    markSubmitted,
    exportInstance,
    isLoading,
    isSaving,
    isFinalized,
    isSubmitted,
    instanceId,
  } = useFormDraft(formDefinition.formId, {
    storageMode: "filesystem",
  });

  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Check if field is relevant (visible) based on conditions
  const isRelevant = (field: FormField): boolean => {
    if (!field.relevant) return true;

    try {
      // Simple relevance parsing: ${fieldName} = 'value'
      const match = field.relevant.match(/\$\{(\w+)\}\s*=\s*'([^']+)'/);
      if (match) {
        const [, fieldName, expectedValue] = match;
        return getField(fieldName) === expectedValue;
      }
    } catch (e) {
      console.warn("Relevance check failed:", e);
    }

    return true;
  };

  // Render individual field based on type
  const renderField = (field: FormField, path: string = "") => {
    const fieldPath = path ? `${path}.${field.name}` : field.name;

    if (!isRelevant(field)) return null;

    const value = getField(fieldPath);
    const isReadOnly = isFinalized || field.type === "calculate";

    return (
      <View key={fieldPath} className="mb-6">
        {/* Field Label */}
        {field.type !== "note" && (
          <Text className="text-base font-semibold text-gray-800 mb-2">
            {field.label}
            {field.required && <Text className="text-red-600"> *</Text>}
          </Text>
        )}

        {/* Field Hint */}
        {field.hint && (
          <Text className="text-sm text-gray-600 mb-2 italic">
            {field.hint}
          </Text>
        )}

        {/* Field Input */}
        {renderFieldInput(field, fieldPath, value, isReadOnly)}

        {/* Validation Error */}
        {field.required && !value && isFinalized && (
          <Text className="text-sm text-red-600 mt-1">
            This field is required
          </Text>
        )}
      </View>
    );
  };

  const renderFieldInput = (
    field: FormField,
    fieldPath: string,
    value: any,
    isReadOnly: boolean
  ) => {
    switch (field.type) {
      case "text":
        return (
          <TextInput
            value={value || ""}
            onChangeText={(v) => updateField(fieldPath, v)}
            editable={!isReadOnly}
            placeholder={field.hint || `Enter ${field.label.toLowerCase()}`}
            multiline={field.appearance === "multiline"}
            numberOfLines={field.appearance === "multiline" ? 4 : 1}
            className={`border border-gray-300 rounded-lg p-3 text-base ${
              isReadOnly ? "bg-gray-100" : "bg-white"
            }`}
          />
        );

      case "integer":
      case "decimal":
        return (
          <TextInput
            value={value?.toString() || ""}
            onChangeText={(v) => {
              const parsed =
                field.type === "integer"
                  ? parseInt(v) || 0
                  : parseFloat(v) || 0;
              updateField(fieldPath, parsed);
            }}
            keyboardType="numeric"
            editable={!isReadOnly}
            placeholder="0"
            className={`border border-gray-300 rounded-lg p-3 text-base ${
              isReadOnly ? "bg-gray-100" : "bg-white"
            }`}
          />
        );

      case "select_one":
        return (
          <View className="space-y-2">
            {field.choices?.map((choice) => (
              <TouchableOpacity
                key={choice.name}
                onPress={() =>
                  !isReadOnly && updateField(fieldPath, choice.name)
                }
                disabled={isReadOnly}
                className={`flex-row items-center p-3 border rounded-lg ${
                  value === choice.name
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                } ${isReadOnly ? "opacity-50" : ""}`}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    value === choice.name
                      ? "border-blue-500"
                      : "border-gray-400"
                  }`}
                >
                  {value === choice.name && (
                    <View className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </View>
                <Text className="text-base text-gray-800">{choice.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case "select_multiple":
        const selectedValues = value || [];
        return (
          <View className="space-y-2">
            {field.choices?.map((choice) => {
              const isSelected = selectedValues.includes(choice.name);
              return (
                <TouchableOpacity
                  key={choice.name}
                  onPress={() => {
                    if (isReadOnly) return;
                    const newValues = isSelected
                      ? selectedValues.filter((v: string) => v !== choice.name)
                      : [...selectedValues, choice.name];
                    updateField(fieldPath, newValues);
                  }}
                  disabled={isReadOnly}
                  className={`flex-row items-center p-3 border rounded-lg ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-white"
                  } ${isReadOnly ? "opacity-50" : ""}`}
                >
                  <View
                    className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text className="text-base text-gray-800">
                    {choice.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case "date":
        return (
          <View>
            <TextInput
              value={value || ""}
              onChangeText={(v) => updateField(fieldPath, v)}
              editable={!isReadOnly}
              placeholder="YYYY-MM-DD"
              className={`border border-gray-300 rounded-lg p-3 text-base ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Format: YYYY-MM-DD
            </Text>
          </View>
        );

      case "geopoint":
        return (
          <View>
            <TouchableOpacity
              onPress={async () => {
                if (isReadOnly) return;
                try {
                  const { status } =
                    await Location.requestForegroundPermissionsAsync();
                  if (status !== "granted") {
                    alert("Permission to access location was denied");
                    return;
                  }
                  const location = await Location.getCurrentPositionAsync({});
                  updateField(fieldPath, {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    altitude: location.coords.altitude,
                    accuracy: location.coords.accuracy,
                  });
                } catch (e) {
                  console.error("Error getting location:", e);
                  alert("Failed to get location");
                }
              }}
              disabled={isReadOnly}
              className={`border border-gray-300 rounded-lg p-4 items-center ${
                value ? "bg-green-50 border-green-500" : "bg-white"
              } ${isReadOnly ? "opacity-50" : ""}`}
            >
              <Text className="text-base font-medium text-gray-800 mb-2">
                📍 {value ? "Update Location" : "Capture Location"}
              </Text>
              {value && (
                <View className="mt-2">
                  <Text className="text-sm text-gray-600">
                    Lat: {value.latitude?.toFixed(6)}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Lng: {value.longitude?.toFixed(6)}
                  </Text>
                  {value.accuracy && (
                    <Text className="text-xs text-gray-500 mt-1">
                      Accuracy: ±{value.accuracy.toFixed(1)}m
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        );

      case "image":
        return (
          <View>
            <TouchableOpacity
              onPress={async () => {
                if (isReadOnly) return;
                try {
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.7,
                    base64: true,
                  });
                  if (!result.canceled && result.assets[0].base64) {
                    updateField(
                      fieldPath,
                      `data:image/jpeg;base64,${result.assets[0].base64}`
                    );
                  }
                } catch (e) {
                  console.error("Error capturing image:", e);
                  alert("Failed to capture image");
                }
              }}
              disabled={isReadOnly}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-6 items-center ${
                isReadOnly ? "opacity-50" : ""
              }`}
            >
              {value ? (
                <Image
                  source={{ uri: value }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Text className="text-4xl mb-2">📷</Text>
                  <Text className="text-base text-gray-600">
                    Tap to capture photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      case "note":
        return (
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text className="text-base text-blue-900">{field.label}</Text>
          </View>
        );

      case "calculate":
        return (
          <View className="bg-gray-100 border border-gray-300 rounded-lg p-3">
            <Text className="text-base text-gray-700">
              {value || "Calculating..."}
            </Text>
          </View>
        );

      case "repeat":
        const repeatValues = value || [];
        return (
          <View className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <Text className="text-base font-semibold text-gray-800 mb-4">
              {field.label} ({repeatValues.length})
            </Text>

            {repeatValues.map((_: any, index: number) => (
              <View
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3"
              >
                <Text className="text-sm font-medium text-gray-600 mb-3">
                  Item {index + 1}
                </Text>
                {field.children?.map((childField) =>
                  renderField(childField, `${fieldPath}[${index}]`)
                )}

                {!isReadOnly && (
                  <TouchableOpacity
                    onPress={() => {
                      const newValues = repeatValues.filter(
                        (_: any, i: number) => i !== index
                      );
                      updateField(fieldPath, newValues);
                    }}
                    className="bg-red-100 border border-red-300 rounded-lg p-2 mt-2"
                  >
                    <Text className="text-center text-red-700 font-medium">
                      Remove Item
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {!isReadOnly && (
              <TouchableOpacity
                onPress={() => {
                  const newItem = field.children?.reduce((acc, child) => {
                    acc[child.name] = child.default || "";
                    return acc;
                  }, {} as any);
                  updateField(fieldPath, [...repeatValues, newItem]);
                }}
                className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-2"
              >
                <Text className="text-center text-blue-700 font-medium">
                  + Add {field.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      default:
        return (
          <Text className="text-sm text-gray-500 italic">
            Unsupported field type: {field.type}
          </Text>
        );
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate required fields
      const validateFields = (
        fields: FormField[],
        parentPath = ""
      ): boolean => {
        for (const field of fields) {
          const fieldPath = parentPath
            ? `${parentPath}.${field.name}`
            : field.name;

          if (field.required && !getField(fieldPath)) {
            alert(`Please fill in: ${field.label}`);
            return false;
          }

          if (field.children) {
            const repeatValues = getField(fieldPath) || [];
            for (let i = 0; i < repeatValues.length; i++) {
              if (!validateFields(field.children, `${fieldPath}[${i}]`)) {
                return false;
              }
            }
          }
        }
        return true;
      };

      if (!validateFields(formDefinition.fields)) {
        setSubmitting(false);
        return;
      }

      // Finalize and export
      await finalizeDraft();
      const instance = exportInstance();

      // Call custom submit handler if provided
      if (onSubmit) {
        await onSubmit(instance);
      }

      // Mark as submitted
      await markSubmitted();

      alert("✅ Form submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Loading form...</Text>
      </View>
    );
  }

  if (isSubmitted) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-6xl mb-4">✅</Text>
        <Text className="text-xl font-bold text-gray-800 mb-2">
          Form Submitted
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Instance ID: {instanceId}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-xl font-bold text-gray-900">
          {formDefinition.title}
        </Text>
        {formDefinition.version && (
          <Text className="text-sm text-gray-500 mt-1">
            Version {formDefinition.version}
          </Text>
        )}

        {/* Status Bar */}
        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full mr-2 ${
                isSaving ? "bg-orange-500" : "bg-green-500"
              }`}
            />
            <Text className="text-sm text-gray-600">
              {isSaving ? "Saving..." : "Saved"}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            ID: {instanceId?.slice(-8)}
          </Text>
        </View>
      </View>

      {/* Form Fields */}
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {formDefinition.fields.map((field) => renderField(field))}

        {/* Submit Button */}
        <View className="mb-8 mt-4">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || isFinalized}
            className={`rounded-lg py-4 ${
              submitting || isFinalized ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <Text className="text-center text-white text-lg font-semibold">
              {submitting
                ? "Submitting..."
                : isFinalized
                  ? "Submitted"
                  : "Submit Form"}
            </Text>
          </TouchableOpacity>

          {onSave && !isFinalized && (
            <TouchableOpacity
              onPress={onSave}
              className="mt-3 rounded-lg py-3 border-2 border-gray-300"
            >
              <Text className="text-center text-gray-700 text-base font-medium">
                Save Draft
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
