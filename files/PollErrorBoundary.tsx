"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class PollErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Poll Error Boundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center max-w-sm w-full">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold mb-2 text-red-800">
              Something Went Wrong
            </h1>
            <p className="text-red-600 mb-4 text-sm">
              {this.state.error?.message ||
                "An unexpected error occurred while loading the poll."}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-2"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  window.history.back();
                }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Go Back
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-600">
                  Debug Info (Development)
                </summary>
                <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for Next.js compatibility
export const PollErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  return (
    <PollErrorBoundaryClass fallback={fallback}>
      {children}
    </PollErrorBoundaryClass>
  );
};

// Custom hook for handling poll navigation errors
export const usePollNavigation = () => {
  const router = useRouter();

  const navigateWithRetry = async (path: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        router.push(path);
        break;
      } catch (error) {
        console.error(`Navigation attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          // Last attempt failed, show error
          throw new Error(
            `Failed to navigate to ${path} after ${retries} attempts`
          );
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
      }
    }
  };

  const safePush = (path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error("Navigation failed:", error);
      // Fallback to window.location
      window.location.href = path;
    }
  };

  const safeReplace = (path: string) => {
    try {
      router.replace(path);
    } catch (error) {
      console.error("Navigation replace failed:", error);
      // Fallback to window.location
      window.location.replace(path);
    }
  };

  return {
    navigateWithRetry,
    safePush,
    safeReplace,
    router,
  };
};
