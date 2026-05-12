// ──────────────────────────────────────────────────────────────
// IMPORTANT: This is the canonical home page for FloraGuard.
//
// app/page.tsx maps to "/" in Next.js App Router.
// src/app/(marketing)/page.tsx ALSO maps to "/" — this creates a
// "Conflicting paths /" build error.
//
// FIX (one-time setup): delete src/app/(marketing)/page.tsx
//   git rm src/app/(marketing)/page.tsx
//
// Then this file (app/page.tsx) is the only handler for "/".
// The (marketing) group layout still applies to all other pages
// under (marketing)/ (about, product, pricing, contact, etc.)
// ──────────────────────────────────────────────────────────────
"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SalesModal } from "@/components/marketing/sales-modal";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Zap,
  Brain,
  ShieldCheck,
  BarChart3,
  Upload,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    name: "Arjun Patel",
    role: "Wheat Farmer, Punjab",
    body: "FloraGuard detected rust disease three days before I noticed it. Saved 30% of my yield this season.",
    avatar: "AP",
  },
  {
    name: "Dr. Meera Rao",
    role: "Agronomist, IARI",
    body: "I recommend FloraGuard to every farmer in my district. The accuracy rivals lab tests for common diseases.",
    avatar: "MR",
  },
  {
    name: "Samuel Osei",
    role: "Tomato Grower, Ghana",
    body: "The AI recommendations were spot-on. I treated blight early and my entire crop was saved.",
    avatar: "SO",
  },
];

const FAQ = [
  { q: "How accurate is the detection?", a: "Our YOLOv4 MobileNetV2 model achieves over 90% accuracy on common crop diseases. Accuracy varies by disease type and image quality." },
  { q: "Which plants are supported?", a: "25+ plant species and 50+ disease types including blight, rust, powdery mildew, and bacterial infections." },
  { q: "Is my data private?", a: "Yes. Images are stored privately in Supabase Storage and are only accessible by you. We never share your data." },
  { q: "Do I need internet?", a: "Yes — FloraGuard is cloud-based. You need an internet connection to upload images and receive detections." },
  { q: "Are recommendations a replacement for an expert?", a: "No. AI recommendations are a first-pass guide. Always verify serious disease outbreaks with a certified agronomist." },
];

const STEPS = [
  { icon: Upload, title: "Upload a Photo", desc: "Take a clear photo of the affected plant leaf or stem and upload it." },
  { icon: Brain, title: "AI Analyses It", desc: "Our YOLOv4 model identifies disease regions with bounding boxes and confidence scores." },
  { icon: CheckCircle, title: "Get Recommendations", desc: "Receive AI-generated treatment advice tailored to the detected disease." },
];

export default function HomePage() {
  const [salesOpen, setSalesOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main id="main-content">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-flora-50 via-white to-flora-50 py-24 sm:py-32" aria-labelledby="hero-heading">
          <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-flora-100/40 blur-3xl" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-flora-100 px-4 py-1.5 text-sm font-medium text-flora-700 mb-6">
              <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
              AI-powered plant disease detection
            </div>
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Detect Plant Diseases{" "}
              <span className="text-flora-600">Instantly</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Upload a photo of any plant and our AI identifies diseases, highlights affected regions, and delivers expert treatment recommendations — in seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild><Link href="/try">Try FloraGuard Free</Link></Button>
              <Button size="lg" variant="outline" onClick={() => setSalesOpen(true)}>Connect to a Sales Rep</Button>
            </div>
            <p className="mt-4 text-sm text-gray-400">No credit card required · Free tier available</p>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Who We Are</h2>
                <p className="mt-4 text-gray-600 leading-relaxed">FloraGuard is an AgriTech company making precision agriculture accessible to every farmer. We combine computer vision with agronomic knowledge to help growers protect crops before damage escalates.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ value: "90%+", label: "Detection accuracy" }, { value: "50+", label: "Disease types" }, { value: "25+", label: "Plant species" }, { value: "10K+", label: "Scans processed" }].map((s) => (
                  <div key={s.label} className="rounded-xl border border-flora-100 bg-flora-50 p-5 text-center">
                    <div className="text-3xl font-bold text-flora-700">{s.value}</div>
                    <div className="mt-1 text-sm text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Why FloraGuard ────────────────────────────── */}
        <section className="py-20 bg-flora-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why FloraGuard?</h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Zap, title: "Instant Results", desc: "Disease detections in under 5 seconds." },
                { icon: Brain, title: "Advanced AI", desc: "YOLOv4 with MobileNetV2 backbone." },
                { icon: ShieldCheck, title: "Secure & Private", desc: "Images encrypted in transit and at rest." },
                { icon: BarChart3, title: "Track History", desc: "Monitor crop health over time." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl bg-white border border-gray-100 p-6 text-left shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flora-100">
                    <Icon className="h-5 w-5 text-flora-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-flora-600 text-white shadow-md">
                    <Icon className="h-8 w-8" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold text-gray-900 text-lg">{title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Button size="lg" asChild><Link href="/try">Start Now — It&apos;s Free</Link></Button>
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────── */}
        <section className="py-20 bg-flora-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">Trusted by Growers Worldwide</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col">
                  <blockquote className="flex-1 text-gray-600 text-sm leading-relaxed">&ldquo;{t.body}&rdquo;</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-flora-600 text-white text-sm font-semibold" aria-hidden="true">{t.avatar}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
            <Accordion.Root type="multiple" className="space-y-3">
              {FAQ.map((item, i) => (
                <Accordion.Item key={i} value={`faq-${i}`} className="rounded-xl border border-gray-200 overflow-hidden">
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-flora-50">
                      {item.q}
                      <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0" aria-hidden="true" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden text-sm text-gray-600 leading-relaxed data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                    <div className="px-5 pb-4 pt-1">{item.a}</div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────── */}
        <section className="py-20 bg-flora-700">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to protect your crops?</h2>
            <p className="mt-4 text-flora-200 text-lg">Join thousands of farmers using FloraGuard to detect and treat plant diseases early.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-flora-700 hover:bg-flora-50" asChild>
                <Link href="/try">Try For Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => setSalesOpen(true)}>
                Talk to Sales
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <SalesModal open={salesOpen} onOpenChange={setSalesOpen} />
    </>
  );
}
