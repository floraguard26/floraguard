import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, Brain, BoxSelect, History, Shield, Smartphone, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Product",
  description: "Explore FloraGuard's AI plant disease detection features.",
};

const FEATURES = [
  {
    icon: Upload,
    title: "Drag & Drop Upload",
    desc: "Upload JPEG, PNG, or WebP images up to 10 MB. Drag and drop or browse — works on any device.",
  },
  {
    icon: Brain,
    title: "YOLOv4 Detection",
    desc: "State-of-the-art object detection identifies disease regions with millimeter precision in under 5 seconds.",
  },
  {
    icon: BoxSelect,
    title: "Bounding Box Overlay",
    desc: "See exactly which parts of your plant are affected with color-coded bounding boxes and confidence scores.",
  },
  {
    icon: Brain,
    title: "AI Recommendations",
    desc: "Get Gemini-powered treatment recommendations tailored to the specific disease detected.",
  },
  {
    icon: History,
    title: "Scan History",
    desc: "Track your crop health over time. Search, filter, and review all past scans in one place.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    desc: "All images are stored privately in Supabase Storage. You own your data — we never share it.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    desc: "Works seamlessly on any screen size. Take a photo in the field and get results immediately.",
  },
  {
    icon: Brain,
    title: "Admin Dashboard",
    desc: "Enterprise plans include a full admin console for managing teams, scans, and usage analytics.",
  },
];

export default function ProductPage() {
  return (
    <div className="py-16 sm:py-24">
      {/* Header */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Everything You Need to Protect Your Crops
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          FloraGuard combines computer vision, generative AI, and intuitive design into one
          powerful plant health platform.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/try">Try Free Now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </section>

      {/* Feature grid */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20"
        aria-labelledby="features-heading"
      >
        <h2 id="features-heading" className="sr-only">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flora-100">
                <Icon className="h-5 w-5 text-flora-600" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow diagram — text-based */}
      <section className="bg-flora-50 py-16 mb-20" aria-labelledby="workflow-heading">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="workflow-heading" className="text-3xl font-bold text-gray-900 mb-10">
            Detection Workflow
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {["Image Upload", "→", "ML Inference", "→", "Detections JSON", "→", "Gemini AI", "→", "Recommendations"].map(
              (step, i) =>
                step === "→" ? (
                  <span key={i} className="text-gray-400 hidden md:inline text-xl" aria-hidden="true">
                    {step}
                  </span>
                ) : (
                  <div
                    key={step}
                    className="rounded-xl border border-flora-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm"
                  >
                    {step}
                  </div>
                )
            )}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">AI Suggestions — Important Disclaimer</h3>
            <p className="text-sm text-amber-700 leading-relaxed">
              FloraGuard provides AI-generated disease detections and treatment suggestions for
              informational purposes only. These are <strong>not a substitute for professional
              agronomic or plant pathology advice</strong>. Always consult a qualified expert before
              applying treatments to commercially significant crops.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
