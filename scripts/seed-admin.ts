/**
 * FloraGuard — Admin Seed Script
 * ================================
 * Creates the default admin user in the `profiles` table.
 *
 * Usage:
 *   npm run seed
 *   # or directly:
 *   npx tsx scripts/seed-admin.ts
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEFAULT_ADMIN_EMAIL,
 *           DEFAULT_ADMIN_PASSWORD set in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ── Load .env.local ───────────────────────────────────────────
// tsx doesn't auto-load .env files — parse it manually
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    });
  } catch {
    console.warn("⚠️  .env.local not found — using existing process.env");
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@floraguard.local";
const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? "FloraGuard@123";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function seedAdmin() {
  console.log("🌱  FloraGuard Admin Seed Script");
  console.log("──────────────────────────────────");

  // Check if admin already exists
  const { data: existing } = await db
    .from("profiles")
    .select("id, email, role")
    .eq("email", adminEmail)
    .single();

  if (existing) {
    console.log(`✅  Admin already exists: ${existing.email} (id: ${existing.id})`);
    console.log("   To reset the password, delete the profile and run this script again.");
    process.exit(0);
  }

  // Hash password with bcrypt (cost factor 12)
  const BCRYPT_COST = 12;
  console.log(`🔒  Hashing password (bcrypt cost ${BCRYPT_COST})…`);
  const password_hash = await bcrypt.hash(adminPassword, BCRYPT_COST);

  // Insert admin profile
  const { data, error } = await db
    .from("profiles")
    .insert({
      email: adminEmail,
      password_hash,
      name: "Admin",
      role: "admin",
      is_active: true,
    })
    .select("id, email, role")
    .single();

  if (error) {
    console.error("❌  Failed to create admin:", error.message);
    process.exit(1);
  }

  console.log("✅  Admin created successfully!");
  console.log(`   Email:    ${data.email}`);
  console.log(`   Role:     ${data.role}`);
  console.log(`   ID:       ${data.id}`);
  console.log("");
  console.log("⚠️   IMPORTANT: Change the default password before deploying to production.");
  console.log("   Update DEFAULT_ADMIN_PASSWORD in .env.local and re-run this script.");
}

seedAdmin().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
