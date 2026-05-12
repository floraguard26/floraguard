import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    await requireRole("admin");
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "15");
    const search = searchParams.get("search") ?? "";
    const offset = (page - 1) * limit;

    const db = createAdminClient();
    let query = db
      .from("scans")
      .select("id, user_id, created_at, top_label, status, image_path, model_version", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) query = query.ilike("top_label", `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    // Add signed URLs for thumbnails
    const scansWithUrls = await Promise.all(
      (data ?? []).map(async (s) => {
        if (!s.image_path) return { ...s, imageUrl: null };
        const { data: signed } = await db.storage.from("scans").createSignedUrl(s.image_path, 3600);
        return { ...s, imageUrl: signed?.signedUrl ?? null };
      })
    );

    return NextResponse.json({ ok: true, scans: scansWithUrls, total: count ?? 0 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
