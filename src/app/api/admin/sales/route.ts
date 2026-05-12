import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireRole("admin");
    const db = createAdminClient();
    const { data, error } = await db
      .from("sales_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, inquiries: data ?? [] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
