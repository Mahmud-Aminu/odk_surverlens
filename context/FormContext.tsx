import { odkStorage } from "@/utils/StorageManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DownloadProgress,
  FormContextType,
  FormInstance,
  FormProviderProps,
  LocalForm,
  ServerForm,
} from "./FormContext.types";

const FormContext = createContext<FormContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SERVER_URL: "@odk_server_url",
  USERNAME: "@odk_username",
  SERVER_FORMS: "@serverforms",
  LOCAL_FORMS: "@odk_local_forms",
  DOWNLOADED_FORMS: "@odk_downloaded_forms", // Quick access cache
};

/**
 * FormProvider Component
 *
 * Manages form state and operations:
 * - Server forms list (from AsyncStorage)
 * - Local forms (downloaded to device)
 * - Download operations with progress tracking
 * - Form deletion and updates
 *
 * Storage Strategy:
 * 1. Server forms stored in AsyncStorage (@serverforms)
 * 2. Downloaded forms stored in file system (ODK structure)
 * 3. Downloaded forms metadata cached in AsyncStorage for quick access
 */
export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  serverUrl: initialServerUrl,
  username: initialUsername,
  password: initialPassword,
}) => {
  const [serverForms, setServerForms] = useState<ServerForm[]>([]);
  const [localForms, setLocalForms] = useState<LocalForm[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<
    Map<string, DownloadProgress>
  >(new Map());

  const [loadingServerForms, setLoadingServerForms] = useState(false);
  const [loadingLocalForms, setLoadingLocalForms] = useState(false);
  const [serverFormsError, setServerFormsError] = useState<string | null>(null);
  const [localFormsError, setLocalFormsError] = useState<string | null>(null);
  const [formInstances, setFormInstances] = useState<FormInstance[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(false);
  const [instancesError, setInstancesError] = useState<string | null>(null);

  const [serverUrl, setServerUrl] = useState<string | undefined>(
    initialServerUrl,
  );
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeContext();
  }, []);

  /**
   * Initialize context on app start
   * - Initializes ODK storage directories
   * - Loads local forms from cache
   */
  const initializeContext = async () => {
    try {
      // Initialize ODK storage directories
      try {
        await odkStorage.initialize();
        console.log("✓ ODK storage initialized from FormContext");
      } catch (e) {
        console.warn("ODK storage initialization failed:", e);
      }

      // Load local forms from cache
      await refreshLocalForms();
    } catch (error) {
      console.error("Failed to initialize form context:", error);
    }
  };

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null);
    setServerFormsError(null);
    setLocalFormsError(null);
  }, []);

  // ============================================================================
  // SERVER FORMS MANAGEMENT
  // ============================================================================

  /**
   * Refresh server forms list from AsyncStorage
   *
   * Loads the forms list that was previously saved to @serverforms
   * This allows offline access to the forms catalog
   */
  const refreshServerForms = useCallback(async () => {
    try {
      setLoadingServerForms(true);
      setServerFormsError(null);

      // Load forms from AsyncStorage
      const response = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_FORMS);

      if (!response) {
        throw new Error("No forms found in storage. Please add forms first.");
      }

      // Parse stored forms data
      const data = JSON.parse(response);

      // Handle different JSON structures (afp_cases, forms, or direct array)
      let formsList = [];
      if (Array.isArray(data)) {
        formsList = data;
      } else if (data.forms) {
        formsList = data.forms;
      } else if (data.afp_cases) {
        formsList = data.afp_cases;
      }

      // Transform to ServerForm format
      const forms: ServerForm[] = formsList.map((form: any) => ({
        id: form.id || form.formID || `form_${Date.now()}`,
        title: form.title || form.name || "Untitled Form",
        version: form.version || "1.0",
        lastUpdated:
          form.lastModified || form.lastUpdated || new Date().toISOString(),
        description: form.description || "",
        hash: form.hash || form.md5Hash,
        downloadUrl: form.downloadUrl || "",
        submissionUrl: form.submissionUrl || form.metadata?.submissionUrl,
        manifestUrl: form.manifestUrl,
        metadata: {
          category: form.category || form.metadata?.category,
          author: form.author || form.metadata?.author,
          tags: form.tags || form.metadata?.tags,
          submissionUrl: form.submissionUrl || form.metadata?.submissionUrl,
        },
      }));

      setServerForms(forms);
      console.log(`✓ Loaded ${forms.length} forms from AsyncStorage`);
    } catch (error: any) {
      console.error("Failed to fetch server forms:", error);
      setServerFormsError(error.message || "Failed to fetch forms");
      throw error;
    } finally {
      setLoadingServerForms(false);
    }
  }, []);

  // ============================================================================
  // LOCAL FORMS MANAGEMENT
  // ============================================================================

  /**
   * Refresh local forms list from file system and cache
   *
   * Strategy:
   * 1. Try to load from AsyncStorage cache first (fast)
   * 2. If cache is empty, scan file system (slower)
   * 3. Update cache with current state
   */
  const refreshLocalForms = useCallback(async () => {
    try {
      setLoadingLocalForms(true);
      setLocalFormsError(null);

      // Always scan filesystem to get accurate state
      const storedForms = await odkStorage.listForms(true);

      const forms: LocalForm[] = storedForms.map((m) => ({
        id: m.formId,
        title: m.title,
        version: m.version,
        downloadedAt: m.downloadedAt,
        formPath: "",
        mediaPath: undefined,
        hash: m.hash,
        instances: m.instanceCount ?? 0,
        lastModified: m.lastModified,
        metadata: {
          hasMedia: m.hasMedia,
          mediaCount: m.mediaCount,
        },
      }));

      setLocalForms(forms);
      console.log(`✓ Loaded ${forms.length} forms from file system`);
    } catch (error: any) {
      console.error("Failed to load local forms:", error);
      setLocalFormsError(error.message || "Failed to load local forms");
    } finally {
      setLoadingLocalForms(false);
    }
  }, []);

  // ============================================================================
  // FORM DOWNLOAD
  // ============================================================================

  /**
   * Download a single form
   *
   * Process:
   * 1. Load form definition from AsyncStorage (@serverforms)
   * 2. Save to file system using ODK structure
   * 3. Update local forms cache
   * 4. Track progress throughout
   */
  const handleDownloadForm = useCallback(async (form: ServerForm) => {
    try {
      // Initialize progress
      setDownloadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(form.id, {
          formId: form.id,
          progress: 0,
          total: 100,
          status: "downloading",
        });
        return newMap;
      });

      console.log(`⬇️ Downloading form: ${form.id}`);

      // Get form definition from AsyncStorage server cache
      const storedJson = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_FORMS);
      if (!storedJson)
        throw new Error("No forms found in server cache. Refresh first.");

      const parsed = JSON.parse(storedJson);
      const formsList = Array.isArray(parsed)
        ? parsed
        : (parsed.forms ?? parsed.afp_cases ?? []);
      const foundForm = formsList.find(
        (f: any) => (f.id || f.formID) === form.id,
      );
      if (!foundForm)
        throw new Error(`Form ${form.id} not found in server cache`);

      const formDefinition = JSON.stringify(foundForm, null, 2);

      // Update progress: processing
      setDownloadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(form.id, {
          formId: form.id,
          progress: 50,
          total: 100,
          status: "processing",
        });
        return newMap;
      });

      // Save form using ODKStorage
      await odkStorage.saveForm(form, formDefinition, []);

      // Update progress: complete
      setDownloadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(form.id, {
          formId: form.id,
          progress: 100,
          total: 100,
          status: "complete",
        });
        return newMap;
      });

      // Immediately refresh local forms with force scan
      const updatedForms = await odkStorage.listForms(true);
      const mappedForms: LocalForm[] = updatedForms.map((m) => ({
        id: m.formId,
        title: m.title,
        version: m.version,
        downloadedAt: m.downloadedAt,
        formPath: "",
        mediaPath: undefined,
        hash: m.hash,
        instances: m.instanceCount ?? 0,
        lastModified: m.lastModified,
        instanceName: m.instanceName,
        metadata: {
          hasMedia: m.hasMedia,
          mediaCount: m.mediaCount,

        },
      }));

      setLocalForms(mappedForms);

      console.log(`✅ Form downloaded successfully: ${form.id}`);

      // Clear progress after a short delay
      setTimeout(() => {
        setDownloadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(form.id);
          return newMap;
        });
      }, 2000);
    } catch (error: any) {
      console.error(`❌ Failed to download form ${form.id}:`, error);

      setDownloadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(form.id, {
          formId: form.id,
          progress: 0,
          total: 100,
          status: "error",
          error: error.message || "Download failed",
        });
        return newMap;
      });

      throw error;
    }
  }, []);

  /**
   * Download multiple forms
   *
   * Downloads forms sequentially to avoid overwhelming the system
   */
  const handleDownloadMultipleForms = useCallback(
    async (forms: ServerForm[]) => {
      const results = {
        successful: [] as string[],
        failed: [] as { formId: string; error: string }[],
      };

      for (const form of forms) {
        try {
          // Start download for current form
          await handleDownloadForm(form);
          results.successful.push(form.id);
        } catch (error: any) {
          results.failed.push({
            formId: form.id,
            error: error.message || "Download failed",
          });
        }
      }

      // Final refresh to ensure everything is synced
      const updatedForms = await odkStorage.listForms(true);
      const mappedForms: LocalForm[] = updatedForms.map((m) => ({
        id: m.formId,
        title: m.title,
        version: m.version,
        downloadedAt: m.downloadedAt,
        formPath: "",
        mediaPath: undefined,
        hash: m.hash,
        instances: m.instanceCount ?? 0,
        lastModified: m.lastModified,
        metadata: {
          hasMedia: m.hasMedia,
          mediaCount: m.mediaCount,
        },
      }));

      setLocalForms(mappedForms);

      console.log(
        `📥 Bulk download complete: ${results.successful.length} succeeded, ${results.failed.length} failed`,
      );

      return results;
    },
    [handleDownloadForm],
  );

  // ============================================================================
  // FORM DELETION
  // ============================================================================

  /**
   * Delete a local form
   * Removes from file system and updates cache
   */
  const handleDeleteForm = useCallback(
    async (formId: string) => {
      try {
        console.log(`Deleting form: ${formId}`);

        // Delete from file system
        await odkStorage.deleteForm(formId);

        // Refresh local forms and update cache
        await refreshLocalForms();

        console.log(`✓ Form deleted successfully: ${formId}`);
      } catch (error: any) {
        console.error(`Failed to delete form ${formId}:`, error);
        throw error;
      }
    },
    [refreshLocalForms],
  );

  /**
   * Delete multiple forms
   */
  const handleDeleteMultipleForms = useCallback(
    async (formIds: string[]) => {
      for (const formId of formIds) {
        try {
          await handleDeleteForm(formId);
        } catch (error) {
          console.warn(`Failed to delete form ${formId}:`, error);
        }
      }
    },
    [handleDeleteForm],
  );

  // ============================================================================
  // FORM INSTANCE MANAGEMENT
  // ============================================================================

  /**
   * Refresh form instances list
   * Loads all instances for all forms or for a specific form
   */
  const refreshFormInstances = useCallback(
    async (formId?: string) => {
      try {
        setLoadingInstances(true);
        setInstancesError(null);

        const instances: FormInstance[] = [];

        if (formId) {
          // Load instances for specific form
          const formInstancesList = await odkStorage.listInstances(formId);
          formInstancesList.forEach((meta) => {
            instances.push({
              instanceId: meta.instanceId,
              formId: meta.formId,
              formVersion: meta.formVersion,
              status: meta.status as InstanceStatus,
              createdAt: meta.createdAt,
              updatedAt: meta.updatedAt,
              submittedAt: meta.submittedAt,
              data: {}, // Data loaded separately when needed
              filePath: `instances/${formId}/${meta.instanceId}`,
              displayName: meta.displayName,
              metadata: {
                canEditWhenComplete: meta.canEditWhenComplete,
                hasMedia: meta.hasMedia,
                mediaFiles: meta.mediaFiles,
              },
            });
          });
        } else {
          // Load instances for all forms
          for (const form of localForms) {
            const formInstancesList = await odkStorage.listInstances(form.id);
            formInstancesList.forEach((meta) => {
              instances.push({
                instanceId: meta.instanceId,
                formId: meta.formId,
                formVersion: meta.formVersion,
                status: meta.status as InstanceStatus,
                createdAt: meta.createdAt,
                updatedAt: meta.updatedAt,
                submittedAt: meta.submittedAt,
                data: {}, // Data loaded separately when needed
                filePath: `instances/${form.id}/${meta.instanceId}`,
                displayName: meta.displayName,
                metadata: {
                  canEditWhenComplete: meta.canEditWhenComplete,
                  hasMedia: meta.hasMedia,
                  mediaFiles: meta.mediaFiles,
                },
              });
            });
          }
        }

        setFormInstances(instances);
        console.log(`✓ Loaded ${instances.length} form instances`);
      } catch (error: any) {
        console.error("Failed to load form instances:", error);
        setInstancesError(error.message || "Failed to load form instances");
      } finally {
        setLoadingInstances(false);
      }
    },
    [localForms],
  );

  /**
   * Load a specific form instance with its data
   */
  const loadFormInstance = useCallback(
    async (
      formId: string,
      instanceId: string,
    ): Promise<FormInstance | null> => {
      try {
        const metadata = await odkStorage.getInstanceMetadata(
          formId,
          instanceId,
        );
        if (!metadata) return null;

        // Load instance data from file
        const instanceDir = new Directory(
          odkStorage["instancesDir"],
          formId,
          instanceId,
        );
        const instanceFile = new File(instanceDir, "submission.xml");

        let data = {};
        if (await odkStorage["pathExists"](instanceFile)) {
          const xmlContent = await instanceFile.text();
          // Parse XML to data object (simplified - you may need proper XML parsing)
          data = { xmlContent }; // Placeholder - implement proper XML parsing
        }

        return {
          instanceId: metadata.instanceId,
          formId: metadata.formId,
          formVersion: metadata.formVersion,
          status: metadata.status as InstanceStatus,
          createdAt: metadata.createdAt,
          updatedAt: metadata.updatedAt,
          submittedAt: metadata.submittedAt,
          data,
          filePath: `instances/${formId}/${instanceId}`,
          displayName: metadata.displayName,
          metadata: {
            canEditWhenComplete: metadata.canEditWhenComplete,
            hasMedia: metadata.hasMedia,
            mediaFiles: metadata.mediaFiles,
          },
        };
      } catch (error: any) {
        console.error(
          `Failed to load instance ${formId}/${instanceId}:`,
          error,
        );
        return null;
      }
    },
    [],
  );

  /**
   * Save a form instance
   */
  const saveFormInstance = useCallback(
    async (instance: FormInstance) => {
      try {
        // Convert data to XML (simplified - you may need proper XML generation)
        const xmlData = JSON.stringify(instance.data); // Placeholder

        await odkStorage.saveInstance(
          instance.formId,
          instance.instanceId,
          xmlData,
          [], // media files
          {
            formVersion: instance.formVersion,
            displayName: instance.displayName,
            status: instance.status,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
            submittedAt: instance.submittedAt,
            canEditWhenComplete: instance.metadata?.canEditWhenComplete,
            hasMedia: instance.metadata?.hasMedia || false,
            mediaFiles: instance.metadata?.mediaFiles || [],
          },
        );

        // Refresh instances list
        await refreshFormInstances();
      } catch (error: any) {
        console.error(
          `Failed to save instance ${instance.formId}/${instance.instanceId}:`,
          error,
        );
        throw error;
      }
    },
    [refreshFormInstances],
  );

  /**
   * Delete a form instance
   */
  const deleteFormInstance = useCallback(
    async (formId: string, instanceId: string) => {
      try {
        // Delete from file system
        const instanceDir = new Directory(
          odkStorage["instancesDir"],
          formId,
          instanceId,
        );
        if (await odkStorage["pathExists"](instanceDir)) {
          // Note: Directory deletion might need to be implemented in StorageManager
          console.log(`Deleting instance directory: ${instanceDir.uri}`);
        }

        // Update form instance count
        await odkStorage.decrementFormInstanceCount?.(formId);

        // Refresh instances list
        await refreshFormInstances();
      } catch (error: any) {
        console.error(
          `Failed to delete instance ${formId}/${instanceId}:`,
          error,
        );
        throw error;
      }
    },
    [refreshFormInstances],
  );

  /**
   * Update a form (re-download if newer version available)
   */
  const handleUpdateForm = useCallback(
    async (formId: string) => {
      const serverForm = serverForms.find((f) => f.id === formId);
      const localForm = localForms.find((f) => f.id === formId);

      if (!serverForm) {
        throw new Error("Form not found on server");
      }

      if (localForm && serverForm.version === localForm.version) {
        throw new Error("Form is already up to date");
      }

      // Delete old version
      await handleDeleteForm(formId);

      // Download new version
      await handleDownloadForm(serverForm);
    },
    [serverForms, localForms, handleDeleteForm, handleDownloadForm],
  );

  /**
   * Check for form updates
   * Compares local and server versions
   */
  const checkForUpdates = useCallback(async () => {
    await refreshServerForms();

    const updatable: ServerForm[] = [];

    for (const localForm of localForms) {
      const serverForm = serverForms.find((f) => f.id === localForm.id);
      if (serverForm && serverForm.version !== localForm.version) {
        updatable.push(serverForm);
      }
    }

    return updatable;
  }, [serverForms, localForms, refreshServerForms]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: FormContextType = {
    serverForms,
    loadingServerForms,
    serverFormsError,
    refreshServerForms,
    localForms,
    loadingLocalForms,
    localFormsError,
    refreshLocalForms,
    formInstances,
    loadingInstances,
    instancesError,
    refreshFormInstances,
    loadFormInstance,
    saveFormInstance,
    deleteFormInstance,
    handleDownloadForm,
    handleDownloadMultipleForms,
    downloadProgress,
    handleDeleteForm,
    handleDeleteMultipleForms,
    handleUpdateForm,
    checkForUpdates,
    loading: loadingServerForms || loadingLocalForms,
    error: error || serverFormsError || localFormsError,
    clearError,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};
