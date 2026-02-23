import { db } from "@/firebaseConfig";
import { odkStorage } from "@/utils/StorageManager";
import { SubmissionEntry, SubmissionQueue } from "@/utils/SubmissionQueue";
import {
  addDoc,
  collection,
  doc,
  FirestoreError,
  getCountFromServer,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";

export const getAfpCasesCount = async (userUid: string): Promise<number> => {
  try {
    const afpRef = collection(db, "afp");
    const q = query(afpRef, where("uid", "==", userUid));

    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting AFP count:", error);
    return 0;
  }
};

/**
 * Production-ready AFP document submission
 */
export const sendDocument = async (
  data: Record<string, any>,
  userUid: string,
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // ---- Guardrails (fail fast) ----
    if (!userUid) {
      throw new Error("User UID is required");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Invalid document payload");
    }

    // ---- Construct payload (immutable) ----
    const payload = {
      ...data,
      uid: userUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // ---- Firestore write ----
    const docRef = await addDoc(collection(db, "afp"), payload);

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    const err = error as FirestoreError;

    console.error("AFP submission failed:", err);

    return {
      success: false,
      error: err.message || "Failed to submit AFP document",
    };
  }
};

export const sendWeeklyReport = async (data: any, type: string) => {
  console.log(data);
};

export class SubmissionService {
  private static isSyncing = false;

  /**
   * Syncs all pending submissions in the queue.
   * @param userId used to tag the submission
   * @param facilityId used to tag the submission
   */
  public static async syncAll(
    userId: string,
    facilityId: string,
  ): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pending = SubmissionQueue.getPending();
      console.log(
        `[SubmissionService] Found ${pending.length} pending submissions.`,
      );

      for (const entry of pending) {
        await this.syncOne(entry, userId, facilityId);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Syncs a specific instance by ID.
   * Useful for manual triggers or immediate sync after finalization.
   */
  public static async syncInstance(
    formId: string,
    instanceId: string,
    userId: string,
    facilityId: string,
  ): Promise<void> {
    const entry = SubmissionQueue.getPending().find(
      (p) => p.instanceId === instanceId,
    ) || {
      instanceId,
      formId,
      status: "pending",
      payloadHash: "",
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    await this.syncOne(entry as SubmissionEntry, userId, facilityId);
  }

  /**
   * Syncs a single submission entry.
   */
  public static async syncOne(
    entry: SubmissionEntry,
    userId: string,
    facilityId: string,
  ): Promise<void> {
    console.log(`[SubmissionService] Syncing instance: ${entry.instanceId}`);
    try {
      SubmissionQueue.updateStatus(entry.instanceId, "syncing");

      // 1. Get Decrypted Data
      const dataStr = await odkStorage.getInstanceData(
        entry.formId,
        entry.instanceId,
      );

      if (!dataStr) {
        throw new Error("Could not retrieve instance data");
      }

      const data = JSON.parse(dataStr);
      const metadata = await odkStorage.getInstanceMetadata(
        entry.formId,
        entry.instanceId,
      );

      // 2. Upload Media (if any)
      // Note: Data structure handles media differently depending on implementation.
      // Assuming metadata.mediaFiles contains filenames, we need to upload them.
      // And update 'data' with the download URLs.
      if (metadata?.mediaFiles && metadata.mediaFiles.length > 0) {
        // TODO: Implement media upload logic here
        // For now, we just log it.
        console.log(
          `[SubmissionService] Instance has ${metadata.mediaFiles.length} media files. Uploading...`,
        );
        // const mediaUrls = await this.uploadMedia(metadata.mediaFiles, ...);
      }

      // 3. Determine Collection
      const collectionName = this.getCollectionName(entry.formId);

      // 4. Prepare Payload
      const payload = {
        ...data,
        metadata: {
          ...data.metadata, // preserve existing metadata inside form data if any
          submissionId: entry.instanceId,
          formId: entry.formId,
          submittedAt: Timestamp.now(),
          submittedBy: userId,
          facilityId: facilityId,
          appVersion: "1.0.0", // TODO: Get real app version
          platform: "mobile",
        },
      };

      // 5. Write to Firestore
      const docRef = doc(db, collectionName, entry.instanceId);
      await setDoc(docRef, payload);

      console.log(
        `[SubmissionService] Successfully synced to ${collectionName}/${entry.instanceId}`,
      );

      // 6. Update Local Status
      await SubmissionQueue.updateStatus(entry.instanceId, "synced");

      // Update ODK metadata status as well to keep them in sync
      // (SubmissionQueue tracks queue status, ODK metadata tracks instance status)
      // Accessing private method via public API if possible, or just note it.
      // Ideally ODKStorageManager should expose a updateStatus method.
    } catch (error: any) {
      console.error(
        `[SubmissionService] Sync failed for ${entry.instanceId}:`,
        error,
      );
      await SubmissionQueue.updateStatus(
        entry.instanceId,
        "failed",
        error.message || "Unknown error",
      );
    }
  }

  private static getCollectionName(formId: string): string {
    if (formId.startsWith("afp")) return "afp_cases";
    if (formId.startsWith("idsr")) return "idsr_cases"; // Default for IDSR
    return "submissions"; // Fallback
  }
}
