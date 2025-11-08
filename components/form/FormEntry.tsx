import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FormEntry({
  form,
  formData,
  onInputChange,
  onBack,
  onSaveDraft,
  onFinalize,
  isDark,
  colors,
}: any) {
  if (!form) return null;
  return (
    <View className="rounded-xl p-4">
      <TouchableOpacity onPress={onBack} className="flex-row items-center mb-4">
        <Feather
          name="arrow-left"
          size={20}
          color={colors?.blue || "#0a7ea4"}
        />
        <Text
          className="ml-2 text-base font-medium"
          style={{ color: colors?.blue || "#0a7ea4" }}
        >
          Back
        </Text>
      </TouchableOpacity>

      <Text className="text-2xl font-bold mb-2">{form.name}</Text>
      <Text className="mb-6 text-gray-600 dark:text-gray-300">
        {form.description}
      </Text>

      <ScrollView className="mb-4">
        {form.fields.map((field: any) => (
          <View key={field.id} className="mb-4">
            <View className="flex-row items-center mb-2">
              <Text className="text-sm font-medium mr-1">{field.label}</Text>
              {field.required && (
                <Text className="text-red-500 text-sm">*</Text>
              )}
            </View>
            <TextInput
              value={formData[field.id] || ""}
              onChangeText={(text) => onInputChange(field.id, text)}
              className="border rounded-md p-3 text-base"
              style={{
                backgroundColor: isDark ? colors?.gray800 : colors?.white,
                color: isDark ? colors?.gray100 : colors?.gray900,
                borderColor: isDark ? colors?.gray700 : colors?.gray300,
                height: field.type === "textarea" ? 100 : 40,
              }}
              multiline={field.type === "textarea"}
              keyboardType={field.type === "number" ? "numeric" : "default"}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              placeholderTextColor={isDark ? colors?.gray400 : colors?.gray600}
            />
          </View>
        ))}
      </ScrollView>

      <View className="flex-row">
        <TouchableOpacity
          onPress={onSaveDraft}
          className="flex-1 flex-row items-center justify-center p-3 rounded-md mr-2"
          style={{ backgroundColor: colors?.gray600 }}
        >
          <Feather name="save" size={20} color="white" />
          <Text className="text-white text-base font-medium ml-2">
            Save as Draft
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onFinalize}
          className="flex-1 flex-row items-center justify-center p-3 rounded-md"
          style={{ backgroundColor: colors?.green600 }}
        >
          <Feather name="check-circle" size={20} color="white" />
          <Text className="text-white text-base font-medium ml-2">
            Finalize
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
