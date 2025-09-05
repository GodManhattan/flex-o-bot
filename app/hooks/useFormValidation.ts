import { useState } from "react";

interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

export const useFormValidation = (validationRules: FieldValidation) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (fieldName: string, value: any): boolean => {
    const rules = validationRules[fieldName];
    if (!rules) return true;

    for (const rule of rules) {
      if (!rule.validator(value)) {
        setErrors((prev) => ({ ...prev, [fieldName]: rule.message }));
        return false;
      }
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  };

  const validateAll = (formData: Record<string, any>): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.keys(validationRules).forEach((fieldName) => {
      const rules = validationRules[fieldName];
      const value = formData[fieldName];

      for (const rule of rules) {
        if (!rule.validator(value)) {
          newErrors[fieldName] = rule.message;
          isValid = false;
          break;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearErrors = () => setErrors({});

  return { errors, validateField, validateAll, clearErrors };
};
