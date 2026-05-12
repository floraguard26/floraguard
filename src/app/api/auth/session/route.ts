import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// GET /api/auth/session — returns current session info for client components
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, session: null });
  }
  // Never include password or sensitive fields
  return NextResponse.json({
    ok: true,
    session: {
      userId: session.sub,
      role: session.role,
      phone: session.phone,
      name: session.name,
    },
  });
}
