import { ReactNode } from "react";

export interface ServerForm {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  description?: string;
  hash?: string;
  downloadUrl?: string;
  manifestUrl?: string;
  submissionUrl?: string;
  metadata?: {
    category?: string;
    author?: string;
    tags?: string[];
    submissionUrl?: string;
  };
}

export interface LocalForm {
  id: string;
  title: string;
  version: string;
  downloadedAt: string;
  formPath: string;
  mediaPath?: string;
  hash?: string;
  instances?: number;
  instanceName?: string;
  lastModified?: string;
}

export interface FormInstance {
  instanceId: string;
  formId: string;
  formVersion: string;
  status: "draft" | "finalized" | "submitted" | "error";
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  data: any;
  filePath: string;
  formName: string;
}

export interface DownloadProgress {
  formId: string;
  progress: number;
  total: number;
  status: "downloading" | "processing" | "complete" | "error";
  error?: string;
}

export interface FormContextType {
  // Server forms
  serverForms: ServerForm[];
  loadingServerForms: boolean;
  serverFormsError: string | null;
  refreshServerForms: () => Promise<void>;

  // Local forms
  localForms: LocalForm[];
  loadingLocalForms: boolean;
  localFormsError: string | null;
  refreshLocalForms: () => Promise<void>;

  // Form instances
  formInstances: FormInstance[];
  loadingInstances: boolean;
  instancesError: string | null;
  refreshFormInstances: (formId?: string) => Promise<void>;
  loadFormInstance: (
    formId: string,
    instanceId: string,
  ) => Promise<FormInstance | null>;
  saveFormInstance: (instance: FormInstance) => Promise<void>;
  deleteFormInstance: (formId: string, instanceId: string) => Promise<void>;

  // Download
  handleDownloadForm: (form: ServerForm) => Promise<void>;
  handleDownloadMultipleForms: (forms: ServerForm[]) => Promise<{
    successful: string[];
    failed: { formId: string; error: string }[];
  }>;
  downloadProgress: Map<string, DownloadProgress>;

  // Delete
  handleDeleteForm: (formId: string) => Promise<void>;
  handleDeleteMultipleForms: (formIds: string[]) => Promise<void>;

  // Update
  handleUpdateForm: (formId: string) => Promise<void>;
  checkForUpdates: () => Promise<ServerForm[]>;

  // General
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface FormProviderProps {
  children: ReactNode;
  serverUrl?: string;
  username?: string;
  password?: string;
}
