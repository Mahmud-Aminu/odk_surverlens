import { SyncQueueItem, SyncStatus } from "./types";

export class SyncManager<T> {
  private queue: SyncQueueItem<T>[] = [];
  private status: SyncStatus = "synced";
  private onSyncStatusChange?: (status: SyncStatus, error?: Error) => void;
  private isSyncing = false;

  constructor(
    onSyncStatusChange?: (status: SyncStatus, error?: Error) => void
  ) {
    this.onSyncStatusChange = onSyncStatusChange;
  }

  public addToQueue(item: SyncQueueItem<T>): void {
    // Check for duplicate items
    const exists = this.queue.some(
      (queueItem) =>
        queueItem.data.meta.instanceId === item.data.meta.instanceId &&
        queueItem.action === item.action
    );

    if (!exists) {
      this.queue.push(item);
      this.updateStatus("pending");
    }
  }

  public async sync(
    syncFunction: (item: SyncQueueItem<T>) => Promise<void>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
    }
  ): Promise<void> {
    if (this.isSyncing || this.queue.length === 0) return;

    const maxRetries = options?.maxRetries ?? 3;
    const retryDelay = options?.retryDelay ?? 1000;

    this.isSyncing = true;
    this.updateStatus("syncing");

    while (this.queue.length > 0) {
      const item = this.queue[0];
      let retries = 0;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          await syncFunction(item);
          success = true;
          this.queue.shift(); // Remove synced item
        } catch (error) {
          retries++;

          if (retries >= maxRetries) {
            this.isSyncing = false;
            this.updateStatus("error", error as Error);
            throw error;
          }

          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * retries)
          );
        }
      }
    }

    this.isSyncing = false;
    this.updateStatus("synced");
  }

  private updateStatus(status: SyncStatus, error?: Error): void {
    this.status = status;
    this.onSyncStatusChange?.(status, error);
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getQueue(): readonly SyncQueueItem<T>[] {
    return [...this.queue];
  }

  public removeFromQueue(instanceId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(
      (item) => item.data.meta.instanceId !== instanceId
    );

    if (this.queue.length === 0 && this.status !== "syncing") {
      this.updateStatus("synced");
    }

    return this.queue.length < initialLength;
  }

  public clear(): void {
    this.queue = [];
    if (!this.isSyncing) {
      this.updateStatus("synced");
    }
  }

  public isPending(): boolean {
    return this.queue.length > 0;
  }

  public isSyncingNow(): boolean {
    return this.isSyncing;
  }
}
