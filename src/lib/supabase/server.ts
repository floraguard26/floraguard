// Server-side Supabase client using the ANON key.
// Use this for queries where you handle auth yourself via API routes.
// All server components and route handlers should import from here.
import { createClient } from "@supabase/supabase-js";

// PASTE your Supabase URL and anon key in .env.local
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
