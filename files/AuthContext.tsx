"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Use refs to prevent unnecessary re-renders and track redirect state
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRedirectingRef = useRef(false);
  const lastRedirectPathRef = useRef<string>("");

  // Single effect to handle auth state and navigation
  useEffect(() => {
    console.log("🔐 AuthProvider: Initializing auth listener");

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        }

        setUser(session?.user ?? null);
        setInitialized(true);
        setLoading(false);

        console.log("📊 Initial session loaded:", {
          hasUser: !!session?.user,
          pathname,
        });
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        setInitialized(true);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, {
        hasUser: !!session?.user,
        pathname,
      });

      setUser(session?.user ?? null);
      setLoading(false);

      // Clear any pending redirects
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    });

    return () => {
      subscription.unsubscribe();
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []); // Only run once on mount

  // Separate effect for handling redirects based on auth state
  useEffect(() => {
    // Don't redirect if not initialized, still loading, or already redirecting
    if (!initialized || loading || isRedirectingRef.current) {
      return;
    }

    const isAuthPage =
      pathname === "/manager/login" || pathname === "/manager/register";
    const isProtectedPage = pathname?.startsWith("/manager/") && !isAuthPage;

    let shouldRedirect = false;
    let redirectPath = "";

    if (user && isAuthPage) {
      // Authenticated user on auth page - redirect to dashboard
      shouldRedirect = true;
      redirectPath = "/manager/dashboard";
      console.log("🔄 Redirecting authenticated user to dashboard");
    } else if (!user && isProtectedPage) {
      // Unauthenticated user on protected page - redirect to login
      shouldRedirect = true;
      redirectPath = "/manager/login";
      console.log("🔄 Redirecting unauthenticated user to login");
    }

    if (shouldRedirect && redirectPath !== lastRedirectPathRef.current) {
      isRedirectingRef.current = true;
      lastRedirectPathRef.current = redirectPath;

      // Use a small delay to prevent rapid redirects
      redirectTimeoutRef.current = setTimeout(() => {
        router.replace(redirectPath);

        // Reset redirect state after navigation
        setTimeout(() => {
          isRedirectingRef.current = false;
        }, 500);
      }, 100);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [user, pathname, initialized, loading, router]);

  // Reset redirect tracking when pathname changes
  useEffect(() => {
    if (pathname !== lastRedirectPathRef.current) {
      isRedirectingRef.current = false;
      lastRedirectPathRef.current = "";
    }
  }, [pathname]);

  const signOut = async () => {
    try {
      console.log("🚪 Signing out...");
      setLoading(true);

      // Clear redirect state
      isRedirectingRef.current = false;
      lastRedirectPathRef.current = "";

      await supabase.auth.signOut();
      // Auth state change will handle the redirect
    } catch (error) {
      console.error("Sign out error:", error);
      setLoading(false);
    }
  };

  console.log("🔍 AuthProvider render:", {
    hasUser: !!user,
    loading,
    initialized,
    isRedirecting: isRedirectingRef.current,
    pathname,
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || isRedirectingRef.current,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
