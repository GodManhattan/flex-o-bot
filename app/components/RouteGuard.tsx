// File: app/components/RouteGuard.tsx
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

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      // User needs to be authenticated but isn't
      router.replace(redirectTo);
    } else if (!requireAuth && user) {
      // User is authenticated but shouldn't be on this page (e.g., login page)
      if (pathname === "/manager/login" || pathname === "/manager/register") {
        router.replace("/manager/dashboard");
      }
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
    return null; // Will redirect
  }

  if (
    !requireAuth &&
    user &&
    (pathname === "/manager/login" || pathname === "/manager/register")
  ) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
