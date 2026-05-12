import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectLimiter } from "@/lib/rate-limit";

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("user");

    // Rate limit uploads per user
    const limit = detectLimiter(session.sub);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Upload limit reached. Try again later." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No image provided." }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Invalid file type. Use JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: `File exceeds ${MAX_SIZE_MB} MB limit.` },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    // Upload to Supabase Storage bucket: scans (must be created in Supabase dashboard)
    const ext = file.name.split(".").pop() ?? "jpg";
    const imagePath = `${session.sub}/${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: storageError } = await db.storage
      .from("scans")
      .upload(imagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      console.error("[upload] storage error", storageError.message);
      return NextResponse.json({ ok: false, error: "Storage upload failed." }, { status: 500 });
    }

    // Generate a short-lived signed URL for the ML server to read the image
    const { data: signedData, error: signError } = await db.storage
      .from("scans")
      .createSignedUrl(imagePath, 300); // 5-minute URL for ML inference

    if (signError || !signedData) {
      console.error("[upload] sign error", signError?.message);
      return NextResponse.json({ ok: false, error: "Could not generate image URL." }, { status: 500 });
    }

    // Create scan record
    const { data: scan, error: dbError } = await db
      .from("scans")
      .insert({
        user_id: session.sub,
        image_path: imagePath,
        status: "processing",
      })
      .select("id")
      .single();

    if (dbError || !scan) {
      console.error("[upload] db error", dbError?.message);
      return NextResponse.json({ ok: false, error: "Failed to create scan record." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      scanId: scan.id,
      imagePath,
      imageUrl: signedData.signedUrl,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("[upload]", err);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
