import type { TopLabel } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatConfidence, humanizeLabel } from "@/lib/utils";

interface DetectionsListProps {
  labels: TopLabel[];
}

export function DetectionsList({ labels }: DetectionsListProps) {
  if (labels.length === 0) {
    return (
      <div className="rounded-xl border border-flora-200 bg-flora-50 p-5 text-center">
        <p className="text-sm text-flora-700 font-medium">No diseases detected 🎉</p>
        <p className="mt-1 text-xs text-flora-600">Your plant appears to be healthy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Detected Issues</h3>
      {labels.map((label, i) => {
        const conf = label.confidence;
        const severity =
          conf >= 0.8 ? "error" : conf >= 0.5 ? "warning" : "info";

        return (
          <div
            key={label.label}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600" aria-hidden="true">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-gray-800">
                {humanizeLabel(label.label)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Confidence bar */}
              <div
                className="hidden sm:flex h-2 w-20 rounded-full bg-gray-100 overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-flora-500 transition-all"
                  style={{ width: `${conf * 100}%` }}
                />
              </div>
              <Badge variant={severity}>{formatConfidence(conf)}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
