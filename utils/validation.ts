import { FormData, FormField, ValidationError } from "@/types/FormFieldTypes";

/**
 * Evaluates a relevant expression
 * Supports simple equality comparisons like:
 * - "${field_name} = 'value'"
 * - "${field_name} != 'value'"
 * - "selected(${field_name}, 'value')" for multi-select
 */
export const evaluateRelevant = (
  expression: string,
  formData: FormData,
): boolean => {
  if (!expression) return true;

  try {
    // Handle selected() function for multi-select fields
    if (expression.includes("selected(")) {
      const match = expression.match(/selected\(\$\{([^}]+)\},\s*'([^']+)'\)/);
      if (match) {
        const fieldName = match[1];
        const value = match[2];
        const fieldValue = formData?.[fieldName];

        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(value);
        }
        return false;
      }
    }

    // Handle simple equality: ${field} = 'value'
    if (expression.includes("=")) {
      // Replace ${variable} with actual values
      let evaluated = expression.replace(/\$\{([^}]+)\}/g, (match, varName) => {
        const val = formData?.[varName];
        // Wrap string values in quotes for proper comparison
        return typeof val === "string" ? `'${val}'` : (val ?? "undefined");
      });

      // Handle != operator
      if (evaluated.includes("!=")) {
        evaluated = evaluated.replace(/!=/g, "!==");
      } else if (evaluated.includes("=")) {
        // Replace = with === for strict comparison
        evaluated = evaluated.replace(/([^!<>])=([^=])/g, "$1===$2");
      }

      // Safely evaluate the expression
      try {
        // eslint-disable-next-line no-eval
        return eval(evaluated);
      } catch (e) {
        console.warn(`Failed to evaluate expression: ${expression}`, e);
        return true; // Show field by default if evaluation fails
      }
    }

    return true;
  } catch (e) {
    console.warn(`Error evaluating relevant: ${expression}`, e);
    return true; // Show field by default if evaluation fails
  }
};

/**
 * Validates a single field
 * @param field The field definition
 * @param value The current value
 * @param strict If true, performs full ODK/JSON Schema validation (for Finalizing)
 */
export const validateField = (
  field: FormField,
  value: any,
  strict: boolean = false,
): ValidationError | null => {
  // If not strict (Draft mode), we might want to skip some checks
  // but "required" is usually checked even in drafts for UI feedback,
  // though it doesn't block saving as draft.

  if (field.required && (strict || value !== undefined)) {
    if (value === null || value === undefined || value === "") {
      return {
        fieldName: field.name,
        message: `${field.label} is required.`,
        type: "required",
      };
    }
  }

  // Constraint validation (Strict mode only)
  if (strict && field.constraint) {
    // Note: In a real app, we'd use an expression evaluator for field.constraint
    // For now, we'll provide a placeholder for complex logic.
    console.debug(`Checking constraint for ${field.name}: ${field.constraint}`);
  }

  // Type-specific validation
  if (value !== undefined && value !== null) {
    if (field.type === "integer" && !Number.isInteger(Number(value))) {
      return {
        fieldName: field.name,
        message: `${field.label} must be an integer.`,
        type: "type",
      };
    }
    // Add more type checks as needed...
  }

  return null;
};

/**
 * Validates the entire form data
 */
export const validateForm = (
  fields: FormField[],
  data: FormData,
  strict: boolean = false,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const checkFields = (fieldList: FormField[]) => {
    for (const field of fieldList) {
      if (field.type === "group" || field.type === "repeat") {
        checkFields(field.fields);
        continue;
      }

      const error = validateField(field, data[field.name], strict);
      if (error) {
        errors.push(error);
      }
    }
  };

  checkFields(fields);
  return errors;
};
