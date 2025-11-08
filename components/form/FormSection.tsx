import { FormSection } from "@/odk/type/FormType";
import React from "react";
import { Text, View } from "react-native";
import { FormFieldInput } from "./FormFieldInput";

interface Props {
  section: FormSection;
  formData: Record<string, any>;
  onChange: (id: string, value: any) => void;
}

export const FormSectionRenderer: React.FC<Props> = ({
  section,
  formData,
  onChange,
}) => {
  return (
    <View className={`space-y-4`}>
      {section.fields.map((field) => (
        <View key={field.id}>
          <Text className={`font-semibold text-gray-700 mb-1`}>
            {field.label}
          </Text>
          <FormFieldInput
            field={field}
            value={formData[field.id]}
            onChange={(val) => onChange(field.id, val)}
          />
        </View>
      ))}
    </View>
  );
};
