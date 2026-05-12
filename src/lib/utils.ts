import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date string for display */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format confidence as a percentage string */
export function formatConfidence(conf: number): string {
  return `${(conf * 100).toFixed(1)}%`;
}

/** Humanize a snake_case label */
export function humanizeLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Strip PII/secrets from objects before logging */
export function safeLog(obj: Record<string, unknown>): Record<string, unknown> {
  const REDACTED_KEYS = ["password", "password_hash", "token", "secret", "key", "otp"];
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      REDACTED_KEYS.some((r) => k.toLowerCase().includes(r))
        ? [k, "[REDACTED]"]
        : [k, v]
    )
  );
}

/** Generate a 6-digit OTP (used in tests / mock mode) */
export function generateMockOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Clamp a value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
