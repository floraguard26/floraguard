import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin");
    const { id } = await params;
    const db = createAdminClient();

    const { data: scan } = await db.from("scans").select("id, image_path").eq("id", id).single();
    if (!scan) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

    if (scan.image_path) {
      await db.storage.from("scans").remove([scan.image_path]);
    }
    await db.from("scans").delete().eq("id", scan.id);

    // Audit log
    const session = await requireRole("admin");
    await db.from("admin_audit_logs").insert({
      admin_id: session.sub,
      action: "delete_scan",
      metadata: { scan_id: scan.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin scans DELETE]", err);
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
