
export type FieldType = 
  | 'text' 
  | 'integer' 
  | 'date' 
  | 'select_one' 
  | 'select_multiple' 
  | 'group' 
  | 'repeat' 
  | 'note';

export interface Choice {
  value: string;
  label: string;
}

export interface FormField {
  type: FieldType;
  name: string;
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  choices?: Choice[];
  relevant?: string;
  inputType?: 'multiline';
  hint?: string;
  fields?: FormField[]; // For groups and repeats
  default?: any;
}

export interface FormSchema {
  id: string;
  title: string;
  version: string;
  description: string;
  fields: FormField[];
  submissionUrl?: string;
  metadata?: {
    instanceName?: string;
  };
}

export interface Submission {
  id: string;
  formId: string;
  formTitle: string;
  timestamp: number;
  data: Record<string, any>;
}

export type AppView = 'list' | 'form' | 'submissions';
