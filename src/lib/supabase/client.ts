"use client";
// Browser-side Supabase client — uses the ANON key (safe to expose).
// Only use for client component code that does NOT touch auth or service operations.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Singleton to avoid creating multiple connections
let client: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
