import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { Directory, File, Paths } from "expo-file-system";
import { gzip, ungzip } from "pako";
import { FormDraft, StorageMode } from "./types";

const STORAGE_PREFIX = "odk_form_";

// Storage utilities
export const getStorageKey = (formId: string) => `${STORAGE_PREFIX}${formId}`;

// File system utilities
export const getFile = (key: string): File => {
  return new File(Paths.document, `${key}.json`);
};

export const saveFileSystem = async (
  key: string,
  data: string
): Promise<void> => {
  try {
    const file = getFile(key);

    // Create file if it doesn't exist, otherwise write will handle it
    if (!file.exists) {
      file.create();
    }

    await file.write(data);
  } catch (error) {
    console.error("Error saving to filesystem:", error);
    throw new Error(
      `Failed to save file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const loadFromFileSystem = async (
  key: string
): Promise<string | null> => {
  try {
    const file = getFile(key);

    if (!file.exists) {
      return null;
    }

    return await file.text();
  } catch (error) {
    console.warn("Error loading from filesystem:", error);
    return null;
  }
};

export const deleteFromFileSystem = async (key: string): Promise<void> => {
  try {
    const file = getFile(key);

    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn("Delete error:", error);
    throw new Error(
      `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// Compression utilities
export const compressData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = gzip(Buffer.from(jsonString));
    return Buffer.from(compressed).toString("base64");
  } catch (error) {
    console.error("Compression error:", error);
    throw new Error(
      `Failed to compress data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const decompressData = (compressed: string): any => {
  try {
    const buffer = Buffer.from(compressed, "base64");
    const decompressed = ungzip(buffer);
    return JSON.parse(Buffer.from(decompressed).toString());
  } catch (error) {
    console.error("Decompression error:", error);
    throw new Error(
      `Failed to decompress data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// Storage management
export const cleanupOldDrafts = async (
  olderThan: Date,
  storageMode: StorageMode
): Promise<void> => {
  try {
    if (storageMode === "filesystem") {
      const directory = new Directory(Paths.document);
      const files = directory.list();

      for (const item of files) {
        if (item instanceof File && item.name.startsWith(STORAGE_PREFIX)) {
          const key = item.name.replace(".json", "");
          const content = await loadFromFileSystem(key);

          if (content) {
            try {
              const draft = JSON.parse(content) as FormDraft<any>;
              const savedAt = draft.meta?.savedAt;

              if (savedAt && new Date(savedAt) < olderThan) {
                await deleteFromFileSystem(key);
              }
            } catch (parseError) {
              console.warn(
                `Failed to parse draft ${key}, skipping:`,
                parseError
              );
            }
          }
        }
      }
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const draftKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));

      for (const key of draftKeys) {
        try {
          const draft = await AsyncStorage.getItem(key);

          if (draft) {
            const parsed = JSON.parse(draft) as FormDraft<any>;
            const savedAt = parsed.meta?.savedAt;

            if (savedAt && new Date(savedAt) < olderThan) {
              await AsyncStorage.removeItem(key);
            }
          }
        } catch (parseError) {
          console.warn(`Failed to parse draft ${key}, skipping:`, parseError);
        }
      }
    }
  } catch (error) {
    console.error("Error cleaning up old drafts:", error);
    throw new Error(
      `Failed to cleanup old drafts: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// Storage operations
export const saveDraft = async <T>(
  key: string,
  draft: FormDraft<T>,
  storageMode: StorageMode,
  compress = true
): Promise<void> => {
  try {
    const data = compress ? compressData(draft) : JSON.stringify(draft);

    if (storageMode === "filesystem") {
      await saveFileSystem(key, data);
    } else {
      await AsyncStorage.setItem(key, data);
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    throw new Error(
      `Failed to save draft: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const loadDraft = async <T>(
  key: string,
  storageMode: StorageMode,
  decompress = true
): Promise<FormDraft<T> | null> => {
  try {
    let data: string | null = null;

    if (storageMode === "filesystem") {
      data = await loadFromFileSystem(key);
    } else {
      data = await AsyncStorage.getItem(key);
    }

    if (!data) return null;

    return decompress ? decompressData(data) : JSON.parse(data);
  } catch (error) {
    console.warn("Error loading draft:", error);
    return null;
  }
};

// List all draft keys
export const listDraftKeys = async (
  storageMode: StorageMode
): Promise<string[]> => {
  try {
    if (storageMode === "filesystem") {
      const directory = new Directory(Paths.document);
      const files = directory.list();

      return files
        .filter(
          (item) => item instanceof File && item.name.startsWith(STORAGE_PREFIX)
        )
        .map((item) => item.name.replace(".json", ""));
    } else {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter((key) => key.startsWith(STORAGE_PREFIX));
    }
  } catch (error) {
    console.error("Error listing draft keys:", error);
    return [];
  }
};

// Get storage info
export const getStorageInfo = async (): Promise<{
  availableSpace: number;
  cacheDir: string;
  documentDir: string;
}> => {
  return {
    availableSpace: Paths.availableDiskSpace,
    cacheDir: Paths.cache.uri,
    documentDir: Paths.document.uri,
  };
};
