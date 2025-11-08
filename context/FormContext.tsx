import { createContext, useContext } from "react";
import { FormSchema } from "../odk/type/FormType";

// Define types for forms

export interface DraftForm {
  draftId: string;
  form: FormSchema;
  data: Record<string, any>;
  savedDate: string;
}

export interface FinalizedForm {
  id: string;
  form: FormSchema;
  data: Record<string, any>;
  finalizedDate: string;
}

export interface SentForm extends FinalizedForm {
  sentDate: string;
  status: string;
}

export interface ActiveFormState extends FormSchema {
  isDraft?: boolean;
  draftId?: string;
}

// Context Props Interface
export interface FormContextProps {
  downloadedForms: FormSchema[];
  draftForms: DraftForm[];
  finalizedForms: FinalizedForm[];
  sentForms: SentForm[];
  serverForms: FormSchema[];
  activeForm: ActiveFormState | null;
  formData: Record<string, any>;
  loading: boolean;
  setDownloadedForms: (forms: FormSchema[]) => Promise<void>;
  setDraftForms: (forms: DraftForm[]) => Promise<void>;
  setFinalizedForms: (forms: FinalizedForm[]) => Promise<void>;
  setSentForms: (forms: SentForm[]) => Promise<void>;
  setActiveForm: (form: ActiveFormState | null) => void;
  setFormData: (data: Record<string, any>) => void;
  handleDownloadForm: (form: FormSchema) => Promise<void>;
  handleOpenForm: (
    form: FormSchema,
    existingData?: DraftForm,
    isDraft?: boolean
  ) => void;
  handleInputChange: (fieldId: string, value: any) => void;
  handleSaveDraft: () => Promise<void>;
  handleGetForm: () => Promise<void>;
  handleFinalize: () => Promise<void>;
  handleSendForms: () => Promise<void>;
  handleDeleteDraft: (draftId: string) => Promise<void>;
  handleDeleteFinalized: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

// Storage keys
export const STORAGE_KEYS = {
  DOWNLOADED_FORMS: "@odk_downloaded_forms",
  DRAFT_FORMS: "@odk_draft_forms",
  FINALIZED_FORMS: "@odk_finalized_forms",
  SENT_FORMS: "@odk_sent_forms",
  SELECTED_FORM: "@odk_selected_form",
};

// Create Context
export const FormContext = createContext<FormContextProps | undefined>(
  undefined
);

// Custom Hook
export const useForm = (): FormContextProps => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};
