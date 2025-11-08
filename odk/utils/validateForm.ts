import { FormSchema } from "../type/FormType";
export const validateForm = (schema: FormSchema, data: Record<string, any>) => {
  const errors: string[] = [];
  schema.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.required && !data[field.id]) {
        errors.push(`${field.label} is required`);
      }
    });
  });
  return errors;
};

// Auto-format ohone number as user types
export const handlePhoneFormat = (input: string) => {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.substring(1);
  if (!digits.startsWith("234")) digits = "234" + digits;
  return "+" + digits;
};
