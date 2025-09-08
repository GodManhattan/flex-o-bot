"use client";

import { useState, useEffect } from "react";

interface ImprovedLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  timeout?: number; // Auto-refresh after timeout (in ms)
  showRefreshButton?: boolean;
}

export const ImprovedLoadingSpinner: React.FC<ImprovedLoadingSpinnerProps> = ({
  size = "md",
  message = "Loading...",
  timeout = 30000, // 30 seconds default
  showRefreshButton = true,
}) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1000);
    }, 1000);

    const timeoutId = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [timeout]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mb-4`}
        />
        {showTimeout && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
        )}
      </div>

      <p className="text-sm text-gray-600 mb-2 text-center">{message}</p>

      <div className="text-xs text-gray-400 mb-4">
        Loading for {formatTime(timeElapsed)}
      </div>

      {showTimeout && (
        <div className="text-center">
          <p className="text-sm text-yellow-600 mb-3">
            Taking longer than expected...
          </p>
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh Page
            </button>
          )}
        </div>
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600 text-center">
          <div>Development Mode</div>
          <div>Check console for debug info</div>
        </div>
      )}
    </div>
  );
};
