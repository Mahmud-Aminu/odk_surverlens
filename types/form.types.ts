/**
 * Form Type Definitions
 *
 * Complete TypeScript type definitions for ODK-style form management.
 * Ensures type safety across form download, storage, and submission workflows.
 */

// ============================================================================
// SERVER FORM TYPES
// ============================================================================

/**
 * ServerForm
 * Represents a form available on the ODK server for download
 *
 * Used by:
 * - Form list display
 * - Download operations
 * - Version comparison
 */
export interface ServerForm {
  /** Unique form identifier (formID in ODK) */
  id: string;

  /** Human-readable form name */
  title: string;

  /** Form version string (e.g., "1.0.2") */
  version: string;

  /** Last modification timestamp (ISO 8601) */
  lastUpdated: string;

  /** Optional form description */
  description?: string;

  /** MD5 hash for integrity verification */
  hash?: string;

  /** Direct URL to download form XML */
  downloadUrl?: string;

  /** URL to manifest file (lists media attachments) */
  manifestUrl?: string;

  /** Additional server metadata */
  metadata?: ServerFormMetadata;
}

/**
 * ServerFormMetadata
 * Extended metadata from ODK server
 */
export interface ServerFormMetadata {
  /** Form category/group */
  category?: string;

  /** Form author/creator */
  author?: string;

  /** Tags for organization */
  tags?: string[];

  /** URL for form submissions */
  submissionUrl?: string;

  /** Whether form is active */
  isActive?: boolean;

  /** Number of submissions on server */
  submissionCount?: number;
  instanceName?: string
}

// ============================================================================
// LOCAL FORM TYPES
// ============================================================================

/**
 * LocalForm
 * Represents a form downloaded and stored on the device
 *
 * Used by:
 * - Form selection for data entry
 * - Form management UI
 * - Offline access
 */
export interface LocalForm {
  /** Form identifier */
  id: string;

  /** Form title */
  title: string;

  /** Form version */
  version: string;

  /** When form was downloaded (ISO 8601) */
  downloadedAt: string;

  /** File path to form.xml */
  formPath: string;

  /** Directory path for media files */
  mediaPath?: string;

  /** MD5 hash */
  hash?: string;

  /** Number of saved instances */
  instances?: number;

  /** Last modification time (ISO 8601) */
  lastModified?: string;

  /** Server URL where form was downloaded from */
  serverUrl?: string;

  /** Additional local metadata */
  metadata?: LocalFormMetadata;
}

/**
 * LocalFormMetadata
 * Extended metadata for locally stored forms
 */
export interface LocalFormMetadata {
  /** Whether form has media attachments */
  hasMedia: boolean;

  /** Number of media files */
  mediaCount: number;

  /** Whether form is favorited */
  isFavorite?: boolean;

  /** Custom color for UI */
  color?: string;

  /** Last time form was used */
  lastUsed?: string;

  /** Auto-send submissions */
  autoSend?: boolean;

  /** Auto-delete after submission */
  autoDelete?: boolean;
}

// ============================================================================
// FORM INSTANCE TYPES
// ============================================================================

/**
 * FormInstance
 * Represents a saved form submission (filled form data)
 *
 * Used by:
 * - Saved forms list
 * - Submission queue
 * - Draft management
 */
export interface FormInstance {
  /** Unique instance identifier (UUID) */
  instanceId: string;

  /** Parent form identifier */
  formId: string;

  /** Form version used */
  formVersion: string;

  /** Instance status */
  status: InstanceStatus;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Submission timestamp (ISO 8601) */
  submittedAt?: string;

  /** Form data (JSON representation) */
  data: Record<string, any>;

  /** File path to instance directory */
  filePath: string;

  /** Display name for user */
  displayName?: string;

  /** Instance metadata */
  metadata?: InstanceMetadata;
}

/**
 * InstanceStatus
 * Lifecycle status of a form instance
 */
export type InstanceStatus =
  | "incomplete" // Draft, not yet finalized
  | "complete" // Finalized, ready to submit
  | "submitted" // Successfully submitted
  | "submission_failed"; // Submission failed, needs retry

/**
 * InstanceMetadata
 * Additional instance information
 */
export interface InstanceMetadata {
  /** Whether instance can be edited after completion */
  canEditWhenComplete: boolean;

  /** Whether instance has media attachments */
  hasMedia: boolean;

  /** List of media filenames */
  mediaFiles: string[];

  /** Submission attempt count */
  submitAttempts?: number;

  /** Last submission error */
  lastSubmissionError?: string;

  /** Device information */
  deviceInfo?: {
    deviceId: string;
    platform: string;
    appVersion: string;
  };

  /** Location data */
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
}

// ============================================================================
// DOWNLOAD TYPES
// ============================================================================

/**
 * DownloadProgress
 * Tracks form download progress
 *
 * Used by:
 * - Progress indicators
 * - Download status tracking
 * - User feedback
 */
export interface DownloadProgress {
  /** Form being downloaded */
  formId: string;

  /** Current progress value */
  progress: number;

  /** Total/maximum value */
  total: number;

  /** Current download status */
  status: DownloadStatus;

  /** Error message if failed */
  error?: string;

  /** Download start time */
  startedAt?: string;

  /** Bytes downloaded */
  bytesDownloaded?: number;

  /** Total bytes to download */
  totalBytes?: number;
}

/**
 * DownloadStatus
 * Stages of form download process
 */
export type DownloadStatus =
  | "pending" // Queued, not yet started
  | "downloading" // Downloading form XML
  | "processing" // Processing/parsing form
  | "media" // Downloading media files
  | "saving" // Saving to storage
  | "complete" // Successfully completed
  | "error"; // Failed with error

/**
 * DownloadResult
 * Result of a form download operation
 */
export interface DownloadResult {
  /** Whether download succeeded */
  success: boolean;

  /** Downloaded form ID */
  formId: string;

  /** Path to saved form */
  formPath?: string;

  /** Error message if failed */
  error?: string;

  /** Download duration in milliseconds */
  duration?: number;
}

// ============================================================================
// MEDIA TYPES
// ============================================================================

/**
 * MediaFile
 * Represents a media file attachment
 *
 * Used by:
 * - Form media downloads
 * - Instance media uploads
 * - Media management
 */
export interface MediaFile {
  /** Original filename */
  filename: string;

  /** Media type (image, audio, video, file) */
  mediaType: MediaType;

  /** MIME type */
  mimeType: string;

  /** File size in bytes */
  size: number;

  /** Local file path */
  localPath?: string;

  /** Remote download URL */
  downloadUrl?: string;

  /** MD5 hash */
  hash?: string;
}

/**
 * MediaType
 * Types of media files supported
 */
export type MediaType = "image" | "audio" | "video" | "file";

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * FormValidation
 * Form-level validation results
 */
export interface FormValidation {
  /** Whether form is valid */
  isValid: boolean;

  /** Validation errors by field */
  errors: Record<string, string[]>;

  /** Validation warnings */
  warnings?: Record<string, string[]>;

  /** Missing required fields */
  missingRequired?: string[];
}

// ============================================================================
// SYNC TYPES
// ============================================================================

/**
 * SyncStatus
 * Server synchronization status
 */
export type SyncStatus =
  | "pending" // Queued for sync
  | "syncing" // Currently syncing
  | "synced" // Successfully synced
  | "error"; // Sync failed

/**
 * SyncResult
 * Result of sync operation
 */
export interface SyncResult {
  /** Number of successful syncs */
  successful: number;

  /** Number of failed syncs */
  failed: number;

  /** List of errors */
  errors: {
    formId: string;
    instanceId?: string;
    error: string;
  }[];

  /** Sync duration */
  duration: number;
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

/**
 * StorageInfo
 * Device storage information
 */
export interface StorageInfo {
  /** Total forms stored */
  totalForms: number;

  /** Total instances stored */
  totalInstances: number;

  /** Storage used in bytes */
  storageUsed: number;

  /** Available space in bytes */
  availableSpace: number;

  /** Forms directory path */
  formsPath: string;

  /** Instances directory path */
  instancesPath: string;
}

// ============================================================================
// SERVER CONFIG TYPES
// ============================================================================

/**
 * ServerConfig
 * ODK server configuration
 */
export interface ServerConfig {
  /** Server URL */
  url: string;

  /** Username for authentication */
  username: string;

  /** Password for authentication */
  password?: string;

  /** Server type */
  serverType: ServerType;

  /** Project ID (for ODK Central) */
  projectId?: string;

  /** Whether to use SSL */
  useSSL: boolean;
}

/**
 * ServerType
 * Type of ODK server
 */
export type ServerType = "central" | "aggregate" | "custom";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * FormError
 * Standardized error type for form operations
 */
export interface FormError {
  /** Error code */
  code: FormErrorCode;

  /** Error message */
  message: string;

  /** Original error */
  originalError?: Error;

  /** Additional context */
  context?: Record<string, any>;
}

/**
 * FormErrorCode
 * Standard error codes
 */
export type FormErrorCode =
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "AUTH_ERROR"
  | "PARSE_ERROR"
  | "STORAGE_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "UNKNOWN_ERROR";
