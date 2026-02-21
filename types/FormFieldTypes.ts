/**
 * FormFieldTypes.ts
 *
 * Type definitions for ODK-compatible form fields.
 * Supports all standard ODK/XForm field types and widgets.
 *
 * ODK Field Types Supported:
 * - Text inputs (string, int, decimal)
 * - Select (single/multiple choice)
 * - Date/Time
 * - Location (GPS)
 * - Media capture (photo, audio, video)
 * - Barcode/QR
 * - Signature
 * - Groups and Repeats
 * - Calculations
 * - Notes
 */

// ============================================================================
// BASE FIELD TYPES
// ============================================================================

/**
 * BaseField
 * Core properties shared by all field types
 */
export interface BaseField {
  /** Unique field identifier (name in XForm) */
  name: string;

  /** Field type */
  type: FieldType;

  /** Question label (text shown to user) */
  label: string;

  /** Help text or hint */
  hint?: string;

  /** Whether field is required */
  required?: boolean;

  /** Whether field is read-only */
  readOnly?: boolean;

  /** Relevance condition (skip logic) */
  relevant?: string;

  /** Constraint expression */
  constraint?: string;

  /** Constraint violation message */
  constraintMessage?: string;

  /** Calculation expression */
  calculation?: string;

  /** Default value */
  default?: any;

  /** Appearance hint for rendering */
  appearance?: string;

  /** Field parameters */
  parameters?: Record<string, any>;
}

/**
 * FieldType
 * All supported ODK field types
 */
export type FieldType =
  // Text inputs
  | "text"
  | "integer"
  | "decimal"

  // Selection
  | "select_one"
  | "select_multiple"

  // Date and time
  | "date"
  | "time"
  | "datetime"

  // Location
  | "geopoint"
  | "geotrace"
  | "geoshape"

  // Media
  | "image"
  | "audio"
  | "video"
  | "file"

  // Special inputs
  | "barcode"
  | "signature"

  // Grouping
  | "group"
  | "repeat"

  // Display
  | "note"
  | "acknowledge"

  // Hidden
  | "calculate"
  | "hidden";

// ============================================================================
// TEXT FIELDS
// ============================================================================

/**
 * TextField
 * Standard text input field
 */
export interface TextField extends BaseField {
  type: "text";
  /** Input type hint */
  inputType?: "text" | "email" | "url" | "phone" | "multiline";
  /** Maximum length */
  maxLength?: number;
  /** Minimum length */
  minLength?: number;
  /** Regex pattern */
  pattern?: string;
  /** Autocomplete suggestions */
  autocomplete?: string[];
}

/**
 * IntegerField
 * Numeric input for integers
 */
export interface IntegerField extends BaseField {
  type: "integer";
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
}

/**
 * DecimalField
 * Numeric input for decimals
 */
export interface DecimalField extends BaseField {
  type: "decimal";
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Decimal places */
  decimalPlaces?: number;
}

// ============================================================================
// SELECTION FIELDS
// ============================================================================

/**
 * SelectOption
 * Option for select fields
 */
export interface SelectOption {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Option image */
  image?: string;
  /** Option audio */
  audio?: string;
}

/**
 * SelectOneField
 * Single choice selection
 */
export interface SelectOneField extends BaseField {
  type: "select_one";
  /** Available options */
  choices: SelectOption[];
  /** Choice list name (for external choices) */
  choiceListName?: string;
  /** Appearance: minimal, compact, quickcompact, etc. */
  appearance?: "minimal" | "dropdown" | "autocomplete" | "image-map" | "likert";
}

/**
 * SelectMultipleField
 * Multiple choice selection
 */
export interface SelectMultipleField extends BaseField {
  type: "select_multiple";
  /** Available options */
  choices: SelectOption[];
  /** Choice list name */
  choiceListName?: string;
  /** Appearance */
  appearance?: "minimal" | "compact" | "label";
  /** Minimum selections required */
  minSelections?: number;
  /** Maximum selections allowed */
  maxSelections?: number;
}

// ============================================================================
// DATE/TIME FIELDS
// ============================================================================

/**
 * DateField
 * Date picker
 */
export interface DateField extends BaseField {
  type: "date";
  /** Minimum date */
  minDate?: string;
  /** Maximum date */
  maxDate?: string;
  /** Appearance: month-year, year, etc. */
  appearance?: "month-year" | "year" | "ethiopian" | "coptic" | "islamic";
}

/**
 * TimeField
 * Time picker
 */
export interface TimeField extends BaseField {
  type: "time";
}

/**
 * DateTimeField
 * Date and time picker
 */
export interface DateTimeField extends BaseField {
  type: "datetime";
  /** Minimum datetime */
  minDateTime?: string;
  /** Maximum datetime */
  maxDateTime?: string;
}

// ============================================================================
// LOCATION FIELDS
// ============================================================================

/**
 * GeoPointField
 * Single GPS coordinate
 */
export interface GeoPointField extends BaseField {
  type: "geopoint";
  /** Accuracy threshold in meters */
  accuracyThreshold?: number;
  /** Appearance: placement-map, maps */
  appearance?: "placement-map" | "maps";
}

/**
 * GeoTraceField
 * GPS line/path
 */
export interface GeoTraceField extends BaseField {
  type: "geotrace";
  /** Appearance */
  appearance?: "placement-map" | "maps";
}

/**
 * GeoShapeField
 * GPS polygon/area
 */
export interface GeoShapeField extends BaseField {
  type: "geoshape";
  /** Appearance */
  appearance?: "placement-map" | "maps";
}

// ============================================================================
// MEDIA FIELDS
// ============================================================================

/**
 * ImageField
 * Photo capture or selection
 */
export interface ImageField extends BaseField {
  type: "image";
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Image quality (0-100) */
  quality?: number;
  /** Appearance: signature, draw, annotate, new */
  appearance?: "signature" | "draw" | "annotate" | "new" | "selfie";
}

/**
 * AudioField
 * Audio recording
 */
export interface AudioField extends BaseField {
  type: "audio";
  /** Maximum duration in seconds */
  maxDuration?: number;
  /** Audio quality */
  quality?: "low" | "medium" | "high";
}

/**
 * VideoField
 * Video recording
 */
export interface VideoField extends BaseField {
  type: "video";
  /** Maximum duration in seconds */
  maxDuration?: number;
  /** Video quality */
  quality?: "low" | "medium" | "high";
}

/**
 * FileField
 * File attachment
 */
export interface FileField extends BaseField {
  type: "file";
  /** Allowed file types */
  acceptedTypes?: string[];
  /** Maximum file size */
  maxSize?: number;
}

// ============================================================================
// SPECIAL FIELDS
// ============================================================================

/**
 * BarcodeField
 * Barcode/QR code scanner
 */
export interface BarcodeField extends BaseField {
  type: "barcode";
  /** Barcode format */
  format?: "qr" | "code128" | "ean13" | "upca" | "all";
}

/**
 * SignatureField
 * Signature capture
 */
export interface SignatureField extends BaseField {
  type: "signature";
}

/**
 * NoteField
 * Display-only text
 */
export interface NoteField extends BaseField {
  type: "note";
  /** Note content (supports HTML) */
  content?: string;
}

/**
 * AcknowledgeField
 * Confirmation checkbox
 */
export interface AcknowledgeField extends BaseField {
  type: "acknowledge";
  /** Acknowledgment text */
  content?: string;
}

/**
 * CalculateField
 * Hidden calculation field
 */
export interface CalculateField extends BaseField {
  type: "calculate";
  /** Calculation expression */
  calculation: string;
}

/**
 * HiddenField
 * Hidden field with fixed value
 */
export interface HiddenField extends BaseField {
  type: "hidden";
  /** Hidden value */
  value: any;
}

// ============================================================================
// GROUPING FIELDS
// ============================================================================

/**
 * GroupField
 * Groups multiple fields together
 */
export interface GroupField extends BaseField {
  type: "group";
  /** Fields in this group */
  fields: FormField[];
  /** Appearance: field-list, table-list, label */
  appearance?: "field-list" | "table-list" | "label";
}

/**
 * RepeatField
 * Repeatable group of fields
 */
export interface RepeatField extends BaseField {
  type: "repeat";
  /** Fields in repeat */
  fields: FormField[];
  /** Minimum repetitions */
  minRepeat?: number;
  /** Maximum repetitions */
  maxRepeat?: number;
  /** Fixed count */
  count?: number;
  /** Appearance */
  appearance?: "field-list" | "table-list" | "compact";
}

// ============================================================================
// UNION TYPE
// ============================================================================

/**
 * FormField
 * Union of all field types
 */
export type FormField =
  | TextField
  | IntegerField
  | DecimalField
  | SelectOneField
  | SelectMultipleField
  | DateField
  | TimeField
  | DateTimeField
  | GeoPointField
  | GeoTraceField
  | GeoShapeField
  | ImageField
  | AudioField
  | VideoField
  | FileField
  | BarcodeField
  | SignatureField
  | NoteField
  | AcknowledgeField
  | CalculateField
  | HiddenField
  | GroupField
  | RepeatField;

// ============================================================================
// FORM DEFINITION
// ============================================================================

/**
 * FormDefinition
 * Complete form structure
 */
export interface FormDefinition {
  /** Form ID */
  id: string;

  /** Form title */
  title: string;

  /** Form version */
  version: string;

  /** Instance ID prefix */
  instanceIdPrefix?: string;

  /** Default language */
  defaultLanguage?: string;

  /** Available languages */
  languages?: string[];

  /** Form fields */
  fields: FormField[];

  /** Form-level metadata */
  metadata?: {
    instanceID?: string;
    instanceName?: string;
    submissionUrl?: string;
    publicKey?: string;
    autoSend?: boolean;
    autoDelete?: boolean;
  };

  /** Custom form settings */
  settings?: Record<string, any>;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * ValidationError
 * Field validation error
 */
export interface ValidationError {
  /** Field name */
  fieldName: string;

  /** Error message */
  message: string;

  /** Error type */
  type: "required" | "constraint" | "type" | "custom";
}

/**
 * FieldValue
 * Value for any field type
 */
export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined
  | Record<string, any>;

/**
 * FormData
 * Complete form data structure
 */
export type FormData = Record<string, FieldValue>;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * FieldState
 * Runtime state of a field
 */
export interface FieldState {
  /** Current value */
  value: FieldValue;

  /** Whether field is visible (relevant) */
  visible: boolean;

  /** Whether field is required */
  required: boolean;

  /** Whether field is read-only */
  readOnly: boolean;

  /** Validation errors */
  errors: string[];

  /** Whether field has been touched */
  touched: boolean;

  /** Whether field is currently focused */
  focused: boolean;
}
