// components/LoadingWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface LoadingWrapperProps {
  children: React.ReactNode;
  delay?: number; // Delay before showing loading spinner
}

export function LoadingWrapper({ children, delay = 300 }: LoadingWrapperProps) {
  const [showLoading, setShowLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset navigation state when pathname changes
    setIsNavigating(false);
    setShowLoading(false);
  }, [pathname]);

  useEffect(() => {
    // Set up a delay before showing loading spinner
    // This prevents flash of loading for quick navigation
    let timer: NodeJS.Timeout;

    if (isNavigating) {
      timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isNavigating, delay]);

  // Listen for navigation start (you can trigger this from your navigation logic)
  const startNavigation = () => {
    setIsNavigating(true);
    setShowLoading(false);
  };

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
