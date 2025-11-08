import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import {
  ActiveFormState,
  DraftForm,
  FinalizedForm,
  FormContext,
  FormContextProps,
  SentForm,
  STORAGE_KEYS,
} from "../context/FormContext";
import { serverForms } from "../odk/hooks/useGetForm";
import { FormSchema } from "../odk/type/FormType";
// Provider Component
interface FormProviderProps {
  children: ReactNode;
}
export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [downloadedForms, setDownloadedFormsState] = useState<FormSchema[]>([]);
  const [draftForms, setDraftFormsState] = useState<DraftForm[]>([]);
  const [finalizedForms, setFinalizedFormsState] = useState<FinalizedForm[]>(
    []
  );
  const [sentForms, setSentFormsState] = useState<SentForm[]>([]);
  const [activeForm, setActiveFormState] = useState<ActiveFormState | null>(
    null
  );
  const [formData, setFormDataState] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const route = useRouter();
  // Load all data from AsyncStorage on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // AsyncStorage Helper Functions
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [downloaded, drafts, finalized, sent] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DOWNLOADED_FORMS),
        AsyncStorage.getItem(STORAGE_KEYS.DRAFT_FORMS),
        AsyncStorage.getItem(STORAGE_KEYS.FINALIZED_FORMS),
        AsyncStorage.getItem(STORAGE_KEYS.SENT_FORMS),
      ]);

      if (downloaded) setDownloadedFormsState(JSON.parse(downloaded));
      if (drafts) setDraftFormsState(JSON.parse(drafts));
      if (finalized) setFinalizedFormsState(JSON.parse(finalized));
      if (sent) setSentFormsState(JSON.parse(sent));
    } catch (error) {
      console.error("Error loading data from AsyncStorage:", error);
    } finally {
      setLoading(false);
    }
  };

  const setDownloadedForms = async (forms: FormSchema[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DOWNLOADED_FORMS,
        JSON.stringify(forms)
      );
      setDownloadedFormsState(forms);
    } catch (error) {
      console.error("Error saving downloaded forms:", error);
      throw error;
    }
  };

  const setDraftForms = async (forms: DraftForm[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DRAFT_FORMS,
        JSON.stringify(forms)
      );
      setDraftFormsState(forms);
      await AsyncStorage.removeItem("@odk_selected_form");
    } catch (error) {
      console.error("Error saving draft forms:", error);
      throw error;
    }
  };

  const setFinalizedForms = async (forms: FinalizedForm[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FINALIZED_FORMS,
        JSON.stringify(forms)
      );
      setFinalizedFormsState(forms);
    } catch (error) {
      console.error("Error saving finalized forms:", error);
      throw error;
    }
  };

  const setSentForms = async (forms: SentForm[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SENT_FORMS,
        JSON.stringify(forms)
      );
      setSentFormsState(forms);
    } catch (error) {
      console.error("Error saving sent forms:", error);
      throw error;
    }
  };

  // Download form from server
  const handleDownloadForm = async (form: FormSchema) => {
    try {
      if (!downloadedForms.find((f) => f.id === form.id)) {
        const updatedForms = [...downloadedForms, form];
        await setDownloadedForms(updatedForms);
        return Promise.resolve();
      } else {
        throw new Error(`${form.title} is already downloaded.`);
      }
    } catch (error) {
      console.error("Error downloading form:", error);
      throw error;
    }
  };

  // Open form for filling
  const handleOpenForm = async (
    form: FormSchema,
    existingData?: DraftForm,
    isDraft = false
  ) => {
    try {
      const openForm = { ...form, isDraft, draftId: existingData?.draftId };
      AsyncStorage.setItem(
        STORAGE_KEYS.SELECTED_FORM,
        JSON.stringify(openForm)
      );
      setActiveFormState(openForm);
      setFormDataState(existingData?.data || {});
    } catch (error) {}
  };

  //active form for filling
  const handleGetForm = async (existingData?: DraftForm) => {
    try {
      const selectedForm = await AsyncStorage.getItem("@odk_selected_form");
      if (selectedForm) {
        const form = JSON.parse(selectedForm);
        setActiveFormState(form);
        setFormDataState(existingData?.data || {});
        setLoading(false);
      }
    } catch (error) {}
  };

  // Handle input changes
  const handleInputChange = (fieldId: string, value: any) => {
    setFormDataState({ ...formData, [fieldId]: value });
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!activeForm) {
      throw new Error("No active form");
    }

    try {
      const draftId = activeForm.draftId || `draft_${Date.now()}`;
      const draft: DraftForm = {
        draftId,
        form: activeForm,
        data: formData,
        savedDate: new Date().toLocaleDateString(),
      };

      const existingIndex = draftForms.findIndex((d) => d.draftId === draftId);
      let updatedDrafts: DraftForm[];

      if (existingIndex >= 0) {
        updatedDrafts = [...draftForms];
        updatedDrafts[existingIndex] = draft;
      } else {
        updatedDrafts = [...draftForms, draft];
      }

      await setDraftForms(updatedDrafts);
      resetForm();
      route.replace("/(odk)");
      return Promise.resolve();
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    }
  };

  // Finalize form
  const handleFinalize = async () => {
    if (!activeForm) {
      throw new Error("No active form");
    }

    const requiredFields = activeForm.fields.filter((f) => f.required);
    const missingFields = requiredFields.filter(
      (f) => !formData[f.id] || formData[f.id] === ""
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Please fill all required fields: ${missingFields.map((f) => f.label).join(", ")}`
      );
    }

    try {
      const finalized: FinalizedForm = {
        id: `final_${Date.now()}`,
        form: activeForm,
        data: formData,
        finalizedDate: new Date().toLocaleDateString(),
      };

      const updatedFinalized = [...finalizedForms, finalized];
      await setFinalizedForms(updatedFinalized);

      // Remove from drafts if it was a draft
      if (activeForm.draftId) {
        const updatedDrafts = draftForms.filter(
          (d) => d.draftId !== activeForm.draftId
        );
        await setDraftForms(updatedDrafts);
      }

      resetForm();
      route.replace("/(odk)");
      return Promise.resolve();
    } catch (error) {
      console.error("Error finalizing form:", error);
      throw error;
    }
  };

  // Send finalized forms
  const handleSendForms = async () => {
    if (finalizedForms.length === 0) {
      throw new Error("No finalized forms to send!");
    }

    try {
      const sent: SentForm[] = finalizedForms.map((f) => ({
        ...f,
        sentDate: new Date().toLocaleDateString(),
        status: "uploaded",
      }));

      const updatedSent = [...sentForms, ...sent];
      await setSentForms(updatedSent);
      await setFinalizedForms([]);

      return Promise.resolve();
    } catch (error) {
      console.error("Error sending forms:", error);
      throw error;
    }
  };

  // Delete draft
  const handleDeleteDraft = async (draftId: string) => {
    try {
      const updatedDrafts = draftForms.filter((d) => d.draftId !== draftId);
      await setDraftForms(updatedDrafts);
    } catch (error) {
      console.error("Error deleting draft:", error);
      throw error;
    }
  };

  // Delete finalized form
  const handleDeleteFinalized = async (id: string) => {
    try {
      const updatedFinalized = finalizedForms.filter((f) => f.id !== id);
      await setFinalizedForms(updatedFinalized);
    } catch (error) {
      console.error("Error deleting finalized form:", error);
      throw error;
    }
  };

  // Clear all data (for testing/reset)
  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DOWNLOADED_FORMS,
        STORAGE_KEYS.DRAFT_FORMS,
        STORAGE_KEYS.FINALIZED_FORMS,
        STORAGE_KEYS.SENT_FORMS,
      ]);
      setDownloadedFormsState([]);
      setDraftFormsState([]);
      setFinalizedFormsState([]);
      setSentFormsState([]);
      resetForm();
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  };

  // Reset form state
  const resetForm = () => {
    setActiveFormState(null);
    setFormDataState({});
  };

  const setActiveForm = (form: ActiveFormState | null) => {
    setActiveFormState(form);
  };

  const setFormData = (data: Record<string, any>) => {
    setFormDataState(data);
  };

  const value: FormContextProps = {
    downloadedForms,
    draftForms,
    finalizedForms,
    sentForms,
    serverForms,
    activeForm,
    formData,
    loading,
    setDownloadedForms,
    setDraftForms,
    setFinalizedForms,
    setSentForms,
    setActiveForm,
    setFormData,
    handleDownloadForm,
    handleOpenForm,
    handleGetForm,
    handleInputChange,
    handleSaveDraft,
    handleFinalize,
    handleSendForms,
    handleDeleteDraft,
    handleDeleteFinalized,
    clearAllData,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};
