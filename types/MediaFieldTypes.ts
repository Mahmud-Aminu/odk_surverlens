// Media-specific validation and handling types
export interface MediaValidation {
  maxSize?: number; // Maximum file size in bytes
  allowedTypes?: string[]; // Allowed mime types
  aspectRatio?: number; // Required aspect ratio for images
  minDuration?: number; // Minimum duration for audio/video in seconds
  maxDuration?: number; // Maximum duration for audio/video in seconds
  quality?: number; // Quality setting (0-100 for images)
}

export interface MediaError {
  type: "permission" | "capture" | "size" | "format" | "duration";
  message: string;
}

export interface MediaValue {
  uri: string;
  type: string;
  name?: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
}
