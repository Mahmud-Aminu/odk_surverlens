import { useEffect, useRef, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';

type EditEntry = { 
  path: string; 
  oldValue: any; 
  newValue: any; 
  at: string;
};

type FormMeta = { 
  savedAt?: string; 
  finalized?: boolean; 
  submitted?: boolean;
  edits?: EditEntry[];
  version?: number;
  formId?: string;
  instanceId?: string;
  startedAt?: string;
};

type FormDraft<T> = { 
  data: T; 
  meta: FormMeta;
};

type StorageMode = 'asyncstorage' | 'filesystem';

const STORAGE_PREFIX = "odk_form_";
const DEBOUNCE_MS = 800;
const MAX_EDITS = 100;

// Helper: Set nested value by path
const setNestedValue = (obj: any, path: string, value: any): any => {
  if (!path.includes('.') && !path.includes('[')) {
    return { ...obj, [path]: value };
  }

  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
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
  if (!path.includes('.') && !path.includes('[')) {
    return obj?.[path];
  }

  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  return keys.reduce((acc, key) => acc?.[key], obj);
};

// Generate unique instance ID (ODK-style UUID)
const generateInstanceId = () => {
  return `uuid:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Storage adapter for filesystem
const getFileUri = (key: string) => {
  return `${FileSystem.documentDirectory}${key}.json`;
};

const saveToFileSystem = async (key: string, data: string) => {
  const uri = getFileUri(key);
  await FileSystem.writeAsStringAsync(uri, data);
};

const loadFromFileSystem = async (key: string): Promise<string | null> => {
  try {
    const uri = getFileUri(key);
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      return await FileSystem.readAsStringAsync(uri);
    }
    return null;
  } catch (e) {
    return null;
  }
};

const deleteFromFileSystem = async (key: string) => {
  try {
    const uri = getFileUri(key);
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (e) {
    console.warn('Delete error:', e);
  }
};

export const useFormDraft = <T extends Record<string, any> = Record<string, any>>(
  formId: string,
  opts?: { 
    maxEdits?: number;
    onSaveError?: (error: Error) => void;
    initialData?: T;
    storageMode?: StorageMode; // 'asyncstorage' or 'filesystem'
  }
) => {
  const storageKey = `${STORAGE_PREFIX}${formId}`;
  const maxEdits = opts?.maxEdits ?? MAX_EDITS;
  const storageMode = opts?.storageMode ?? 'asyncstorage';

  const [draft, setDraft] = useState<FormDraft<T>>({
    data: (opts?.initialData || {}) as T,
    meta: { 
      edits: [], 
      finalized: false, 
      submitted: false,
      version: 1,
      formId,
      instanceId: generateInstanceId(),
      startedAt: new Date().toISOString()
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load draft from storage
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        let raw: string | null = null;

        if (storageMode === 'filesystem') {
          raw = await loadFromFileSystem(storageKey);
        } else {
          raw = await AsyncStorage.getItem(storageKey);
        }

        if (!mounted) return;

        if (raw) {
          const stored = JSON.parse(raw);
          setDraft(stored);
        } else if (opts?.initialData) {
          setDraft({
            data: opts.initialData,
            meta: { 
              edits: [], 
              finalized: false, 
              submitted: false,
              version: 1,
              formId,
              instanceId: generateInstanceId(),
              startedAt: new Date().toISOString()
            }
          });
        }
      } catch (e) {
        console.warn("Failed loading draft from storage", e);
        opts?.onSaveError?.(e as Error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [storageKey, formId, storageMode]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  // Persist to storage
  const persist = useCallback(async (value: FormDraft<T>) => {
    try {
      setIsSaving(true);
      const jsonString = JSON.stringify(value);

      if (storageMode === 'filesystem') {
        await saveToFileSystem(storageKey, jsonString);
      } else {
        await AsyncStorage.setItem(storageKey, jsonString);
      }
    } catch (e) {
      console.error("Persist error:", e);
      opts?.onSaveError?.(e as Error);
    } finally {
      setIsSaving(false);
    }
  }, [storageKey, storageMode, opts]);

  // Debounced save
  const scheduleSave = useCallback((value: FormDraft<T>) => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      persist(value);
    }, DEBOUNCE_MS);
  }, [persist]);

  // Update field by path
  const updateField = useCallback((path: string, newValue: any) => {
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

      const nextData = setNestedValue(prev.data, path, newValue);
      
      const editEntry: EditEntry = {
        path,
        oldValue,
        newValue,
        at: new Date().toISOString()
      };

      const edits = [...(prev.meta?.edits || []), editEntry];
      const nextMeta: FormMeta = {
        ...prev.meta,
        savedAt: new Date().toISOString(),
        edits: edits.slice(-maxEdits),
        version: (prev.meta?.version || 1) + 1
      };

      const nextDraft = { data: nextData, meta: nextMeta };
      scheduleSave(nextDraft);
      return nextDraft;
    });
  }, [isLoading, scheduleSave, maxEdits]);

  // Batch update multiple fields
  const updateFields = useCallback((updates: Record<string, any>) => {
    if (isLoading) return;

    setDraft((prev) => {
      if (prev.meta?.finalized || prev.meta?.submitted) return prev;

      let nextData = prev.data;
      const edits: EditEntry[] = [];
      const timestamp = new Date().toISOString();

      Object.entries(updates).forEach(([path, newValue]) => {
        const oldValue = getNestedValue(nextData, path);
        
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          nextData = setNestedValue(nextData, path, newValue);
          edits.push({ path, oldValue, newValue, at: timestamp });
        }
      });

      if (edits.length === 0) return prev;

      const allEdits = [...(prev.meta?.edits || []), ...edits];
      const nextMeta: FormMeta = {
        ...prev.meta,
        savedAt: timestamp,
        edits: allEdits.slice(-maxEdits),
        version: (prev.meta?.version || 1) + 1
      };

      const nextDraft = { data: nextData, meta: nextMeta };
      scheduleSave(nextDraft);
      return nextDraft;
    });
  }, [isLoading, scheduleSave, maxEdits]);

  // Get field value by path
  const getField = useCallback((path: string) => {
    return getNestedValue(draft.data, path);
  }, [draft.data]);

  // Reload from storage
  const loadDraft = useCallback(async () => {
    try {
      let raw: string | null = null;

      if (storageMode === 'filesystem') {
        raw = await loadFromFileSystem(storageKey);
      } else {
        raw = await AsyncStorage.getItem(storageKey);
      }

      if (raw) {
        setDraft(JSON.parse(raw));
      }
    } catch (e) {
      console.warn("loadDraft error:", e);
      opts?.onSaveError?.(e as Error);
    }
  }, [storageKey, storageMode, opts]);

  // Clear draft
  const clearDraft = useCallback(async () => {
    try {
      if (storageMode === 'filesystem') {
        await deleteFromFileSystem(storageKey);
      } else {
        await AsyncStorage.removeItem(storageKey);
      }

      setDraft({
        data: (opts?.initialData || {}) as T,
        meta: { 
          edits: [], 
          finalized: false, 
          submitted: false,
          version: 1,
          formId,
          instanceId: generateInstanceId(),
          startedAt: new Date().toISOString()
        }
      });
    } catch (e) {
      console.warn("clearDraft error:", e);
      opts?.onSaveError?.(e as Error);
    }
  }, [storageKey, storageMode, formId, opts]);

  // Finalize form (ready for submission)
  const finalizeDraft = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    const next: FormDraft<T> = {
      ...draft,
      meta: {
        ...draft.meta,
        finalized: true,
        savedAt: new Date().toISOString()
      }
    };
    
    setDraft(next);
    await persist(next);
    return next;
  }, [draft, persist]);

  // Mark as submitted (ODK-style)
  const markSubmitted = useCallback(async () => {
    const next: FormDraft<T> = {
      ...draft,
      meta: {
        ...draft.meta,
        submitted: true,
        finalized: true,
        savedAt: new Date().toISOString()
      }
    };
    
    setDraft(next);
    await persist(next);
    return next;
  }, [draft, persist]);

  // Reset to initial data
  const resetDraft = useCallback(async () => {
    const initial = {
      data: (opts?.initialData || {}) as T,
      meta: { 
        edits: [], 
        finalized: false, 
        submitted: false,
        version: 1,
        formId,
        instanceId: generateInstanceId(),
        startedAt: new Date().toISOString()
      }
    };
    setDraft(initial);
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
        submitted: draft.meta.submitted
      }
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

  return {
    draftData: draft.data,
    draftMeta: draft.meta,
    updateField,
    updateFields,
    getField,
    loadDraft,
    clearDraft,
    finalizeDraft,
    markSubmitted,
    resetDraft,
    exportInstance,
    saveNow,
    isFinalized: !!draft.meta?.finalized,
    isSubmitted: !!draft.meta?.submitted,
    isLoading,
    isSaving,
    instanceId: draft.meta.instanceId,
  } as const;
};