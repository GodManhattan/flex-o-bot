// components/AddUserForm.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useErrorHandler } from "@/app/hooks/useErrorHandler";
import { ErrorAlert } from "@/app/components/ErrorAlert";
import { validatePIN, sanitizeInput } from "@/app/utils/validation";

interface AddUserFormProps {
  onUserAdded: () => void;
  onCancel: () => void;
}

export const AddUserForm: React.FC<AddUserFormProps> = ({
  onUserAdded,
  onCancel,
}) => {
  const [formData, setFormData] = useState({ name: "", pin: "" });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { error, handleError, clearError } = useErrorHandler();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    }

    // Validate PIN
    if (!formData.pin) {
      errors.pin = "PIN is required";
    } else if (!validatePIN(formData.pin)) {
      errors.pin = "PIN must be exactly 4 digits";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "name") {
      processedValue = sanitizeInput(value);
    } else if (name === "pin") {
      // Only allow digits and limit to 4 characters
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if PIN already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("pin", formData.pin)
        .single();

      if (existingUser) {
        setFieldErrors({ pin: "This PIN is already in use" });
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("users").insert([
        {
          name: formData.name.trim(),
          pin: formData.pin,
        },
      ]);

      if (insertError) {
        handleError(insertError);
      } else {
        setFormData({ name: "", pin: "" });
        onUserAdded();
      }
    } catch (err) {
      handleError(err, "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Add New User</h2>

      <ErrorAlert error={error} onClose={clearError} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter full name"
              disabled={loading}
              required
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              4-Digit PIN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pin"
              value={formData.pin}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.pin ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="1234"
              disabled={loading}
              maxLength={4}
              required
            />
            {fieldErrors.pin && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.pin}</p>
            )}
            <p className="mt-1 text-xs text-gray-900">
              Enter a unique 4-digit PIN for this user
            </p>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding User...
              </span>
            ) : (
              "Add User"
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
