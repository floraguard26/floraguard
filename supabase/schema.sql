-- ============================================================
-- FloraGuard — Supabase Schema
-- Run this against your Supabase project:
--   Supabase Dashboard → SQL Editor → paste and run
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── profiles ─────────────────────────────────────────────────
-- Custom auth table (NOT using auth.users — we use Twilio OTP + custom JWT)
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         TEXT UNIQUE,                          -- User login identifier
  email         TEXT UNIQUE,                          -- Admin login identifier
  password_hash TEXT,                                 -- bcrypt hash — admin only
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles (phone);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_role_idx  ON profiles (role);

-- ── scans ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_path      TEXT NOT NULL,              -- Storage path: {user_id}/{timestamp}.jpg
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_version   TEXT,
  top_label       TEXT,                       -- Top detected disease label
  raw_detections  JSONB,                      -- Full MLResponse JSON
  gemini_output   TEXT,                       -- AI recommendation text
  status          TEXT NOT NULL DEFAULT 'processing'
                    CHECK (status IN ('processing', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS scans_user_id_idx   ON scans (user_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx ON scans (created_at DESC);
CREATE INDEX IF NOT EXISTS scans_top_label_idx  ON scans (top_label);
CREATE INDEX IF NOT EXISTS scans_status_idx     ON scans (status);

-- ── sales_inquiries ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sales_status_idx ON sales_inquiries (status);

-- ── contact_messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── admin_audit_logs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_admin_idx ON admin_audit_logs (admin_id);

-- ── app_settings ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO app_settings (key, value) VALUES
  ('maintenance_mode',  'false'),
  ('max_upload_size_mb', '10'),
  ('allowed_file_types', '["image/jpeg","image/png","image/webp"]')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SUPABASE STORAGE
-- Create the 'scans' bucket via Supabase Dashboard:
--   Storage → New Bucket → Name: scans → Private (NOT public)
-- Or via SQL:
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('scans', 'scans', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Note: Since we use service role key for all server-side
-- operations, RLS is a defence-in-depth measure.
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings   ENABLE ROW LEVEL SECURITY;

-- ── profiles RLS ──────────────────────────────────────────────
-- Service role bypasses all RLS — these apply when using the anon key directly.

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own profile (name only — role/active protected server-side)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- ── scans RLS ─────────────────────────────────────────────────

-- Users can select their own scans
CREATE POLICY "scans_select_own" ON scans
  FOR SELECT USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own scans
CREATE POLICY "scans_insert_own" ON scans
  FOR INSERT WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own scans
CREATE POLICY "scans_delete_own" ON scans
  FOR DELETE USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- ── sales_inquiries RLS ───────────────────────────────────────

-- Anyone can insert (public contact form)
CREATE POLICY "sales_insert_anon" ON sales_inquiries
  FOR INSERT WITH CHECK (TRUE);

-- ── contact_messages RLS ──────────────────────────────────────

-- Anyone can insert (public contact form)
CREATE POLICY "contact_insert_anon" ON contact_messages
  FOR INSERT WITH CHECK (TRUE);

-- ── Storage RLS ───────────────────────────────────────────────

-- Users can upload to their own folder: scans/{user_id}/...
CREATE POLICY "storage_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'scans'
    AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can select their own files
CREATE POLICY "storage_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'scans'
    AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can delete their own files
CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'scans'
    AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub'
  );
