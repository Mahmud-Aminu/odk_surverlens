export interface FormSchema {
  id: string;
  title: string;
  description: string;
  version: string;
  lastUpdated: string;
  sections: FormSection[];
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "radio" | "checkbox" | "image";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}
