// components/ErrorAlert.tsx
import React from "react";
import { ErrorState } from "@/app/hooks/useErrorHandler";

interface ErrorAlertProps {
  error: ErrorState | null;
  onClose: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
  if (!error) return null;

  const bgColor =
    error.type === "error"
      ? "bg-red-50 border-red-200"
      : "bg-yellow-50 border-yellow-200";
  const textColor = error.type === "error" ? "text-red-800" : "text-yellow-800";

  return (
    <div className={`border rounded-lg p-4 mb-4 ${bgColor}`}>
      <div className="flex justify-between items-start">
        <p className={`text-sm ${textColor}`}>{error.message}</p>
        <button
          onClick={onClose}
          className={`ml-4 ${textColor} hover:opacity-70 text-lg leading-none`}
          aria-label="Close error message"
        >
          ×
        </button>
      </div>
    </div>
  );
};
