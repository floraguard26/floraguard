import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  is_active: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
  name: z.string().max(80).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin");
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });
    }

    const db = createAdminClient();
    const { error } = await db.from("profiles").update(parsed.data).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin users PATCH]", err);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
}
