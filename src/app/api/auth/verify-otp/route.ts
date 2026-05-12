import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/twilio";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSession } from "@/lib/auth";

const schema = z.object({
  phone: z.string().min(7),
  otp: z.string().length(6).regex(/^\d{6}$/),
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

    const { phone, otp } = parsed.data;

    // Verify with Twilio
    const { valid } = await verifyOtp(phone, otp);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired OTP. Please try again." },
        { status: 401 }
      );
    }

    // Upsert user profile
    const db = createAdminClient();
    const { data: profile, error } = await db
      .from("profiles")
      .upsert({ phone, role: "user", is_active: true }, { onConflict: "phone" })
      .select("id, phone, name, role")
      .single();

    if (error || !profile) {
      console.error("[verify-otp] profile upsert failed", error?.message);
      return NextResponse.json(
        { ok: false, error: "Account setup failed. Please try again." },
        { status: 500 }
      );
    }

    // Create session JWT cookie
    await createSession({
      sub: profile.id,
      role: profile.role,
      phone: profile.phone ?? undefined,
      name: profile.name ?? undefined,
    });

    return NextResponse.json({ ok: true, user: { id: profile.id, role: profile.role } });
  } catch (err) {
    console.error("[verify-otp]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
