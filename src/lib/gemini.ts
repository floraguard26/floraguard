import type { Detection, TopLabel } from "@/types";

interface GeminiInput {
  topLabels: TopLabel[];
  detections?: Detection[]; // Made optional to match your updated API schema
  userNotes?: string;
}

// Mock recommendation updated to match the new Indian Farmer context and required headings
function getMockRecommendation(topLabels: TopLabel[]): string {
  const topPred = topLabels[0];
  const fullLabel = topPred?.label ?? "Plant___Unknown_Disease";
  const confidencePct = topPred ? (topPred.confidence * 100).toFixed(1) : "0.0";
  
  // Split "Tomato___Early_blight" into ["Tomato", "Early blight"]
  const parts = fullLabel.split("___");
  const plantName = parts[0]?.replace(/_/g, " ") ?? "Crop";
  const diseaseName = parts[1]?.replace(/_/g, " ") ?? "Disease / Infection";

  return `# IMMEDIATE CARE
- **Urgency Level:** High. Immediate action required to prevent cross-contamination.
- **Disease Spread Risk:** High via wind splattering and water droplets.
- **Action Plan:** Inspect the entire plot immediately. Remove infected leaves showing symptoms of ${diseaseName} from the lower canopy. 
- **Quarantine:** Isolate infected potted plants or mark infected field zones. Do not drop pruned leaves on the field soil; collect them in plastic bags and destroy or bury them away from your fields.
- **Irrigation:** Stop overhead sprinkler irrigation immediately. Shift to drip irrigation or modify basin watering to avoid wetting the foliage.

# TREATMENT OPTIONS
- **Chemical Treatment (Contact Fungicide):** Apply Mancozeb (Indofil M-45 or Dithane M-45) at **2–3 g per litre of water**. Ensure complete coverage of both upper and lower leaf surfaces. Repeat every 7–10 days if cloudy weather or high humidity persists.
- **Chemical Treatment (Systemic Escalation):** For moderate to severe spread, escalate to a systemic fungicide like Hexaconazole (Contaf) at **2 ml per litre** or Azoxystrobin (Amistar) at **1 ml per litre of water**.
- **Biological Alternative:** Spray Pseudomonas fluorescens or Trichoderma viride formulations at **5–10 g per litre of water** during early morning or late evening hours during mild stages.
- **Safety Practices:** Always wear a protective mask and gloves while preparing the spray mix. Avoid spraying during the hot midday sun or strong winds.

# PREVENTIVE CARE
- **Field Hygiene:** Clean and sanitize all pruning tools, sickles, and shears with a 1% sodium hypochlorite solution before moving between rows.
- **Spacing:** Maintain optimal row-to-row spacing (minimum 60x45 cm for solanaceous crops) to allow clean air circulation and drop local relative humidity.
- **Nutrient Management:** Avoid excessive application of Nitrogenous fertilizers (Urea) which triggers soft, highly vulnerable green growth. Balance with Potash (MOP) to build crop cell immunity.
- **Crop Rotation:** Rotate with non-susceptible crops like Maize, Marigold, or Legumes for at least two subsequent seasons to break the active spore or pathogen life cycle.

# INFORMATIONAL WEBSITES
- ICAR-Indian Institute of Horticultural Research: https://iihr.res.in
- TNAU Agritech Portal: https://agritech.tnau.ac.in
- ICAR-Indian Agricultural Research Institute: https://www.iari.res.in
- PlantVillage Database: https://plantvillage.psu.edu
- National Farmers' Portal India: https://farmer.gov.in`;
}

/**
 * Get AI-powered plant disease recommendations using Google Gemini.
 * Formatted specifically as an advanced agricultural advisory report for Indian growers.
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

    // Extract details from the top prediction (e.g., "Tomato___Early_blight")
    const topPred = input.topLabels[0];
    if (!topPred) {
      throw new Error("No labels provided for recommendation parsing");
    }

    const fullLabel = topPred.label;
    const confidenceScore = `${(topPred.confidence * 100).toFixed(1)}%`;
    
    const parts = fullLabel.split("___");
    const plantName = parts[0]?.replace(/_/g, " ") ?? "Unknown Plant";
    const diseaseName = parts[1]?.replace(/_/g, " ") ?? "Unknown Disease";

    const prompt = `You are an advanced agricultural plant disease advisory assistant integrated into a plant disease detection system.

A machine learning model has already identified the plant disease.

Detected Disease: ${diseaseName}
Plant/Crop: ${plantName}
Confidence Score: ${confidenceScore}
Country: India

Your task is to generate a highly detailed, practical, farmer-friendly agricultural advisory report specifically tailored for Indian farmers.

CRITICAL INSTRUCTIONS:

1. Output must be EXTREMELY DETAILED, practical, and actionable.
2. Assume the user is an Indian farmer, agricultural student, or grower seeking practical solutions.
3. ALL treatment recommendations must prioritize products, medications, fungicides, bactericides, insecticides, and agricultural solutions commonly available in India.
4. DO NOT give only generic advice like: "Use fungicide", "Apply pesticide", or "Treat with copper spray". Instead ALWAYS provide specific examples available in India such as:
   FUNGICIDES:
   - Copper oxychloride (Blitox 50, Kocide)
   - Mancozeb (Dithane M-45, Indofil M-45)
   - Carbendazim (Bavistin)
   - Chlorothalonil (Kavach)
   - Azoxystrobin (Amistar)
   - Propiconazole (Tilt)
   - Hexaconazole (Contaf)
   - Metalaxyl + Mancozeb (Ridomil Gold)
   - Tebuconazole formulations
   - Captan formulations

   BACTERICIDES:
   - Copper hydroxide
   - Copper oxychloride
   - Streptocycline (where commonly referenced in agriculture)
   - Kasugamycin formulations

   INSECTICIDES / VECTOR CONTROL:
   - Imidacloprid (Confidor)
   - Thiamethoxam (Actara)
   - Acetamiprid
   - Lambda-cyhalothrin
   - Neem-based formulations
   - Emamectin benzoate

   BIOLOGICAL OPTIONS:
   - Trichoderma viride
   - Pseudomonas fluorescens
   - Bacillus subtilis-based products
   - Neem oil

5. If disease is fungal: Include contact fungicides, systemic fungicides, biological options, and exact treatment escalation.
6. If disease is bacterial: Include bactericide recommendations, sanitation measures, and spread control.
7. If disease is viral: Clearly explain there is generally no direct curative spray, focus on vector control, infected plant removal, sanitation, and prevention.
8. Mention severity-based action plans: Mild infection, Moderate infection, Severe infection.
9. Include dosage/application examples whenever possible such as: 2–3 g per litre of water, 1–2 ml per litre, repeat every 7–10 days, spray during early morning or evening.
10. Include practical field actions: remove infected leaves, destroy infected fruits, isolate infected plants, improve drainage, reduce humidity, irrigation correction, weed removal, pruning, sanitation of tools.
11. Include safety practices: wear gloves/mask, avoid over-application, avoid chemical mixing unless compatible, avoid spraying during hot midday sun, observe pre-harvest interval where relevant.
12. DO NOT include AI disclaimers, uncertainty disclaimers, or warnings about being an AI assistant.
13. Use practical, easy-to-understand but technically informative language.
14. Response must be highly detailed—not a short summary.
${input.userNotes ? `15. Additional notes provided directly by the farmer: "${input.userNotes}"` : ""}

FORMAT OUTPUT EXACTLY WITH THESE HEADINGS:

# IMMEDIATE CARE
# TREATMENT OPTIONS
# PREVENTIVE CARE
# INFORMATIONAL WEBSITES

SECTION REQUIREMENTS:

# IMMEDIATE CARE
Must include: immediate actions after detection, urgency level, disease spread risk, infected leaf/fruit removal, quarantine/isolation, irrigation adjustments, sanitation actions.

# TREATMENT OPTIONS
Must include: exact treatment methods, chemical treatment, biological treatment, organic alternatives, dosage examples, spray interval examples, treatment duration, severe escalation plan, specific Indian brand/product examples. Structure treatment options clearly using bullet points.

# PREVENTIVE CARE
Must include: future prevention strategies, crop rotation if relevant, resistant varieties if relevant, vector management, irrigation management, nutrient/fertilizer considerations, field hygiene, spacing recommendations, monitoring checklist.

# INFORMATIONAL WEBSITES
Provide 5–8 REAL trusted agriculture resources relevant to India with FULL clickable URLs. Prioritize sources such as ICAR, Indian agricultural universities, PlantVillage, FAO, agricultural extension portals, state agriculture departments, and crop research institutes.

FINAL REQUIREMENT:
The output must feel like a professional agricultural advisory guide written specifically for Indian users.

Generate the response now.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini");
    }

    return text;
  } catch (err) {
    console.error("[gemini] API call failed, falling back to custom advisor mock:", err instanceof Error ? err.message : err);
    return getMockRecommendation(input.topLabels);
  }
}
