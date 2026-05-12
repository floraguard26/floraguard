import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  // Rate-limit admin login attempts by IP — 10 per 15 min
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`admin-login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please wait and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const db = createAdminClient();

    // Fetch admin profile
    const { data: profile, error } = await db
      .from("profiles")
      .select("id, email, password_hash, name, role, is_active")
      .eq("email", email)
      .eq("role", "admin")
      .single();

    if (error || !profile) {
      // Constant-time response to prevent user enumeration
      await bcrypt.compare(password, "$2a$10$placeholder.hash.to.prevent.timing.attacks");
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ ok: false, error: "Account is disabled." }, { status: 403 });
    }

    if (!profile.password_hash) {
      return NextResponse.json({ ok: false, error: "Admin password not configured." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, profile.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    // Issue session
    await createSession({
      sub: profile.id,
      role: "admin",
      email: profile.email ?? undefined,
      name: profile.name ?? undefined,
    });

    return NextResponse.json({ ok: true, user: { id: profile.id, role: "admin" } });
  } catch (err) {
    console.error("[admin-login]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
