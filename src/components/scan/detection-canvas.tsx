"use client";
import { useEffect, useRef } from "react";
import type { Detection } from "@/types";
import { cn } from "@/lib/utils";

// Colors for different detection labels (cycles through palette)
const PALETTE = [
  "#16a34a", // flora-600
  "#dc2626", // red-600
  "#d97706", // amber-600
  "#7c3aed", // violet-600
  "#0284c7", // sky-600
  "#db2777", // pink-600
];

interface DetectionCanvasProps {
  imageUrl: string;
  detections: Detection[];
  className?: string;
}

export function DetectionCanvas({ imageUrl, detections, className }: DetectionCanvasProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    function draw() {
      if (!img || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Match canvas to display size
      canvas.width = img.offsetWidth;
      canvas.height = img.offsetHeight;

      const scaleX = img.offsetWidth / img.naturalWidth;
      const scaleY = img.offsetHeight / img.naturalHeight;

      // Draw bounding boxes
      detections.forEach((det, i) => {
        const [bx, by, bw, bh] = det.bbox;
        const color = PALETTE[i % PALETTE.length];
        const x = bx * scaleX;
        const y = by * scaleY;
        const w = bw * scaleX;
        const h = bh * scaleY;

        // Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, w, h);

        // Label background
        const label = `${det.label.replace(/_/g, " ")} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 12px Inter, sans-serif";
        const tw = ctx.measureText(label).width;
        const th = 18;
        ctx.fillStyle = color;
        ctx.fillRect(x, y - th - 2, tw + 10, th + 2);

        // Label text
        ctx.fillStyle = "#fff";
        ctx.fillText(label, x + 5, y - 5);
      });
    }

    if (img.complete) {
      draw();
    } else {
      img.addEventListener("load", draw);
      return () => img.removeEventListener("load", draw);
    }
  }, [imageUrl, detections]);

  return (
    <div className={cn("relative inline-block", className)} aria-label="Disease detection overlay">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Scanned plant"
        className="block w-full rounded-xl"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
