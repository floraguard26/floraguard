import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp } from "@/lib/twilio";
import { otpLimiter } from "@/lib/rate-limit";

const schema = z.object({
  phone: z
    .string()
    .min(7)
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number"),
});

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = otpLimiter(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many OTP requests. Please wait before trying again." },
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

    const { phone } = parsed.data;
    await sendOtp(phone);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-otp]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: "Failed to send OTP. Check your phone number and try again." },
      { status: 500 }
    );
  }
}
