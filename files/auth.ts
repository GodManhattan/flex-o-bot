// utils/auth.ts
import { supabase } from "@/app/lib/supabase";
import { enhancedSignIn, enhancedSignUp, enhancedSignOut } from "./authHelpers";

// Export enhanced functions as main auth methods
export const signUp = enhancedSignUp;
export const signIn = enhancedSignIn;
export const signOut = enhancedSignOut;

// Keep the original functions as backups if needed
export const originalSignUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

export const originalSignIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const originalSignOut = async () => {
  return await supabase.auth.signOut();
};

// Additional auth utilities
export const getSession = async () => {
  return await supabase.auth.getSession();
};

export const getUser = async () => {
  return await supabase.auth.getUser();
};

export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email);
};
