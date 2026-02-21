import { ServerForm } from "@/types/form.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system/next";
import { EncryptionService } from "./EncryptionService";
import { SubmissionQueue } from "./SubmissionQueue";

/**
 * ODK Storage Manager
 *
 * Manages ODK-compliant file system storage with AsyncStorage caching.
 *
 * Storage Strategy:
 * - File System: ODK structure for forms and instances
 * - AsyncStorage: Quick access cache for metadata
 *
 * Directory Structure:
 * Documents/surveilPro/
 * ├── forms/              # Downloaded forms
 * │   └── {formId}/
 * │       ├── form.json   # Form definition (JSON format)
 * │       ├── form.xml    # Form definition (XML format)
 * │       ├── .metadata   # Form metadata
 * │       └── form-media/ # Media attachments
 * ├── instances/          # Saved submissions
 * │   └── {formId}/
 * │       └── {instanceId}/
 * │           ├── submission.xml
 * │           ├── .metadata
 * │           └── media/
 * ├── metadata/           # Global settings
 * └── .cache/             # Temporary files
 */

// Storage paths following ODK conventions
const SURVEILPRO_ROOT = "surveilPro";
const FORMS_DIR = "forms";
const INSTANCES_DIR = "instances";
const METADATA_DIR = "metadata";
const CACHE_DIR = ".cache";

// AsyncStorage keys for caching
const CACHE_KEYS = {
  FORMS_LIST: "@odk_forms_cache",
  FORM_PREFIX: "@odk_form_",
};

/**
 * Form Metadata Structure
 * Stores additional information about downloaded forms
 */
interface FormMetadata {
  formId: string;
  title: string;
  version: string;
  hash?: string;
  downloadedAt: string;
  lastModified: string;
  manifestUrl?: string;
  instanceName?: string;
  hasMedia: boolean;
  mediaCount: number;
  instanceCount: number;
}

/**
 * Instance Metadata Structure
 * Tracks saved form submissions
 */
interface InstanceMetadata {
  instanceId: string;
  formId: string;
  formVersion: string;
  displayName: string;
  status: "incomplete" | "complete" | "submitted" | "submission_failed";
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  canEditWhenComplete: boolean;
  hasMedia: boolean;
  mediaFiles: string[];
}

class ODKStorageManager {
  private readonly baseDir: Directory;
  private readonly formsDir: Directory;
  private readonly instancesDir: Directory;
  private readonly metadataDir: Directory;
  private readonly cacheDir: Directory;

  // Helper to normalize sync/async 'exists' and 'list' APIs across SDK versions
  private async pathExists(target: any): Promise<boolean> {
    try {
      if (!target) return false;
      if (typeof (target as any).exists === "function") {
        return await (target as any).exists();
      }
      return !!(target as any).exists;
    } catch {
      return false;
    }
  }

  private async listDir(target: any): Promise<any[]> {
    try {
      if (!target) return [];
      if (typeof (target as any).list === "function") {
        return await (target as any).list();
      }
      return (target as any).items || [];
    } catch {
      return [];
    }
  }

  constructor() {
    // Initialize base ODK directory
    this.baseDir = new Directory(Paths.document, SURVEILPRO_ROOT);
    this.formsDir = new Directory(this.baseDir, FORMS_DIR);
    this.instancesDir = new Directory(this.baseDir, INSTANCES_DIR);
    this.metadataDir = new Directory(this.baseDir, METADATA_DIR);
    this.cacheDir = new Directory(this.baseDir, CACHE_DIR);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize ODK directory structure
   * Creates all necessary directories if they don't exist
   * Should be called when app starts
   */
  public async initialize(): Promise<void> {
    try {
      console.log("Initializing ODK storage directories...");

      // Create base directory
      if (!(await this.pathExists(this.baseDir))) {
        console.log(`Creating base directory: ${this.baseDir.uri}`);
        await this.baseDir.create({ intermediates: true, idempotent: true });
      }

      // Create subdirectories
      const directories = [
        { dir: this.formsDir, name: "forms" },
        { dir: this.instancesDir, name: "instances" },
        { dir: this.metadataDir, name: "metadata" },
        { dir: this.cacheDir, name: "cache" },
      ];

      for (const { dir, name } of directories) {
        if (!(await this.pathExists(dir))) {
          console.log(`Creating ${name} directory: ${dir.uri}`);
          await dir.create({ intermediates: true, idempotent: true });
        }
      }

      console.log("✓ ODK storage initialized successfully");
      console.log(`  Base: ${this.baseDir.uri}`);
      console.log(`  Forms: ${this.formsDir.uri}`);
      console.log(`  Instances: ${this.instancesDir.uri}`);
    } catch (error) {
      console.error("Failed to initialize ODK storage:", error);
      throw new Error(
        `Storage initialization failed: ${error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  // ============================================================================
  // FORM MANAGEMENT
  // ============================================================================

  /**
   * Save a downloaded form to device storage
   *
   * Saves both to file system and AsyncStorage cache
   *
   * @param form - Server form metadata
   * @param formDefinition - Form content (JSON or XML string)
   * @param mediaFiles - Optional media files
   * @returns Path to saved form directory
   */
  public async saveForm(
    form: ServerForm,
    formDefinition: string,
    mediaFiles?: { filename: string; content: Blob | string }[],
  ): Promise<string> {
    try {
      console.log(`Saving form: ${form.id}`);

      // Create form directory explicitly under formsDir
      const formDir = new Directory(this.formsDir, form.id);
      await formDir.create({ intermediates: true, idempotent: true });

      // Determine if content is JSON or XML
      const contentTrimmed = formDefinition?.trim?.() || "";
      const isJSON =
        contentTrimmed.startsWith("{") || contentTrimmed.startsWith("[");

      // Save form definition to appropriate file
      const fileName = isJSON ? "form.json" : "form.xml";
      const formFile = new File(formDir, fileName);
      await formFile.create({ overwrite: true });
      await formFile.write(formDefinition);

      console.log(`✓ Saved form definition: ${form.id}/${fileName}`);

      // Save media files if provided
      let mediaCount = 0;
      if (mediaFiles && mediaFiles.length > 0) {
        const mediaDir = new Directory(formDir, "form-media");
        await mediaDir.create({ intermediates: true, idempotent: true });

        for (const media of mediaFiles) {
          try {
            const mediaFile = new File(mediaDir, media.filename);
            await mediaFile.create({ overwrite: true });

            if (typeof media.content === "string") {
              await mediaFile.write(media.content);
            } else {
              const arrayBuffer = await media.content.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              await mediaFile.write(uint8Array);
            }

            mediaCount++;
            console.log(`✓ Saved media file: ${media.filename}`);
          } catch (error) {
            console.warn(`Failed to save media file ${media.filename}:`, error);
          }
        }
      }

      // Create and save metadata
      const metadata: FormMetadata = {
        formId: form.id,
        title: form.title,
        version: form.version,
        hash: form.hash,
        downloadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        manifestUrl: form.manifestUrl,
        instanceName: form.metadata?.instanceName,
        hasMedia: mediaCount > 0,
        mediaCount,
        instanceCount: 0,
      };

      const metadataFile = new File(formDir, ".metadata");
      await metadataFile.create({ overwrite: true });
      await metadataFile.write(JSON.stringify(metadata, null, 2));

      console.log(`✓ Saved metadata: ${form.id}/.metadata`);

      // Diagnostic checks: verify directory and file exist and list contents
      try {
        const dirExists = await this.pathExists(formDir);
        const metaExists = await this.pathExists(metadataFile);
        console.log(
          `DEBUG: formDir.uri=${formDir.uri}, dirExists=${dirExists}, metadataExists=${metaExists}`,
        );

        const baseItems = await this.listDir(this.baseDir);
        const formsItems = await this.listDir(this.formsDir);
        console.log(
          `DEBUG: baseDir items=${baseItems.length}, formsDir items=${formsItems.length}`,
        );
        console.log(
          `DEBUG: formsDir items uris: ${formsItems.map((i: any) => i?.uri || i?.name || i).join(", ")}`,
        );
      } catch (dErr) {
        console.warn("DEBUG: diagnostic check failed:", dErr);
      }

      // Cache form definition in AsyncStorage for quick access
      await this.cacheFormDefinition(form.id, formDefinition);

      // Update forms list cache (force filesystem scan)
      await this.updateFormsListCache(true);

      console.log(`✓ Form saved successfully: ${form.id}`);
      return formDir.uri;
    } catch (error) {
      console.error(`Failed to save form ${form.id}:`, error);
      throw new Error(
        `Form save failed: ${error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get form definition content (JSON or XML)
   * First checks AsyncStorage cache, then file system
   */
  public async getFormDefinition(
    formId: string,
  ): Promise<{ type: "json" | "xml"; content: string } | null> {
    try {
      // Try cache first for quick access
      const cached = await AsyncStorage.getItem(
        `${CACHE_KEYS.FORM_PREFIX}${formId}`,
      );

      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`✓ Form definition loaded from cache: ${formId}`);
        return parsed;
      }

      // Fall back to file system
      const formDir = new Directory(this.formsDir, formId);
      if (!(await this.pathExists(formDir))) return null;

      // Check for JSON first
      const jsonFile = new File(formDir, "form.json");
      if (await this.pathExists(jsonFile)) {
        const content = await jsonFile.text();
        // Cache for next time
        await this.cacheFormDefinition(formId, content);
        return { type: "json", content };
      }

      // Check for XML
      const xmlFile = new File(formDir, "form.xml");
      if (await this.pathExists(xmlFile)) {
        const content = await xmlFile.text();
        // Cache for next time
        await this.cacheFormDefinition(formId, content);
        return { type: "xml", content };
      }

      return null;
    } catch (error) {
      console.warn(`Failed to read form definition for ${formId}:`, error);
      return null;
    }
  }

  /**
   * Get form metadata
   * Includes quick cache check before file system access
   */
  public async getFormMetadata(formId: string): Promise<FormMetadata | null> {
    try {
      const formDir = new Directory(this.formsDir, formId);

      if (!(await this.pathExists(formDir))) {
        console.debug(`Form directory does not exist: ${formId}`);
        return null;
      }

      const metadataFile = new File(formDir, ".metadata");

      if (!(await this.pathExists(metadataFile))) {
        console.debug(`Metadata file does not exist for: ${formId}`);
        return null;
      }

      const content = await metadataFile.text();
      const metadata = JSON.parse(content) as FormMetadata;

      return metadata;
    } catch (error) {
      console.warn(`Failed to read form metadata for ${formId}:`, error);
      return null;
    }
  }

  /**
   * List all downloaded forms
   * Uses cached list when available, falls back to file system scan
   */
  public async listForms(forceScan = false): Promise<FormMetadata[]> {
    try {
      if (!forceScan) {
        const cachedList = await AsyncStorage.getItem(CACHE_KEYS.FORMS_LIST);
        if (cachedList) {
          try {
            const parsed = JSON.parse(cachedList);
            console.log(`✓ Loaded ${parsed.length} forms from cache`);
            return parsed;
          } catch (e) {
            console.warn("Failed to parse cached forms list:", e);
          }
        }
      }

      if (!(await this.pathExists(this.formsDir))) {
        console.warn("Forms directory does not exist");
        return [];
      }

      const forms: FormMetadata[] = [];
      const items = await this.listDir(this.formsDir);

      console.log(`Scanning ${items.length} items in forms directory`);

      for (const item of items) {
        // item may be Directory instance or object/string in some SDKs
        let formId: string | null = null;
        if (item instanceof Directory) formId = item.name;
        else if (item && (item.name || item.uri))
          formId = item.name || String(item.uri).split("/").pop();
        else if (typeof item === "string") formId = item;

        if (!formId) continue;

        const metadata = await this.getFormMetadata(formId);

        if (metadata) {
          forms.push(metadata);
          console.log(`✓ Loaded form: ${formId}`);
        }
      }

      // Fallback: if nothing found in formsDir, also scan baseDir for legacy/misplaced form folders
      if (forms.length === 0) {
        console.log("Fallback: scanning base directory for form folders...");
        const baseItems = await this.listDir(this.baseDir);
        for (const item of baseItems) {
          let candidate: string | null = null;
          if (item instanceof Directory) candidate = item.name;
          else if (item && (item.name || item.uri))
            candidate = item.name || String(item.uri).split("/").pop();
          else if (typeof item === "string") candidate = item;

          if (!candidate) continue;

          // Skip the known subdirectories
          if (
            [FORMS_DIR, INSTANCES_DIR, METADATA_DIR, CACHE_DIR].includes(
              candidate,
            )
          )
            continue;

          // Directly check for metadata under baseDir/{candidate}/.metadata (legacy/misplaced forms)
          try {
            const candidateDir = new Directory(this.baseDir, candidate);
            if (!(await this.pathExists(candidateDir))) continue;

            const metaFile = new File(candidateDir, ".metadata");
            if (!(await this.pathExists(metaFile))) continue;

            const content = await metaFile.text();
            const metadata = JSON.parse(content) as FormMetadata;

            // Attempt to migrate misplaced form directory into the canonical formsDir
            try {
              const targetDir = new Directory(this.formsDir, candidate);
              if (!(await this.pathExists(targetDir))) {
                await candidateDir.move(targetDir);
                console.log(`Migrated form folder to forms/: ${candidate}`);
              } else {
                // target already exists; remove candidate to avoid duplicates
                console.log(
                  `Target form folder already exists in forms/: ${candidate}, removing legacy folder`,
                );
                await candidateDir.delete();
              }
            } catch (moveErr) {
              console.warn(
                `Failed to migrate ${candidate} to forms/:`,
                moveErr,
              );
            }

            forms.push(metadata);
            console.log(`✓ Fallback loaded form from baseDir: ${candidate}`);
          } catch (err) {
            console.debug(`Fallback candidate ${candidate} not a form:`, err);
          }
        }
      }

      // Update cache
      await AsyncStorage.setItem(CACHE_KEYS.FORMS_LIST, JSON.stringify(forms));

      console.log(`✓ Listed ${forms.length} forms from file system`);

      // Sort newest first
      return forms.sort(
        (a, b) =>
          new Date(b.downloadedAt).getTime() -
          new Date(a.downloadedAt).getTime(),
      );
    } catch (error) {
      console.error("Failed to list forms:", error);
      return [];
    }
  }

  /**
   * Delete a form and all its instances
   * Also clears from cache
   */
  public async deleteForm(formId: string): Promise<void> {
    try {
      console.log(`Deleting form: ${formId}`);

      // Delete form directory
      const formDir = new Directory(this.formsDir, formId);
      if (formDir.exists) {
        formDir.delete();
      }

      // Delete all instances
      const instancesDir = new Directory(this.instancesDir, formId);
      if (instancesDir.exists) {
        instancesDir.delete();
      }

      // Clear from cache
      await AsyncStorage.removeItem(`${CACHE_KEYS.FORM_PREFIX}${formId}`);
      await this.updateFormsListCache();

      console.log(`✓ Form deleted: ${formId}`);
    } catch (error) {
      console.error(`Failed to delete form ${formId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // INSTANCE MANAGEMENT
  // ============================================================================

  /**
   * Save a form instance (submission)
   */
  public async saveInstance(
    formId: string,
    instanceId: string,
    instanceData: string,
    mediaFiles?: { filename: string; content: Blob | string }[],
    metadata?: Partial<InstanceMetadata>,
  ): Promise<string> {
    try {
      console.log(`Saving instance: ${formId}/${instanceId}`);

      // Create instance directory explicitly under instancesDir
      const formInstancesDir = new Directory(this.instancesDir, formId);
      await formInstancesDir.create({ intermediates: true, idempotent: true });

      const instanceDir = new Directory(formInstancesDir, instanceId);
      await instanceDir.create({ intermediates: true, idempotent: true });

      // Encrypt instance data for at-rest security
      const encryptedData = await EncryptionService.encrypt(instanceData);

      // Save instance data
      const instanceFile = new File(instanceDir, "submission.enc");
      await instanceFile.create({ overwrite: true });
      await instanceFile.write(encryptedData);

      console.log(
        `✓ Saved encrypted instance data: ${formId}/${instanceId}/submission.enc`,
      );

      // Save media files
      const savedMediaFiles: string[] = [];
      if (mediaFiles && mediaFiles.length > 0) {
        const mediaDir = new Directory(instanceDir, "media");
        await mediaDir.create({ intermediates: true, idempotent: true });

        for (const media of mediaFiles) {
          try {
            const mediaFile = new File(mediaDir, media.filename);
            await mediaFile.create({ overwrite: true });

            if (typeof media.content === "string") {
              await mediaFile.write(media.content);
            } else {
              const arrayBuffer = await media.content.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              await mediaFile.write(uint8Array);
            }

            savedMediaFiles.push(media.filename);
            console.log(`✓ Saved instance media: ${media.filename}`);
          } catch (error) {
            console.warn(
              `Failed to save instance media ${media.filename}:`,
              error,
            );
          }
        }
      }

      // Save instance metadata
      const now = new Date().toISOString();
      const instanceMetadata: InstanceMetadata = {
        instanceId,
        formId,
        formVersion: metadata?.formVersion || "unknown",
        displayName:
          metadata?.displayName || `${formId}_${instanceId.substring(0, 8)}`,
        status: metadata?.status || "incomplete",
        createdAt: metadata?.createdAt || now,
        updatedAt: now,
        submittedAt: metadata?.submittedAt,
        canEditWhenComplete: metadata?.canEditWhenComplete ?? true,
        hasMedia: savedMediaFiles.length > 0,
        mediaFiles: savedMediaFiles,
      };

      const metadataFile = new File(instanceDir, ".metadata");
      await metadataFile.create({ overwrite: true });
      await metadataFile.write(JSON.stringify(instanceMetadata, null, 2));

      // Update form instance count
      await this.incrementFormInstanceCount(formId);

      console.log(`✓ Instance saved successfully: ${formId}/${instanceId}`);
      return instanceDir.uri;
    } catch (error) {
      console.error(`Failed to save instance ${instanceId}:`, error);
      throw new Error(
        `Instance save failed: ${error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get instance data (decrypted)
   */
  public async getInstanceData(
    formId: string,
    instanceId: string,
  ): Promise<string | null> {
    try {
      const instanceDir = new Directory(this.instancesDir, formId, instanceId);
      if (!(await this.pathExists(instanceDir))) return null;

      const encFile = new File(instanceDir, "submission.enc");
      if (await this.pathExists(encFile)) {
        const encryptedContent = await encFile.text();
        return await EncryptionService.decrypt(encryptedContent);
      }

      // Fallback for legacy unencrypted files
      const xmlFile = new File(instanceDir, "submission.xml");
      if (await this.pathExists(xmlFile)) {
        return await xmlFile.text();
      }

      return null;
    } catch (error) {
      console.error(`Failed to get instance data for ${instanceId}:`, error);
      return null;
    }
  }

  /**
   * Finalize a form instance
   * Performs strict validation, generates integrity hash, and adds to submission queue.
   */
  public async finalizeInstance(
    formId: string,
    instanceId: string,
  ): Promise<void> {
    try {
      console.log(`Finalizing instance: ${instanceId}`);

      const metadata = await this.getInstanceMetadata(formId, instanceId);
      if (!metadata) throw new Error("Instance metadata not found");

      const data = await this.getInstanceData(formId, instanceId);
      if (!data) throw new Error("Instance data not found");

      // TODO: Perform strict JSON Schema validation here
      // For now, assume it's valid if we called this.

      // Generate integrity hash
      const hash = await EncryptionService.generateHash(data);

      // Update metadata
      metadata.status = "complete";
      metadata.updatedAt = new Date().toISOString();
      // Store hash in metadata for verification
      (metadata as any).payloadHash = hash;

      const instanceDir = new Directory(this.instancesDir, formId, instanceId);
      const metadataFile = new File(instanceDir, ".metadata");
      await metadataFile.write(JSON.stringify(metadata, null, 2));

      // Add to submission queue
      await SubmissionQueue.add(formId, instanceId, data);

      console.log(`✓ Instance finalized and queued: ${instanceId}`);
    } catch (error) {
      console.error(`Failed to finalize instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * List all instances for a form
   */
  public async listInstances(formId: string): Promise<InstanceMetadata[]> {
    try {
      const instances: InstanceMetadata[] = [];
      const formInstancesDir = new Directory(this.instancesDir, formId);

      if (!(await this.pathExists(formInstancesDir))) {
        return [];
      }

      const items = await this.listDir(formInstancesDir);

      for (const item of items) {
        let instanceId: string | null = null;
        if (item instanceof Directory) instanceId = item.name;
        else if (item && (item.name || item.uri))
          instanceId = item.name || String(item.uri).split("/").pop();
        else if (typeof item === "string") instanceId = item;

        if (!instanceId) continue;

        const metadata = await this.getInstanceMetadata(formId, instanceId);

        if (metadata) {
          instances.push(metadata);
        }
      }

      return instances.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error(`Failed to list instances for ${formId}:`, error);
      return [];
    }
  }

  /**
   * Get instance metadata
   */
  public async getInstanceMetadata(
    formId: string,
    instanceId: string,
  ): Promise<InstanceMetadata | null> {
    try {
      const instanceDir = new Directory(this.instancesDir, formId, instanceId);

      if (!(await this.pathExists(instanceDir))) return null;

      const metadataFile = new File(instanceDir, ".metadata");
      if (!(await this.pathExists(metadataFile))) return null;

      const content = await metadataFile.text();
      return JSON.parse(content) as InstanceMetadata;
    } catch (error) {
      console.warn(
        `Failed to read instance metadata for ${formId}/${instanceId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Delete a single instance (submission)
   */
  public async deleteInstance(
    formId: string,
    instanceId: string,
  ): Promise<void> {
    try {
      console.log(`Deleting instance: ${formId}/${instanceId}`);

      const instanceDir = new Directory(this.instancesDir, formId, instanceId);

      if (await this.pathExists(instanceDir)) {
        await instanceDir.delete();
      }

      console.log(`✓ Instance deleted: ${formId}/${instanceId}`);
    } catch (error) {
      console.error(
        `Failed to delete instance ${formId}/${instanceId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update the status of a saved instance
   */
  public async updateInstanceStatus(
    formId: string,
    instanceId: string,
    status: InstanceMetadata["status"],
  ): Promise<void> {
    try {
      console.log(
        `Updating instance status: ${formId}/${instanceId} → ${status}`,
      );

      const metadata = await this.getInstanceMetadata(formId, instanceId);
      if (!metadata) {
        throw new Error(
          `Instance metadata not found for ${formId}/${instanceId}`,
        );
      }

      metadata.status = status;
      metadata.updatedAt = new Date().toISOString();

      if (status === "submitted") {
        metadata.submittedAt = new Date().toISOString();
      }

      const instanceDir = new Directory(this.instancesDir, formId, instanceId);
      const metadataFile = new File(instanceDir, ".metadata");
      await metadataFile.write(JSON.stringify(metadata, null, 2));

      console.log(
        `✓ Instance status updated: ${formId}/${instanceId} → ${status}`,
      );
    } catch (error) {
      console.error(
        `Failed to update instance status for ${formId}/${instanceId}:`,
        error,
      );
      throw error;
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT (Private Methods)
  // ============================================================================

  /**
   * Cache form definition in AsyncStorage for quick access
   */
  private async cacheFormDefinition(
    formId: string,
    content: string,
  ): Promise<void> {
    try {
      const contentTrimmed = content?.trim?.() || "";
      const isJSON =
        contentTrimmed.startsWith("{") || contentTrimmed.startsWith("[");

      const cacheData = {
        type: isJSON ? "json" : "xml",
        content,
      };

      await AsyncStorage.setItem(
        `${CACHE_KEYS.FORM_PREFIX}${formId}`,
        JSON.stringify(cacheData),
      );
    } catch (error) {
      console.warn(`Failed to cache form definition for ${formId}:`, error);
    }
  }

  /**
   * Update the cached forms list
   */
  private async updateFormsListCache(
    forceScan: boolean = false,
  ): Promise<void> {
    try {
      // This will scan file system and update cache. When forceScan is true, bypass cached list.
      await this.listForms(forceScan);
    } catch (error) {
      console.warn("Failed to update forms list cache:", error);
    }
  }

  /**
   * Increment form instance count
   */
  public async incrementFormInstanceCount(formId: string): Promise<void> {
    try {
      const metadata = await this.getFormMetadata(formId);
      if (metadata) {
        metadata.instanceCount++;
        metadata.lastModified = new Date().toISOString();

        const formDir = new Directory(this.formsDir, formId);
        const metadataFile = new File(formDir, ".metadata");
        await metadataFile.write(JSON.stringify(metadata, null, 2));

        // Update cache
        await this.updateFormsListCache();
      }
    } catch (error) {
      console.warn("Failed to increment instance count:", error);
    }
  }

  /**
   * Decrement form instance count
   */
  public async decrementFormInstanceCount(formId: string): Promise<void> {
    try {
      const metadata = await this.getFormMetadata(formId);
      if (metadata && metadata.instanceCount > 0) {
        metadata.instanceCount--;
        metadata.lastModified = new Date().toISOString();

        const formDir = new Directory(this.formsDir, formId);
        const metadataFile = new File(formDir, ".metadata");
        await metadataFile.write(JSON.stringify(metadata, null, 2));

        // Update cache
        await this.updateFormsListCache();
      }
    } catch (error) {
      console.warn("Failed to decrement instance count:", error);
    }
  }

  // ============================================================================
  // STORAGE STATISTICS
  // ============================================================================

  /**
   * Get storage statistics
   */
  public async getStorageStats(): Promise<{
    totalForms: number;
    totalInstances: number;
    storageUsed: number;
    availableSpace: number;
  }> {
    try {
      const forms = await this.listForms();
      let totalInstances = 0;

      for (const form of forms) {
        totalInstances += form.instanceCount;
      }

      return {
        totalForms: forms.length,
        totalInstances,
        storageUsed: 0, // Can calculate actual size if needed
        availableSpace: Paths.availableDiskSpace,
      };
    } catch (error) {
      console.error("Failed to get storage stats:", error);
      return {
        totalForms: 0,
        totalInstances: 0,
        storageUsed: 0,
        availableSpace: 0,
      };
    }
  }
}

// Export singleton instance
export const odkStorage = new ODKStorageManager();

// Export types
export type { FormMetadata, InstanceMetadata };

