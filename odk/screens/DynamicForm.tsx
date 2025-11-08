import { FormSectionRenderer } from "@/components/form/FormSection";
import { FormSchema } from "@/odk/type/FormType";
import { saveDraft, saveFinalized } from "@/odk/utils/formStorage";
import { validateForm } from "@/odk/utils/validateForm";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Props {
  formSchema: FormSchema;
}

const DynamicFormScreen: React.FC<Props> = ({ formSchema }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const section = formSchema.sections[currentSection];
  const isLastSection = currentSection === formSchema.sections.length - 1;

  const handleNext = () => {
    if (isLastSection) return;
    setCurrentSection((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentSection === 0) return;
    setCurrentSection((prev) => prev - 1);
  };

  const handleSave = async (finalize: boolean) => {
    setLoading(true);
    try {
      if (finalize) {
        const errors = validateForm(formSchema, formData);
        if (errors.length > 0) {
          Alert.alert("Validation Error", errors.join("\n"));
          setLoading(false);
          return;
        }
        await saveFinalized(formSchema.id, formData);
        Alert.alert("Success", "Form finalized successfully!");
      } else {
        await saveDraft(formSchema.id, formData);
        Alert.alert("Draft Saved", "You can continue later.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 bg-white p-4`}>
      <Text className={`text-xl font-bold text-center mb-3`}>
        {formSchema.title}
      </Text>
      <Text className={`text-gray-600 text-center mb-4`}>
        Section {currentSection + 1} of {formSchema.sections.length}:{" "}
        {section.title}
      </Text>

      <ScrollView className={`flex-1`}>
        <FormSectionRenderer
          section={section}
          formData={formData}
          onChange={(id, value) =>
            setFormData((prev) => ({ ...prev, [id]: value }))
          }
        />
      </ScrollView>

      <View className={`flex-row justify-beeen mt-4`}>
        {currentSection > 0 && (
          <TouchableOpacity
            onPress={handleBack}
            className={`bg-gray-300 p-3 rounded-lg w-1/3`}
          >
            <Text className={`text-center`}>Back</Text>
          </TouchableOpacity>
        )}

        {!isLastSection ? (
          <TouchableOpacity
            onPress={handleNext}
            className={`bg-blue-500 p-3 rounded-lg w-1/3`}
          >
            <Text className={`text-white text-center`}>Next</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => handleSave(false)}
              className={`bg-yellow-500 p-3 rounded-lg w-[30%]`}
            >
              <Text className={`text-center text-white`}>Save as Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSave(true)}
              className={`bg-green-600 p-3 rounded-lg w-[30%]`}
            >
              <Text className={`text-center text-white`}>
                {loading ? "Saving..." : "Finalize"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};
export default DynamicFormScreen;
