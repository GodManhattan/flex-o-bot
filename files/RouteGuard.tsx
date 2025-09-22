"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  requireAuth = false,
  redirectTo = "/manager/login",
}: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);
  const checkCompleteRef = useRef(false);

  useEffect(() => {
    // Reset state when pathname changes
    setShouldRender(false);
    checkCompleteRef.current = false;
  }, [pathname]);

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) {
      console.log("⏳ RouteGuard: Auth loading, waiting...");
      setShouldRender(false);
      checkCompleteRef.current = false;
      return;
    }

    // Prevent multiple checks for the same route
    if (checkCompleteRef.current) {
      return;
    }

    console.log("🛡️ RouteGuard: Checking access...", {
      pathname,
      requireAuth,
      hasUser: !!user,
    });

    // Determine if access should be granted
    const hasAccess = requireAuth ? !!user : true;

    if (!hasAccess) {
      console.log("🔒 RouteGuard: Access denied, redirecting to:", redirectTo);
      setShouldRender(false);
      checkCompleteRef.current = true;

      // Use replace to avoid adding to history stack
      router.replace(redirectTo);
      return;
    }

    // Access granted - render the content
    console.log("✅ RouteGuard: Access granted");
    setShouldRender(true);
    checkCompleteRef.current = true;
  }, [user, loading, requireAuth, pathname, router, redirectTo]);

  // Show loading while auth is loading or access check is incomplete
  if (
    loading ||
    !checkCompleteRef.current ||
    (requireAuth && !user && !loading)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? "Checking authentication..." : "Verifying access..."}
          </p>
        </div>
      </div>
    );
  }

  // Only render children if we should render and have completed the access check
  if (!shouldRender) {
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
