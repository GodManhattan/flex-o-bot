"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state once on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🔐 Initializing auth...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Auth initialization error:", error);
          setUser(null);
        } else {
          console.log("🔐 Initial session:", !!session?.user);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  // Handle auth state changes
  useEffect(() => {
    if (!initialized) return;

    console.log("🔐 Setting up auth listener...");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event, !!session?.user);

      // Always update user state immediately
      setUser(session?.user ?? null);

      // Reset loading state to prevent infinite loading
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  // Handle navigation based on auth state and pathname - separate effect
  useEffect(() => {
    if (!initialized || loading || redirecting) return;

    const handleRedirection = () => {
      // Prevent redirect loops
      if (redirecting) return;

      const isAuthPage =
        pathname === "/manager/login" || pathname === "/manager/register";
      const isProtectedPage = pathname?.startsWith("/manager/") && !isAuthPage;

      if (user && isAuthPage) {
        // Authenticated user on auth page - redirect to dashboard
        console.log("📄 Redirecting authenticated user to dashboard");
        setRedirecting(true);
        router.replace("/manager/dashboard");
        // Reset redirecting state after navigation
        setTimeout(() => setRedirecting(false), 100);
      } else if (!user && isProtectedPage) {
        // Unauthenticated user on protected page - redirect to login
        console.log("📄 Redirecting unauthenticated user to login");
        setRedirecting(true);
        router.replace("/manager/login");
        // Reset redirecting state after navigation
        setTimeout(() => setRedirecting(false), 100);
      }
    };

    // Use a small delay to prevent rapid redirects
    const timeoutId = setTimeout(handleRedirection, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, pathname, initialized, loading, redirecting, router]);

  // Reset redirecting state when pathname changes
  useEffect(() => {
    setRedirecting(false);
  }, [pathname]);

  const signOut = async () => {
    try {
      console.log("🚪 Signing out...");
      setLoading(true);
      await supabase.auth.signOut();
      // Don't manually redirect here - let the auth state change handle it
    } catch (error) {
      console.error("Sign out error:", error);
      setLoading(false);
    }
  };

  console.log("🔐 AuthProvider render:", {
    hasUser: !!user,
    loading,
    initialized,
    redirecting,
    pathname,
  });

  return (
    <AuthContext.Provider
      value={{ user, loading: loading || redirecting, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
