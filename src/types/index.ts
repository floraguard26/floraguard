// ============================================================
// FloraGuard — Shared TypeScript Types
// ============================================================

export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  phone: string | null;
  email: string | null;
  password_hash: string | null; // admin only — never sent to client
  name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

// Profile as exposed to the client (no password_hash)
export type SafeProfile = Omit<Profile, "password_hash">;

// ── Scan / Detection ─────────────────────────────────────────

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
}

export interface TopLabel {
  label: string;
  confidence: number;
}

/** JSON shape returned by the ML server */
export interface MLResponse {
  model: string;
  version: string;
  detections: Detection[];
  topLabels: TopLabel[];
}

export type ScanStatus = "processing" | "completed" | "failed";

export interface Scan {
  id: string;
  user_id: string;
  image_path: string;
  created_at: string;
  model_version: string | null;
  top_label: string | null;
  raw_detections: MLResponse | null;
  gemini_output: string | null;
  status: ScanStatus;
}

// ── Sales / Contact ──────────────────────────────────────────

export type SalesStatus = "new" | "contacted" | "closed";

export interface SalesInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: SalesStatus;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// ── App Settings ─────────────────────────────────────────────

export interface AppSettings {
  maintenance_mode: boolean;
  max_upload_size_mb: number;
  allowed_file_types: string[];
}

// ── JWT Session Payload ──────────────────────────────────────

export interface SessionPayload {
  sub: string;       // profile id
  role: UserRole;
  phone?: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

// ── API Response Helpers ─────────────────────────────────────

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResult<T> = ApiOk<T> | ApiError;
