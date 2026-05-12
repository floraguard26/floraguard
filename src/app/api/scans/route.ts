import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/scans — list current user's scans with pagination
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole("user");
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const search = searchParams.get("search") ?? "";
    const offset = (page - 1) * limit;

    const db = createAdminClient();
    let query = db
      .from("scans")
      .select("id, created_at, top_label, status, image_path, model_version", { count: "exact" })
      .eq("user_id", session.sub)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("top_label", `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // Generate signed URLs for thumbnails
    const scansWithUrls = await Promise.all(
      (data ?? []).map(async (scan) => {
        if (!scan.image_path) return { ...scan, imageUrl: null };
        const { data: signed } = await db.storage
          .from("scans")
          .createSignedUrl(scan.image_path, 3600);
        return { ...scan, imageUrl: signed?.signedUrl ?? null };
      })
    );

    return NextResponse.json({
      ok: true,
      scans: scansWithUrls,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("[scans GET]", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch scans." }, { status: 500 });
  }
}
