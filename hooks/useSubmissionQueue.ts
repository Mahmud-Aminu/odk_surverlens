import { useCallback, useEffect, useState } from "react";
import { SubmissionEntry, SubmissionQueue, SubmissionStatus } from "../utils/SubmissionQueue";

/**
 * useSubmissionQueue
 * React hook to manage and track the state of form submissions.
 * Provides real-time status updates for the UI.
 */
export const useSubmissionQueue = () => {
    const [queue, setQueue] = useState<SubmissionEntry[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Refreshes the local queue state from storage
     */
    const refreshQueue = useCallback(async () => {
        await SubmissionQueue.load();
        setQueue(SubmissionQueue.getPending());
    }, []);

    // Initial load
    useEffect(() => {
        refreshQueue();
    }, [refreshQueue]);

    /**
     * Adds a new submission to the queue
     */
    const addSubmission = async (formId: string, instanceId: string, payload: string) => {
        await SubmissionQueue.add(formId, instanceId, payload);
        await refreshQueue();
    };

    /**
     * Updates the status of an existing submission
     */
    const updateStatus = async (instanceId: string, status: SubmissionStatus, error?: string) => {
        await SubmissionQueue.updateStatus(instanceId, status, error);
        await refreshQueue();
    };

    /**
     * Removes a submission from the queue
     */
    const removeSubmission = async (instanceId: string) => {
        await SubmissionQueue.remove(instanceId);
        await refreshQueue();
    };

    /**
     * Gets the status summary
     */
    const stats = {
        pending: queue.filter(s => s.status === "pending").length,
        syncing: queue.filter(s => s.status === "syncing").length,
        failed: queue.filter(s => s.status === "failed").length,
        total: queue.length
    };

    return {
        queue,
        stats,
        isProcessing,
        setIsProcessing,
        refreshQueue,
        addSubmission,
        updateStatus,
        removeSubmission,
    };
};
