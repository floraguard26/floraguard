// Admin Supabase client using the SERVICE ROLE key.
// This bypasses RLS — ONLY use in server-side API routes.
// NEVER import this in client components or expose to the browser.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
// PASTE your Service Role key in .env.local — keep it SECRET
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
