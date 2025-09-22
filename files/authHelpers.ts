// utils/authHelpers.ts
import { supabase } from "@/app/lib/supabase";
import { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Unexpected error getting current user:", error);
    return null;
  }
};

/**
 * Check if user is authenticated and redirect if not
 */
export const requireAuth = async (): Promise<User | null> => {
  const user = await getCurrentUser();

  if (!user) {
    // This would be used in server components or middleware
    throw new Error("Authentication required");
  }

  return user;
};

/**
 * Enhanced sign in with better error handling
 */
export const enhancedSignIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific Supabase auth errors
      let userFriendlyMessage = "Login failed. Please try again.";

      switch (error.message) {
        case "Invalid login credentials":
          userFriendlyMessage =
            "Invalid email or password. Please check your credentials.";
          break;
        case "Email not confirmed":
          userFriendlyMessage =
            "Please check your email and confirm your account before signing in.";
          break;
        case "Too many requests":
          userFriendlyMessage =
            "Too many login attempts. Please wait a moment and try again.";
          break;
        default:
          userFriendlyMessage = error.message;
      }

      return { data: null, error: { message: userFriendlyMessage } };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected sign in error:", error);
    return {
      data: null,
      error: { message: "An unexpected error occurred. Please try again." },
    };
  }
};

/**
 * Enhanced sign up with better error handling
 */
export const enhancedSignUp = async (
  email: string,
  password: string,
  metadata?: any
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    });

    if (error) {
      // Handle specific Supabase auth errors
      let userFriendlyMessage = "Registration failed. Please try again.";

      switch (error.message) {
        case "User already registered":
          userFriendlyMessage =
            "An account with this email already exists. Please sign in instead.";
          break;
        case "Password should be at least 6 characters":
          userFriendlyMessage = "Password must be at least 6 characters long.";
          break;
        case "Invalid email":
          userFriendlyMessage = "Please enter a valid email address.";
          break;
        default:
          userFriendlyMessage = error.message;
      }

      return { data: null, error: { message: userFriendlyMessage } };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected sign up error:", error);
    return {
      data: null,
      error: { message: "An unexpected error occurred. Please try again." },
    };
  }
};

/**
 * Enhanced sign out
 */
export const enhancedSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return { error: { message: "Failed to sign out properly." } };
    }

    return { error: null };
  } catch (error) {
    console.error("Unexpected sign out error:", error);
    return {
      error: { message: "An unexpected error occurred while signing out." },
    };
  }
};

/**
 * Create an auth state listener
 */
export const createAuthListener = (
  onAuthChange: (user: User | null) => void,
  onError?: (error: any) => void
) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, session?.user?.id || "no user");

    try {
      onAuthChange(session?.user || null);
    } catch (error) {
      console.error("Error in auth state change handler:", error);
      onError?.(error);
    }
  });

  return subscription;
};

/**
 * Check if the current session is valid
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session validation error:", error);
      return false;
    }

    return !!session;
  } catch (error) {
    console.error("Unexpected session validation error:", error);
    return false;
  }
};
