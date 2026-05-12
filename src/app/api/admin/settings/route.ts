import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const SETTINGS_KEYS = ["maintenance_mode", "max_upload_size_mb", "allowed_file_types"] as const;

export async function GET() {
  try {
    await requireRole("admin");
    const db = createAdminClient();
    const { data } = await db.from("app_settings").select("key, value");

    // Convert rows to object
    const settings: Record<string, unknown> = {};
    (data ?? []).forEach(({ key, value }) => { settings[key] = value; });

    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}

const schema = z.object({
  maintenance_mode: z.boolean().optional(),
  max_upload_size_mb: z.number().min(1).max(50).optional(),
  allowed_file_types: z.array(z.string()).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    await requireRole("admin");
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid settings" }, { status: 400 });

    const db = createAdminClient();
    const upserts = Object.entries(parsed.data).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await db.from("app_settings").upsert(upserts, { onConflict: "key" });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Save failed." }, { status: 500 });
  }
}
