import { AppText } from "@/components";
import { FormField as IFormField } from "@/types/FormFieldTypes";
import React from "react";
import { View } from "react-native";
import AppTextInput from "../common/AppTextInput";
import { SelectField } from "./SelectField";

interface FormFieldProps {
  field: IFormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  error,
}) => {

  if (field.type === "note") {
    return (
      <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border-l-4 border-blue-500">
        <AppText className="text-blue-800 dark:text-blue-200 leading-relaxed italic">
          {field.label}
        </AppText>
      </View>
    );
  }

  // Handle Select Fields
  if (field.type === "select_one" || field.type === "select_multiple") {
    // @ts-ignore - Types are compatible but TS might complain about specific field union
    return <SelectField field={field} value={value} onChange={onChange} error={error} />;
  }

  // Default Inputs (Text, Integer, Decimal)
  const isMultiline = field.type === "text" && field.inputType === "multiline";
  const keyboardType = field.type === "integer" || field.type === "decimal" ? "numeric" : "default";

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-2">
        <AppText className="font-bold text-gray-700 dark:text-gray-200 text-base uppercase tracking-wide">
          {field.label}
        </AppText>
        {field.required && (
          <AppText className="text-red-500 ml-1 font-bold">*</AppText>
        )}
      </View>

      {field.hint && (
        <AppText className="text-sm text-gray-500 dark:text-gray-400 mb-3 italic">
          {field.hint}
        </AppText>
      )}

      {field.type === "date" ? (
        // TODO: Replace with proper DatePicker component
        <AppTextInput
          placeholder="YYYY-MM-DD"
          value={value || ""}
          onChangeText={onChange}
          error={error}
        />
      ) : (
        <AppTextInput
          multiline={isMultiline}
          value={value ? String(value) : ""}
          onChangeText={(text) => {
            if (field.type === "integer" || field.type === "decimal") {
              // Only pass if valid number or empty
              onChange(text); // Let parent handle parsing or keep as string until submit
            } else {
              onChange(text);
            }
          }}
          keyboardType={keyboardType}
          placeholder={field.type === "integer" ? "0" : "Type your answer..."}
          error={error}
        />
      )}
    </View>
  );
};

export default FormField;
