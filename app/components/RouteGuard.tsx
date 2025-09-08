"use client";

import { useEffect, useState } from "react";
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
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    // Reset state when pathname changes
    setShouldRender(false);
    setIsCheckingAccess(true);
  }, [pathname]);

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) {
      console.log("⏳ RouteGuard: Auth loading, waiting...");
      setShouldRender(false);
      setIsCheckingAccess(true);
      return;
    }

    console.log("🛡️ RouteGuard: Checking access...", {
      pathname,
      requireAuth,
      hasUser: !!user,
    });

    // Determine if access should be granted
    const shouldAllowAccess = () => {
      if (requireAuth) {
        // Protected route - user must be authenticated
        return !!user;
      } else {
        // Public route - always allow access initially
        // The AuthContext will handle redirects for authenticated users
        return true;
      }
    };

    const hasAccess = shouldAllowAccess();

    if (!hasAccess) {
      console.log("🔒 RouteGuard: Access denied, redirecting to:", redirectTo);
      setShouldRender(false);
      setIsCheckingAccess(false);
      router.replace(redirectTo);
      return;
    }

    // Access granted - render the content
    console.log("✅ RouteGuard: Access granted");
    setShouldRender(true);
    setIsCheckingAccess(false);
  }, [user, loading, requireAuth, pathname, router, redirectTo]);

  // Show loading while auth is loading or while we're checking access
  if (loading || isCheckingAccess || !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading
              ? "Checking authentication..."
              : isCheckingAccess
              ? "Verifying access..."
              : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
