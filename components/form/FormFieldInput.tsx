import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { FormField } from "@/odk/type/FormType";
import * as ImagePicker from "expo-image-picker";

interface Props {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
}

export const FormFieldInput: React.FC<Props> = ({ field, value, onChange }) => {
  if (field.type === "text" || field.type === "number") {
    return (
      <TextInput
        className={`border border-gray-300 rounded-lg p-2`}
        placeholder={field.placeholder || ""}
        keyboardType={field.type === "number" ? "numeric" : "default"}
        value={value || ""}
        onChangeText={onChange}
      />
    );
  }

  if (field.type === "date") {
    return (
      <TextInput
        className={`border border-gray-300 rounded-lg p-2`}
        placeholder="YYYY-MM-DD"
        value={value || ""}
        onChangeText={onChange}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <TouchableOpacity
        onPress={() => onChange(!value)}
        className={`flex-row items-center space-x-2`}
      >
        <View
          className={`w-5 h-5 rounded border border-gray-400 ${
            value ? "bg-green-500" : "bg-white"
          }`}
        />
        <Text>{field.label}</Text>
      </TouchableOpacity>
    );
  }

  if (field.type === "image") {
    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled) onChange(result.assets[0].uri);
    };
    return (
      <View>
        {value && (
          <Image
            source={{ uri: value }}
            className={`w-24 h-24 mb-2 rounded-lg`}
          />
        )}
        <TouchableOpacity
          onPress={pickImage}
          className={`bg-blue-500 p-2 rounded-lg`}
        >
          <Text className={`text-white text-center`}>
            {value ? "Change Image" : "Upload Image"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};
