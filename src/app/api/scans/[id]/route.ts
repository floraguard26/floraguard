import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/scans/[id] — get full scan details for current user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("user");
    const { id } = await params;
    const db = createAdminClient();

    const { data: scan, error } = await db
      .from("scans")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.sub)
      .single();

    if (error || !scan) {
      return NextResponse.json({ ok: false, error: "Scan not found." }, { status: 404 });
    }

    // Signed URL for image
    let imageUrl: string | null = null;
    if (scan.image_path) {
      const { data: signed } = await db.storage
        .from("scans")
        .createSignedUrl(scan.image_path, 3600);
      imageUrl = signed?.signedUrl ?? null;
    }

    return NextResponse.json({ ok: true, scan: { ...scan, imageUrl } });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("[scan GET]", err);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}

// DELETE /api/scans/[id] — user can delete their own scan
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("user");
    const { id } = await params;
    const db = createAdminClient();

    // Verify ownership
    const { data: scan } = await db
      .from("scans")
      .select("id, image_path, user_id")
      .eq("id", id)
      .eq("user_id", session.sub)
      .single();

    if (!scan) {
      return NextResponse.json({ ok: false, error: "Scan not found." }, { status: 404 });
    }

    // Delete from storage
    if (scan.image_path) {
      await db.storage.from("scans").remove([scan.image_path]);
    }

    // Delete record
    await db.from("scans").delete().eq("id", scan.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("[scan DELETE]", err);
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
