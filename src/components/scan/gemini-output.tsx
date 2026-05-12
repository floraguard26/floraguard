"use client";
import { useEffect, useState, useRef } from "react";
import { Sparkles, Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface GeminiOutputProps {
  text: string | null;
  loading: boolean;
}

export function GeminiOutput({ text, loading }: GeminiOutputProps) {
  const [displayed, setDisplayed] = useState("");
  const [copied, setCopied] = useState(false);
  const indexRef = useRef(0);
  const prevText = useRef<string | null>(null);

  // Typing animation: stream characters one-by-one when text changes
  useEffect(() => {
    if (!text || text === prevText.current) return;
    prevText.current = text;
    setDisplayed("");
    indexRef.current = 0;

    // TODO: Connect Gemini response streaming here — swap this setTimeout
    // animation for a ReadableStream consumer when streaming is implemented
    const tick = () => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, ++indexRef.current));
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [text]);

  async function handleCopy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center space-y-3">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-sm text-gray-500">Generating AI recommendations…</p>
      </div>
    );
  }

  if (!text) return null;

  return (
    <div className="rounded-xl border border-flora-200 bg-flora-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-flora-200 bg-flora-100/50">
        <div className="flex items-center gap-2 text-flora-700">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-semibold">AI Recommendations</span>
          <span className="text-xs text-flora-500 bg-flora-200 rounded px-1.5 py-0.5">Gemini</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label="Copy recommendations to clipboard"
          className="text-flora-600 hover:bg-flora-200"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="ml-1.5 text-xs">{copied ? "Copied!" : "Copy"}</span>
        </Button>
      </div>

      {/* Content with typing effect */}
      <div
        className="px-5 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap cursor-blink"
        aria-live="polite"
        aria-label="AI generated recommendations"
      >
        {displayed}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 mx-5 mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-amber-700">
          AI suggestions are informational only. Always consult a certified agronomist before applying treatments.
        </p>
      </div>
    </div>
  );
}
