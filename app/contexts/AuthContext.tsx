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
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    if (!initialized) return;

    console.log("🔐 Setting up auth listener...");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event, !!session?.user);

      setUser(session?.user ?? null);

      // Handle redirects based on auth state and current location
      if (event === "SIGNED_IN" && session) {
        if (pathname === "/manager/login" || pathname === "/manager/register") {
          console.log("🔄 Redirecting authenticated user to dashboard");
          router.replace("/manager/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        if (
          pathname?.startsWith("/manager/") &&
          pathname !== "/manager/login" &&
          pathname !== "/manager/register"
        ) {
          console.log("🔄 Redirecting signed out user to home");
          router.replace("/");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized, router, pathname]);

  const signOut = async () => {
    try {
      console.log("🚪 Signing out...");
      await supabase.auth.signOut();
      router.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  console.log("🔐 AuthProvider render:", {
    hasUser: !!user,
    loading,
    initialized,
    pathname,
  });

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
