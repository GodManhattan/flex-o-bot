"use client";

import { useEffect } from "react";
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

  console.log("🛡️ RouteGuard:", {
    pathname,
    requireAuth,
    hasUser: !!user,
    loading,
    redirectTo,
  });

  useEffect(() => {
    if (loading) {
      console.log("⏳ RouteGuard: Still loading, waiting...");
      return;
    }

    console.log("🛡️ RouteGuard: Checking protection...", {
      requireAuth,
      hasUser: !!user,
      pathname,
    });

    if (requireAuth && !user) {
      console.log(
        "🔒 RouteGuard: Auth required but no user, redirecting to:",
        redirectTo
      );
      router.replace(redirectTo);
    } else if (!requireAuth && user) {
      console.log(
        "🔓 RouteGuard: User authenticated but shouldn't be on this page"
      );
      // Only redirect from login/register pages
      if (pathname === "/manager/login" || pathname === "/manager/register") {
        console.log(
          "🔄 RouteGuard: Redirecting authenticated user to dashboard"
        );
        router.replace("/manager/dashboard");
      } else {
        console.log("👍 RouteGuard: User authenticated but page is allowed");
      }
    } else {
      console.log("✅ RouteGuard: All good, showing content");
    }
  }, [user, loading, requireAuth, router, redirectTo, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    console.log("🚫 RouteGuard: Blocking access, will redirect");
    return null; // Will redirect
  }

  if (
    !requireAuth &&
    user &&
    (pathname === "/manager/login" || pathname === "/manager/register")
  ) {
    console.log(
      "🚫 RouteGuard: Blocking access to login/register for authenticated user"
    );
    return null; // Will redirect
  }

  console.log("✅ RouteGuard: Rendering children");
  return <>{children}</>;
}
