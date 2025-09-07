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

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) {
      console.log("⏳ RouteGuard: Auth loading, waiting...");
      setShouldRender(false);
      return;
    }

    console.log("🛡️ RouteGuard: Checking access...", {
      pathname,
      requireAuth,
      hasUser: !!user,
    });

    // Check if access should be granted
    const shouldAllowAccess = () => {
      if (requireAuth) {
        // Protected route - user must be authenticated
        return !!user;
      } else {
        // Public route - always allow access
        // But we might redirect authenticated users away from login/register
        return true;
      }
    };

    const hasAccess = shouldAllowAccess();

    if (!hasAccess) {
      console.log("🔒 RouteGuard: Access denied, redirecting to:", redirectTo);
      setShouldRender(false);
      router.replace(redirectTo);
      return;
    }

    // Special case: redirect authenticated users away from login/register
    if (
      !requireAuth &&
      user &&
      (pathname === "/manager/login" || pathname === "/manager/register")
    ) {
      console.log("🔄 RouteGuard: Redirecting authenticated user to dashboard");
      setShouldRender(false);
      router.replace("/manager/dashboard");
      return;
    }

    // All checks passed - render the content
    console.log("✅ RouteGuard: Access granted");
    setShouldRender(true);
  }, [user, loading, requireAuth, pathname, router, redirectTo]);

  // Show loading while auth is loading or while we're processing
  if (loading || !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? "Checking authentication..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
