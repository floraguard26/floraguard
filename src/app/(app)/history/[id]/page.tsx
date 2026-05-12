"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Scan } from "@/types";
import { DetectionCanvas } from "@/components/scan/detection-canvas";
import { DetectionsList } from "@/components/scan/detections-list";
import { GeminiOutput } from "@/components/scan/gemini-output";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate, humanizeLabel } from "@/lib/utils";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function ScanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [scan, setScan] = useState<(Scan & { imageUrl: string | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/scans/${params.id}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok) setScan(j.scan); })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDelete() {
    if (!scan) return;
    if (!window.confirm("Delete this scan? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/scans/${scan.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("success", "Scan deleted.");
      router.push("/history");
    } catch {
      toast("error", "Delete failed", "Please try again.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-gray-500">Scan not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/history">← Back to History</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back + title */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/history" aria-label="Back to history">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {scan.top_label ? humanizeLabel(scan.top_label) : "Scan Details"}
            </h1>
            <p className="text-sm text-gray-500">{formatDate(scan.created_at)}</p>
          </div>
          <Badge
            variant={
              scan.status === "completed" ? "success" : scan.status === "failed" ? "error" : "warning"
            }
          >
            {scan.status}
          </Badge>
        </div>
        <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="space-y-8">
        {/* Image + detections */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Detection Overlay</h2>
          {scan.imageUrl ? (
            <DetectionCanvas
              imageUrl={scan.imageUrl}
              detections={scan.raw_detections?.detections ?? []}
            />
          ) : (
            <div className="h-48 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              Image unavailable
            </div>
          )}
          <div className="mt-6">
            <DetectionsList labels={scan.raw_detections?.topLabels ?? []} />
          </div>
        </div>

        {/* Gemini output */}
        {scan.gemini_output && (
          <GeminiOutput text={scan.gemini_output} loading={false} />
        )}
      </div>
    </div>
  );
}
