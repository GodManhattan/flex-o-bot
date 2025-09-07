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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("🔍 AuthProvider: Current pathname:", pathname);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("🔍 AuthProvider: Initial session check", {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: error?.message,
          pathname,
        });

        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error("Session fetch error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔍 Auth state changed:", {
        event,
        userId: session?.user?.id,
        pathname,
        hasSession: !!session,
      });

      setUser(session?.user ?? null);
      setLoading(false);

      // ONLY handle navigation for specific auth events and routes
      if (event === "SIGNED_IN" && session) {
        console.log("✅ User signed in, checking if should redirect...");
        // Only redirect if user is on login/register pages
        if (pathname === "/manager/login" || pathname === "/manager/register") {
          console.log("🔄 Redirecting from login/register to dashboard");
          router.replace("/manager/dashboard");
        } else {
          console.log(
            "👍 User signed in but staying on current page:",
            pathname
          );
        }
      } else if (event === "SIGNED_OUT") {
        console.log("❌ User signed out, checking if should redirect...");
        // Only redirect if user was on a protected manager route
        if (
          pathname?.startsWith("/manager/") &&
          pathname !== "/manager/login" &&
          pathname !== "/manager/register"
        ) {
          console.log("🔄 Redirecting from protected route to home");
          router.replace("/");
        } else {
          console.log(
            "👍 User signed out but staying on current page:",
            pathname
          );
        }
      } else {
        console.log("👀 Auth state change but no redirect needed:", event);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  const signOut = async () => {
    try {
      console.log("🚪 Signing out user...");
      setLoading(true);
      await supabase.auth.signOut();
      console.log("✅ Sign out successful, redirecting to home");
      router.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("🔍 AuthProvider render:", {
    hasUser: !!user,
    loading,
    pathname,
  });

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
