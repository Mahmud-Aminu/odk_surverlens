import AsyncStorage from "@react-native-async-storage/async-storage";
import { EncryptionService } from "./EncryptionService";

export type SubmissionStatus = "pending" | "syncing" | "synced" | "failed";

export interface SubmissionEntry {
    instanceId: string;
    formId: string;
    status: SubmissionStatus;
    payloadHash: string;
    lastAttempt?: string;
    error?: string;
    retryCount: number;
    createdAt: string;
}

const SUBMISSION_QUEUE_KEY = "@surveilpro_submission_queue";

/**
 * SubmissionQueue
 * Manages the queue of finalized forms waiting for synchronization.
 * Handles persistence, status tracking, and integrity verification.
 */
export class SubmissionQueue {
    private static queue: SubmissionEntry[] = [];

    /**
     * Loads the queue from AsyncStorage
     */
    public static async load(): Promise<void> {
        const data = await AsyncStorage.getItem(SUBMISSION_QUEUE_KEY);
        if (data) {
            this.queue = JSON.parse(data);
        }
    }

    /**
     * Persists the queue to AsyncStorage
     */
    private static async persist(): Promise<void> {
        await AsyncStorage.setItem(SUBMISSION_QUEUE_KEY, JSON.stringify(this.queue));
    }

    /**
     * Adds a new finalized form to the submission queue
     */
    public static async add(formId: string, instanceId: string, payload: string): Promise<void> {
        const hash = await EncryptionService.generateHash(payload);

        const entry: SubmissionEntry = {
            instanceId,
            formId,
            status: "pending",
            payloadHash: hash,
            retryCount: 0,
            createdAt: new Date().toISOString(),
        };

        // Check if it already exists
        const existingIndex = this.queue.findIndex(e => e.instanceId === instanceId);
        if (existingIndex !== -1) {
            this.queue[existingIndex] = entry;
        } else {
            this.queue.push(entry);
        }

        await this.persist();
    }

    /**
     * Gets all pending submissions
     */
    public static getPending(): SubmissionEntry[] {
        return this.queue.filter(e => e.status === "pending" || e.status === "failed");
    }

    /**
     * Updates the status of a submission
     */
    public static async updateStatus(
        instanceId: string,
        status: SubmissionStatus,
        error?: string
    ): Promise<void> {
        const entry = this.queue.find(e => e.instanceId === instanceId);
        if (entry) {
            entry.status = status;
            entry.lastAttempt = new Date().toISOString();
            if (status === "failed") {
                entry.retryCount++;
                entry.error = error;
            } else if (status === "synced") {
                entry.error = undefined;
            }
            await this.persist();
        }
    }

    /**
     * Removes a submission from the queue (usually after successful sync)
     */
    public static async remove(instanceId: string): Promise<void> {
        this.queue = this.queue.filter(e => e.instanceId !== instanceId);
        await this.persist();
    }

    /**
     * Gets the status of a specific instance
     */
    public static getStatus(instanceId: string): SubmissionStatus | "not_found" {
        const entry = this.queue.find(e => e.instanceId === instanceId);
        return entry ? entry.status : "not_found";
    }

    /**
     * Clears all synced items from the queue
     */
    public static async clearSynced(): Promise<void> {
        this.queue = this.queue.filter(e => e.status !== "synced");
        await this.persist();
    }
}
