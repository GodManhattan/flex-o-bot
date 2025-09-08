"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AuthDebugger() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const debugInfo = {
    pathname,
    hasUser: !!user,
    userId: user?.id?.slice(0, 8) + "..." || "none",
    loading,
    timestamp: new Date().toISOString().split("T")[1].slice(0, 8),
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          px-3 py-2 rounded-lg text-xs font-mono transition-all
          ${
            loading
              ? "bg-yellow-500 text-white animate-pulse"
              : user
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }
        `}
      >
        Auth {loading ? "⏳" : user ? "✅" : "❌"}
      </button>

      {isExpanded && (
        <div className="absolute bottom-12 right-0 bg-black text-green-400 p-3 rounded-lg text-xs font-mono w-64 shadow-lg">
          <div className="mb-2 text-green-300 font-bold">Auth Debug Info</div>
          {Object.entries(debugInfo).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-400">{key}:</span>
              <span
                className={
                  key === "loading" && value
                    ? "text-yellow-400"
                    : key === "hasUser" && value
                    ? "text-green-400"
                    : "text-white"
                }
              >
                {String(value)}
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300 text-xs"
            >
              Force Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
