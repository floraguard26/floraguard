import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGeminiRecommendation } from "@/lib/gemini";

// ── Updated Validation Schema ───────────────────────────────────
const schema = z.object({
  scanId: z.string().uuid(),
  topLabels: z.array(z.object({ label: z.string(), confidence: z.number() })),
  // Make detections optional so the validation passes when MobileNet runs
  detections: z.array(z.object({
    label: z.string(),
    confidence: z.number(),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  })).optional(),
  userNotes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("user");
    const body = await req.json();
    const parsed = schema.safeParse(body);
    
    if (!parsed.success) {
      console.error("[recommendations] Validation failed:", parsed.error.format());
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    const { scanId, topLabels, detections, userNotes } = parsed.data;

    // Get recommendation from Gemini (passing an empty array if detections is undefined)
    const recommendation = await getGeminiRecommendation({ 
      topLabels, 
      detections: detections || [], 
      userNotes 
    });

    // Save gemini output to scan record
    const db = createAdminClient();
    await db.from("scans").update({ gemini_output: recommendation }).eq("id", scanId);

    return NextResponse.json({ ok: true, recommendation });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("[recommendations]", err);
    return NextResponse.json({ ok: false, error: "Failed to get recommendations." }, { status: 500 });
  }
}
