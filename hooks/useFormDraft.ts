import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadDraft, saveDraft } from "../utils/storage";
import { SyncManager } from "../utils/sync";
import {
  EditEntry,
  FormDraft,
  FormDraftOptions,
  FormMeta,
  SyncStatus,
} from "../utils/types";
import { validateFormData } from "../utils/validation";

const STORAGE_PREFIX = "odk_form_";
const DEBOUNCE_MS = 800;
const MAX_EDITS = 100;

// Helper: Set nested value by path
const setNestedValue = (obj: any, path: string, value: any): any => {
  if (!path.includes(".") && !path.includes("[")) {
    return { ...obj, [path]: value };
  }

  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: any = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    if (!current[key]) {
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    } else {
      current[key] = Array.isArray(current[key])
        ? [...current[key]]
        : { ...current[key] };
    }
    current = current[key];
  }

  const finalKey = keys[keys.length - 1];
  current[finalKey] = value;

  return result;
};

// Helper: Get nested value by path
const getNestedValue = (obj: any, path: string): any => {
  if (!path.includes(".") && !path.includes("[")) {
    return obj?.[path];
  }

  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  return keys.reduce((acc, key) => acc?.[key], obj);
};

// Generate unique instance ID (ODK-style UUID)
const generateInstanceId = (): string => {
  return `uuid:${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const useFormDraft = <
  T extends Record<string, any> = Record<string, any>,
>(
  formId: string,
  instanceId?: string,
  opts?: FormDraftOptions<T>,
) => {
  // Use instanceId for storage key if provided, otherwise generate one
  const [currentInstanceId, setCurrentInstanceId] = useState<string>(
    instanceId || generateInstanceId(),
  );

  const storageKey = `${STORAGE_PREFIX}${currentInstanceId}`;
  const maxEdits = opts?.maxEdits ?? MAX_EDITS;
  const storageMode = opts?.storageMode ?? "asyncstorage";

  const [draft, setDraft] = useState<FormDraft<T>>({
    data: (opts?.initialData || {}) as T,
    meta: {
      edits: [],
      finalized: false,
      submitted: false,
      version: 1,
      formId,
      instanceId: currentInstanceId,
      startedAt: new Date().toISOString(),
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [validationErrors, setValidationErrors] = useState<{
    [path: string]: string[];
  }>({});

  const saveTimer = useRef<number | null>(null);
  const syncManager = useRef(new SyncManager<T>(opts?.onSync));

  // Load draft from storage
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // If instanceId was provided, try to load existing draft
        if (instanceId) {
          const stored = await loadDraft<T>(storageKey, storageMode, true);

          if (!mounted) return;

          if (stored) {
            setDraft(stored);
          } else {
            // Instance doesn't exist, create new one
            const initialDraft: FormDraft<T> = {
              data: (opts?.initialData || {}) as T,
              meta: {
                edits: [],
                finalized: false,
                submitted: false,
                version: 1,
                formId,
                instanceId: currentInstanceId,
                startedAt: new Date().toISOString(),
              },
            };
            setDraft(initialDraft);
          }
        } else {
          // No instanceId provided, create new draft
          const initialDraft: FormDraft<T> = {
            data: (opts?.initialData || {}) as T,
            meta: {
              edits: [],
              finalized: false,
              submitted: false,
              version: 1,
              formId,
              instanceId: currentInstanceId,
              startedAt: new Date().toISOString(),
            },
          };
          setDraft(initialDraft);
        }
      } catch (error) {
        console.warn("Failed loading draft from storage", error);
        opts?.onSaveError?.(error as Error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [storageKey, formId, instanceId, storageMode, currentInstanceId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  // Persist to storage
  const persist = useCallback(
    async (value: FormDraft<T>) => {
      try {
        setIsSaving(true);
        await saveDraft(storageKey, value, storageMode, true);
      } catch (error) {
        console.error("Persist error:", error);
        opts?.onSaveError?.(error as Error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [storageKey, storageMode, opts],
  );

  // Debounced save
  const scheduleSave = useCallback(
    (value: FormDraft<T>) => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      saveTimer.current = setTimeout(() => {
        persist(value);
      }, DEBOUNCE_MS);
    },
    [persist],
  );

  // Validate field
  const validateField = useCallback(
    (path: string, value: any): string[] => {
      if (!opts?.validation?.[path]) return [];

      const rules = opts.validation[path];
      const errors: string[] = [];

      for (const rule of rules) {
        if (!rule.validate(value)) {
          errors.push(rule.message);
        }
      }

      return errors;
    },
    [opts?.validation],
  );

  // Update field by path
  const updateField = useCallback(
    (path: string, newValue: any) => {
      if (isLoading) {
        console.warn("Cannot update field while loading");
        return;
      }

      setDraft((prev) => {
        if (prev.meta?.finalized || prev.meta?.submitted) {
          console.warn("Cannot update finalized/submitted form");
          return prev;
        }

        const oldValue = getNestedValue(prev.data, path);

        if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
          return prev;
        }

        // Validate field
        const fieldErrors = validateField(path, newValue);
        if (fieldErrors.length > 0) {
          setValidationErrors((prev) => ({ ...prev, [path]: fieldErrors }));
        } else {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[path];
            return next;
          });
        }

        const nextData = setNestedValue(prev.data, path, newValue);

        const editEntry: EditEntry = {
          path,
          oldValue,
          newValue,
          at: new Date().toISOString(),
        };

        const edits = [...(prev.meta?.edits || []), editEntry];
        const nextMeta: FormMeta = {
          ...prev.meta,
          savedAt: new Date().toISOString(),
          edits: edits.slice(-maxEdits),
          version: (prev.meta?.version || 1) + 1,
        };

        const nextDraft = { data: nextData, meta: nextMeta };
        scheduleSave(nextDraft);
        return nextDraft;
      });
    },
    [isLoading, scheduleSave, maxEdits, validateField],
  );

  // Batch update multiple fields
  const updateFields = useCallback(
    (updates: Record<string, any>) => {
      if (isLoading) return;

      setDraft((prev) => {
        if (prev.meta?.finalized || prev.meta?.submitted) return prev;

        let nextData = prev.data;
        const edits: EditEntry[] = [];
        const timestamp = new Date().toISOString();
        const newValidationErrors: { [path: string]: string[] } = {};

        Object.entries(updates).forEach(([path, newValue]) => {
          const oldValue = getNestedValue(nextData, path);

          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            // Validate field
            const fieldErrors = validateField(path, newValue);
            if (fieldErrors.length > 0) {
              newValidationErrors[path] = fieldErrors;
            }

            nextData = setNestedValue(nextData, path, newValue);
            edits.push({ path, oldValue, newValue, at: timestamp });
          }
        });

        if (edits.length === 0) return prev;

        // Update validation errors
        setValidationErrors((prev) => {
          const next = { ...prev };
          // Clear errors for updated fields that are now valid
          Object.keys(updates).forEach((path) => {
            if (!newValidationErrors[path]) {
              delete next[path];
            } else {
              next[path] = newValidationErrors[path];
            }
          });
          return next;
        });

        const allEdits = [...(prev.meta?.edits || []), ...edits];
        const nextMeta: FormMeta = {
          ...prev.meta,
          savedAt: timestamp,
          edits: allEdits.slice(-maxEdits),
          version: (prev.meta?.version || 1) + 1,
        };

        const nextDraft = { data: nextData, meta: nextMeta };
        scheduleSave(nextDraft);
        return nextDraft;
      });
    },
    [isLoading, scheduleSave, maxEdits, validateField],
  );

  // Get field value by path
  const getField = useCallback(
    (path: string) => {
      return getNestedValue(draft.data, path);
    },
    [draft.data],
  );

  // Reload from storage
  const reloadDraft = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await loadDraft<T>(storageKey, storageMode, true);

      if (stored) {
        setDraft(stored);

        // Revalidate all fields
        if (opts?.validation) {
          const validation = validateFormData(stored.data, opts.validation);
          setValidationErrors(validation.errors);
        }
      }
    } catch (error) {
      console.warn("reloadDraft error:", error);
      opts?.onSaveError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, storageMode, opts]);

  // Clear draft
  const clearDraft = useCallback(async () => {
    try {
      const file = new File(Paths.document, `${storageKey}.json`);

      if (storageMode === "filesystem") {
        if (file.exists) {
          file.delete();
        }
      } else {
        await AsyncStorage.removeItem(storageKey);
      }

      const initialDraft: FormDraft<T> = {
        data: (opts?.initialData || {}) as T,
        meta: {
          edits: [],
          finalized: false,
          submitted: false,
          version: 1,
          formId,
          instanceId: generateInstanceId(),
          startedAt: new Date().toISOString(),
        },
      };

      setDraft(initialDraft);
      setValidationErrors({});
    } catch (error) {
      console.warn("clearDraft error:", error);
      opts?.onSaveError?.(error as Error);
    }
  }, [storageKey, storageMode, formId, opts]);

  // Finalize form (ready for submission)
  const finalizeDraft = useCallback(async () => {
    // Validate entire form
    if (opts?.validation) {
      const validation = validateFormData(draft.data, opts.validation);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        throw new Error("Form validation failed");
      }
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    const next: FormDraft<T> = {
      ...draft,
      meta: {
        ...draft.meta,
        finalized: true,
        savedAt: new Date().toISOString(),
      },
    };

    setDraft(next);
    await persist(next);

    // Add to sync queue
    syncManager.current.addToQueue({
      action: "finalize",
      data: next,
      timestamp: new Date().toISOString(),
    });

    return next;
  }, [draft, persist, opts?.validation]);

  // Mark as submitted (ODK-style)
  const markSubmitted = useCallback(async () => {
    const next: FormDraft<T> = {
      ...draft,
      meta: {
        ...draft.meta,
        submitted: true,
        finalized: true,
        savedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      },
    };

    setDraft(next);
    await persist(next);

    // Add to sync queue
    syncManager.current.addToQueue({
      action: "submit",
      data: next,
      timestamp: new Date().toISOString(),
    });

    return next;
  }, [draft, persist]);

  // Reset to initial data
  const resetDraft = useCallback(async () => {
    const initial: FormDraft<T> = {
      data: (opts?.initialData || {}) as T,
      meta: {
        edits: [],
        finalized: false,
        submitted: false,
        version: 1,
        formId,
        instanceId: generateInstanceId(),
        startedAt: new Date().toISOString(),
      },
    };

    setDraft(initial);
    setValidationErrors({});
    await persist(initial);
  }, [opts?.initialData, formId, persist]);

  // Export form instance (ODK XML format compatible)
  const exportInstance = useCallback(() => {
    return {
      id: draft.meta.instanceId,
      formId: draft.meta.formId,
      version: draft.meta.version,
      data: draft.data,
      meta: {
        instanceID: draft.meta.instanceId,
        timeStart: draft.meta.startedAt,
        timeEnd: draft.meta.savedAt,
        finalized: draft.meta.finalized,
        submitted: draft.meta.submitted,
      },
    };
  }, [draft]);

  // Save immediately (bypass debounce)
  const saveNow = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    await persist(draft);
  }, [draft, persist]);

  // Validate entire form
  const validate = useCallback(() => {
    if (!opts?.validation) return { isValid: true, errors: {} };

    const validation = validateFormData(draft.data, opts.validation);
    setValidationErrors(validation.errors);
    return validation;
  }, [draft.data, opts?.validation]);

  // Sync with server
  const sync = useCallback(
    async (syncFunction: (draft: FormDraft<T>) => Promise<void>) => {
      await syncManager.current.sync(async (item) => {
        await syncFunction(item.data);
      });
    },
    [],
  );

  return {
    draftData: draft.data,
    draftMeta: draft.meta,
    updateField,
    updateFields,
    getField,
    loadDraft: reloadDraft,
    clearDraft,
    finalizeDraft,
    markSubmitted,
    resetDraft,
    exportInstance,
    saveNow,
    validate,
    sync,
    isFinalized: !!draft.meta?.finalized,
    isSubmitted: !!draft.meta?.submitted,
    isLoading,
    isSaving,
    syncStatus: syncManager.current.getStatus(),
    syncQueueLength: syncManager.current.getQueueLength(),
    validationErrors,
    isValid: Object.keys(validationErrors).length === 0,
    instanceId: draft.meta.instanceId,
  } as const;
};
