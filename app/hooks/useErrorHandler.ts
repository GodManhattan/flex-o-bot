// hooks/useErrorHandler.ts
import { useState } from "react";

export interface ErrorState {
  message: string;
  type: "error" | "warning" | "info";
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = (error: any, customMessage?: string) => {
    console.error("Error occurred:", error);

    let message = customMessage || "An unexpected error occurred";

    if (error?.message) {
      // Handle common Supabase errors
      if (error.message.includes("duplicate key")) {
        message = "This entry already exists";
      } else if (error.message.includes("unauthorized")) {
        message = "You are not authorized to perform this action";
      } else if (error.message.includes("network")) {
        message = "Network error. Please check your connection";
      } else {
        message = error.message;
      }
    }

    setError({ message, type: "error" });

    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};
