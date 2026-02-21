export type NestedValue<T> = {
  [K in keyof T]: T[K] extends object ? NestedValue<T[K]> : T[K];
};

export type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

export type FormFieldValidation = {
  [path: string]: ValidationRule[];
};

export type EditEntry = {
  path: string;
  oldValue: any;
  newValue: any;
  at: string;
};

export type FormMeta = {
  savedAt?: string;
  finalized?: boolean;
  submitted?: boolean;
  edits?: EditEntry[];
  version?: number;
  formId?: string;
  instanceId?: string;
  formName?: string;
  startedAt?: string;
  lastSyncedAt?: string;
};

export type FormDraft<T> = {
  data: T;
  meta: FormMeta;
};

export type StorageMode = "asyncstorage" | "filesystem";

export type SyncStatus = "pending" | "syncing" | "synced" | "error";

export type SyncQueueItem<T> = {
  action: "update" | "finalize" | "submit";
  data: FormDraft<T>;
  timestamp: string;
};

export interface FormDraftOptions<T> {
  /** Maximum number of edit entries to keep in history */
  maxEdits?: number;

  /** Error callback for save operations */
  onSaveError?: (error: Error) => void;

  /** Initial form data */
  initialData?: T;

  /** Storage mode: 'asyncstorage' or 'filesystem' */
  storageMode?: StorageMode;

  /** Field validation rules */
  validation?: FormFieldValidation;

  /** Sync status change callback */
  onSync?: (status: SyncStatus, error?: Error) => void;
}

export interface StorageInfo {
  availableSpace: number;
  cacheDir: string;
  documentDir: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [path: string]: string[] };
}
