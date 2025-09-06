// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is not defined");
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

console.log("✅ Supabase URL found:", supabaseUrl);
console.log("✅ Supabase Key found:", supabaseAnonKey.substring(0, 20) + "...");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
