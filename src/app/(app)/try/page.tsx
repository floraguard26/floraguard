"use client";
import { useState } from "react";
import type { MLResponse } from "@/types";
import { UploadWidget } from "@/components/scan/upload-widget";
import { DetectionCanvas } from "@/components/scan/detection-canvas";
import { DetectionsList } from "@/components/scan/detections-list";
import { GeminiOutput } from "@/components/scan/gemini-output";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { AlertTriangle, RotateCcw } from "lucide-react";

type AnalysisState = "idle" | "uploading" | "detecting" | "recommending" | "done" | "error";

interface ScanResult {
  imageUrl: string;
  ml: MLResponse;
  scanId: string;
  recommendation: string | null;
}

export default function TryPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  const isProcessing = ["uploading", "detecting", "recommending"].includes(state);

  function statusLabel() {
    switch (state) {
      case "uploading": return "Uploading image…";
      case "detecting": return "Running AI detection…";
      case "recommending": return "Generating recommendations…";
      default: return "";
    }
  }

  async function handleAnalyze() {
    if (!file) return;
    setState("uploading");
    setResult(null);

    try {
      // Step 1: Upload image to Supabase Storage + create scan record
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await fetch("/api/scans/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const json = await uploadRes.json();
        throw new Error(json.error ?? "Upload failed");
      }
      const { scanId, imagePath, imageUrl } = await uploadRes.json();

      // Step 2: Run ML detection
      setState("detecting");
      const detectRes = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, imagePath }),
      });
      if (!detectRes.ok) {
        const json = await detectRes.json();
        throw new Error(json.error ?? "Detection failed");
      }
      const { ml }: { ml: MLResponse } = await detectRes.json();

      // Step 3: Get Gemini recommendations
      setState("recommending");
      setRecommendationLoading(true);
      setResult({ imageUrl, ml, scanId, recommendation: null });

      const recRes = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, topLabels: ml.topLabels, detections: ml.detections }),
      });
      const { recommendation } = await recRes.json();

      setResult((prev) => prev ? { ...prev, recommendation } : null);
      setState("done");
      toast("success", "Analysis complete!", `Detected: ${ml.topLabels[0]?.label ?? "no disease"}`);
    } catch (err: unknown) {
      console.error("[try]", err);
      setState("error");
      toast("error", "Analysis failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setRecommendationLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setState("idle");
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Detect Plant Disease</h1>
        <p className="mt-2 text-gray-500">
          Upload a clear photo of your plant to detect diseases and get AI treatment recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload + controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Upload Image</h2>
            <UploadWidget onFile={setFile} disabled={isProcessing} />

            {file && state === "idle" && (
              <Button
                onClick={handleAnalyze}
                className="w-full mt-5"
                size="lg"
              >
                Analyze Plant
              </Button>
            )}

            {isProcessing && (
              <div className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-flora-50 border border-flora-200 py-4">
                <Spinner size="sm" />
                <span className="text-sm text-flora-700 font-medium">{statusLabel()}</span>
              </div>
            )}

            {state === "error" && (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-700">Analysis failed</p>
                  <p className="text-xs text-red-600 mt-0.5">Check your connection and try again.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-700">
              <strong>Disclaimer:</strong> AI detections are informational. Always consult a
              certified agronomist before applying treatments to commercially significant crops.
            </p>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {(state === "detecting" || state === "recommending" || state === "done") && result && (
            <>
              {/* Image with bounding box overlay */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Detection Results</h2>
                <DetectionCanvas
                  imageUrl={result.imageUrl}
                  detections={state === "detecting" ? [] : result.ml.detections}
                />
                {state !== "detecting" && (
                  <div className="mt-4">
                    <DetectionsList labels={result.ml.topLabels} />
                  </div>
                )}
              </div>

              {/* Gemini recommendations */}
              <GeminiOutput
                text={result.recommendation}
                loading={recommendationLoading}
              />

              {state === "done" && (
                <Button variant="outline" onClick={handleReset} className="w-full">
                  <RotateCcw className="h-4 w-4" />
                  Analyze Another Image
                </Button>
              )}
            </>
          )}

          {state === "idle" && !file && (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
              <p className="text-sm">Upload an image to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
