import { AppContainer } from "@/components";
import { FormHeader } from "@/components/home/Header";
import { ActiveFormState, STORAGE_KEYS, useForm } from "@/context/FormContext";
import DynamicFormScreen from "@/odk/screens/DynamicForm";
import { FormSchema } from "@/odk/type/FormType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";

const FormScreen = () => {
  const [status, setStatus] = useState<"draft" | "finalized">("draft");
  const [activeForm, setActiveFormState] = useState<ActiveFormState>();
  const [loading, setLoading] = useState<boolean>(true);

  const route = useRouter();

  // console.log(form);
  useEffect(() => {
    getActiveForms();
  }, []);

  const getActiveForms = useCallback(async () => {
    try {
      setLoading(true);
      const storedForms = await AsyncStorage.getItem(
        STORAGE_KEYS.SELECTED_FORM
      );

      if (storedForms) {
        const parsedForms = JSON.parse(storedForms);
        setActiveFormState(parsedForms);
        console.log(parsedForms);
      }
    } catch (error) {
      console.error("Error fetching downloaded forms:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  const { handleGetForm, handleSaveDraft, handleFinalize } = useForm();
  // let currentform = JSON.parse(form);
  useEffect(() => {
    handleGetForm();
    console.log("Fetched active form:", activeForm);
  }, []);

  const saveDraft = (form: FormSchema) => {
    handleSaveDraft();
    route.replace("/(tabs)");
  };

  const saveFinalizedForm = (form: FormSchema) => {
    handleFinalize();
    route.replace("/(tabs)");
  };

  const handleGoBack = (form: FormSchema) => {
    saveDraft(form);
  };

  return (
    <AppContainer className="flex-1">
      <FormHeader
        currentRoute={activeForm?.id}
        goBack={() => route.back()}
        onSaveForm={handleFinalize}
      />
      {activeForm ? (
        <DynamicFormScreen formSchema={activeForm} />
      ) : (
        <Text>{activeForm}</Text>
      )}
    </AppContainer>
  );
};

export default FormScreen;
