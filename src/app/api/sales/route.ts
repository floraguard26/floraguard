import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = createAdminClient();
    const { error } = await db.from("sales_inquiries").insert({
      ...parsed.data,
      status: "new",
    });

    if (error) {
      console.error("[sales]", error.message);
      return NextResponse.json({ ok: false, error: "Failed to save inquiry." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sales]", err);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
