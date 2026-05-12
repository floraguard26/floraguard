import type { Detection, TopLabel } from "@/types";

interface GeminiInput {
  topLabels: TopLabel[];
  detections: Detection[];
  userNotes?: string;
}

// Mock recommendation used when GEMINI_API_KEY is not set
function getMockRecommendation(topLabels: TopLabel[]): string {
  const label = topLabels[0]?.label ?? "unknown disease";
  const humanLabel = label.replace(/_/g, " ");
  return `**Detected: ${humanLabel}**

Based on the visual analysis, your plant shows signs of ${humanLabel}. Here are recommended actions:

**Immediate Steps:**
1. Isolate the affected plant from healthy plants to prevent spread.
2. Remove and dispose of severely affected leaves — do not compost them.
3. Ensure adequate spacing for air circulation around the plant.

**Treatment Options:**
- Apply a copper-based fungicide or a neem oil spray as a first line of treatment.
- For bacterial infections, use a bactericide approved for the specific crop.
- Consult your local agricultural extension office for region-specific products.

**Preventive Care:**
- Water at the base of the plant, avoiding wetting foliage.
- Maintain consistent soil moisture — drought stress increases susceptibility.
- Rotate crops seasonally to break disease cycles.

**Important Disclaimer:** This is an AI-generated suggestion. Always verify recommendations with a certified agronomist or plant pathologist before applying any treatment.`;
}

/**
 * Get AI-powered plant disease recommendations using Google Gemini.
 * Falls back to a rich mock if GEMINI_API_KEY is not set (safe for dev/testing).
 */
export async function getGeminiRecommendation(input: GeminiInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // ── Mock path (no API key configured) ───────────────────────
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 300));
    return getMockRecommendation(input.topLabels);
  }

  // ── Real Gemini API path ─────────────────────────────────────
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const labelList = input.topLabels
      .map((l) => `${l.label.replace(/_/g, " ")} (${(l.confidence * 100).toFixed(1)}% confidence)`)
      .join(", ");

    const detectionCount = input.detections.length;

    const prompt = `You are an expert plant pathologist helping farmers identify and treat crop diseases.

A YOLOv4 computer vision model analysed a plant image and detected the following:
- Diseases found: ${labelList}
- Total affected regions: ${detectionCount}
${input.userNotes ? `- Farmer's notes: ${input.userNotes}` : ""}

Provide clear, practical, actionable advice a farmer can follow immediately.
Format your response using these exact sections:

**Detected Disease Summary**
Brief 1-2 sentence explanation of what was found and how serious it is.

**Immediate Steps**
Numbered list of actions to take today.

**Treatment Options**
Specific fungicides, bactericides, or organic treatments with application guidance.

**Preventive Care**
How to prevent recurrence and protect surrounding plants.

**When to Call an Expert**
Signs that indicate the farmer should consult a certified agronomist.

Keep the language simple and practical. Avoid jargon. Be specific about products and dosages where possible.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini");
    }

    return text;
  } catch (err) {
    console.error("[gemini] API call failed, falling back to mock:", err instanceof Error ? err.message : err);
    return getMockRecommendation(input.topLabels);
  }
}
