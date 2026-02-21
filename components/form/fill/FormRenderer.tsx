import { AppButton, AppText } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import {
  FormData,
  FormDefinition,
  FormField,
  GroupField,
  ValidationError,
} from "@/types/FormFieldTypes";
import { evaluateRelevant, validateField } from "@/utils/validation";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import FormFieldComponent from "./FormField";

interface FormRendererProps {
  formDefinition: FormDefinition;
  initialData?: FormData;
  onChange: (data: FormData) => void;
  onValidation: (errors: ValidationError[]) => void;
  onSave?: () => Promise<void>;
  onFinalize?: () => Promise<void>;
  isSaving?: boolean;
  isFinalizing?: boolean;
  readOnly?: boolean;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  formDefinition,
  initialData = {},
  onChange,
  onValidation,
  onSave,
  onFinalize,
  isSaving = false,
  isFinalizing = false,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<ValidationError[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const { mode } = useTheme();

  useEffect(() => {
    onChange(formData);
    // Silent validation for parent component
    const errors = validateAllFields();
    onValidation(errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (stepErrors.find((e) => e.fieldName === name)) {
      setStepErrors((prev) => prev.filter((e) => e.fieldName !== name));
    }
  };

  const validateAllFields = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    // Recursive validation
    const validate = (fields: FormField[]) => {
      fields.forEach((field) => {
        if (field.type === "group") {
          validate((field as GroupField).fields);
        } else {
          const error = validateField(field, formData[field.name]);
          if (error) errors.push(error);
        }
      });
    };
    validate(formDefinition.fields);
    return errors;
  };

  const validateStep = (fields: FormField[]): boolean => {
    const errors: ValidationError[] = [];
    fields.forEach((field) => {
      // If it's a nested group in the step, validate its fields
      if (field.type === "group") {
        (field as GroupField).fields.forEach((subField) => {
          const error = validateField(subField, formData[subField.name], true);
          if (error) errors.push(error);
        });
      } else {
        const error = validateField(field, formData[field.name], true);
        if (error) errors.push(error);
      }
    });

    setStepErrors(errors);
    return errors.length === 0;
  };

  const renderField = (field: FormField) => {
    // Check if field should be shown based on relevant condition
    if (field.relevant && !evaluateRelevant(field.relevant, formData)) {
      return null; // Don't render this field
    }

    if (field.type === "group") {
      const group = field as GroupField;
      return (
        <View
          key={group.name}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <AppText className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
            {group.label}
          </AppText>
          {group.fields.map(renderField)}
        </View>
      );
    }

    const error = stepErrors.find((e) => e.fieldName === field.name)?.message;

    return (
      <FormFieldComponent
        key={field.name}
        field={field}
        value={formData[field.name]}
        onChange={(value) => handleFieldChange(field.name, value)}
        readOnly={readOnly}
        error={error}
      />
    );
  };

  // Determine if we are using steps (groups at top level)
  const isStepped =
    formDefinition.fields.length > 0 &&
    formDefinition.fields.every((f) => f.type === "group");
  const steps = isStepped ? (formDefinition.fields as GroupField[]) : [];
  const currentStepField = isStepped ? steps[currentStep] : null;

  const handleNext = () => {
    if (currentStepField) {
      const isValid = validateStep(currentStepField.fields);
      if (!isValid) {
        Alert.alert(
          "Validation Error",
          "Please correct the errors before proceeding.",
        );
        return;
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setStepErrors([]); // Clear errors when going back
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isStepped && currentStepField ? (
          <View key={currentStepField.name} className="mb-6">
            <View className="mb-6">
              <AppText className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">
                Step {currentStep + 1} of {steps.length}
              </AppText>
              <AppText
                type="heading"
                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
              >
                {currentStepField.label}
              </AppText>
              {/* Progress Bar */}
              <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </View>
            </View>

            {currentStepField.fields.map(renderField)}
          </View>
        ) : (
          formDefinition.fields.map((f) => renderField(f))
        )}
      </ScrollView>

      {/* Sticky Footer */}
      {!readOnly && (
        <View className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
          <View className="flex-row gap-3">
            {/* Previous Button */}
            {currentStep > 0 && (
              <AppButton
                variant="outline"
                onPress={handlePrev}
                className="flex-1"
                leftIcon={
                  <Feather
                    name="chevron-left"
                    size={20}
                    color={mode === "dark" ? "#9ca3af" : "#4b5563"}
                  />
                }
              >
                Previous
              </AppButton>
            )}

            {/* Next / Finalize Button */}
            {currentStep < steps.length - 1 ? (
              <AppButton
                variant="primary"
                onPress={handleNext}
                className="flex-1"
                rightIcon={
                  <Feather name="chevron-right" size={20} color="white" />
                }
              >
                Next
              </AppButton>
            ) : isStepped ? (
              // Final Step Actions
              <View className="flex-1 flex-row gap-3">
                {onSave && (
                  <AppButton
                    variant="secondary"
                    onPress={onSave}
                    className="flex-1"
                    isLoading={isSaving}
                    leftIcon={
                      <Feather
                        name="save"
                        size={20}
                        color={mode === "dark" ? "#e5e7eb" : "#374151"}
                      />
                    }
                  >
                    Draft
                  </AppButton>
                )}
                {onFinalize && (
                  <AppButton
                    variant="primary"
                    onPress={async () => {
                      if (currentStepField) {
                        const isValid = validateStep(currentStepField.fields);
                        if (!isValid) {
                          Alert.alert(
                            "Validation Error",
                            "Please correct the errors before finalizing.",
                          );
                          return;
                        }
                      }
                      await onFinalize();
                    }}
                    className="flex-[2]"
                    isLoading={isFinalizing}
                    leftIcon={
                      <Feather name="check-circle" size={20} color="white" />
                    }
                  >
                    Finalize
                  </AppButton>
                )}
              </View>
            ) : (
              // Non-stepped form actions (if any)
              <View className="flex-1 flex-row gap-3">
                {onSave && (
                  <AppButton
                    variant="secondary"
                    onPress={onSave}
                    className="flex-1"
                    isLoading={isSaving}
                    leftIcon={
                      <Feather
                        name="save"
                        size={20}
                        color={mode === "dark" ? "#e5e7eb" : "#374151"}
                      />
                    }
                  >
                    Save Draft
                  </AppButton>
                )}
                {onFinalize && (
                  <AppButton
                    variant="primary"
                    onPress={async () => {
                      const errors = validateAllFields();
                      setStepErrors(errors);
                      if (errors.length > 0) {
                        Alert.alert(
                          "Validation Error",
                          "Please correct the errors before finalizing.",
                        );
                        return;
                      }
                      await onFinalize();
                    }}
                    className="flex-[2]"
                    isLoading={isFinalizing}
                    leftIcon={
                      <Feather name="check-circle" size={20} color="white" />
                    }
                  >
                    Finalize
                  </AppButton>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default FormRenderer;
