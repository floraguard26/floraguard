"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SalesModal } from "@/components/marketing/sales-modal";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "Perfect for individual farmers and hobbyists.",
    highlight: false,
    features: [
      "10 scans per month",
      "JPEG / PNG / WebP upload",
      "Disease detection + bounding boxes",
      "Basic AI recommendations",
      "30-day scan history",
      "Email support",
    ],
    cta: "Get Started Free",
    ctaHref: "/auth",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For serious growers and small agribusinesses.",
    highlight: true,
    features: [
      "Unlimited scans",
      "Priority ML inference",
      "Full AI recommendations (Gemini)",
      "1-year scan history",
      "Export reports (PDF)",
      "Priority email & chat support",
    ],
    cta: "Start Pro Trial",
    ctaHref: "/auth",
    ctaVariant: "primary" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For agribusinesses, co-ops, and research institutions.",
    highlight: false,
    features: [
      "Everything in Pro",
      "Custom model fine-tuning",
      "Dedicated ML inference server",
      "Admin dashboard + multi-user",
      "API access",
      "SLA + dedicated account manager",
    ],
    cta: "Contact Sales",
    ctaHref: null,
    ctaVariant: "outline" as const,
  },
];

export default function PricingPage() {
  const [salesOpen, setSalesOpen] = useState(false);

  return (
    <div className="py-16 sm:py-24">
      {/* Header */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto">
          Start free. Upgrade when you need more. No hidden fees.
        </p>
      </section>

      {/* Plans */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20"
        aria-label="Pricing plans"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col gap-6",
                plan.highlight
                  ? "border-flora-600 bg-flora-600 text-white shadow-xl shadow-flora-600/20 scale-[1.02]"
                  : "border-gray-200 bg-white shadow-sm"
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-gray-900">
                  Most Popular
                </span>
              )}
              <div>
                <div className={cn("text-sm font-semibold", plan.highlight ? "text-flora-200" : "text-flora-600")}>
                  {plan.name}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={cn("text-4xl font-bold", plan.highlight ? "text-white" : "text-gray-900")}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={cn("text-sm", plan.highlight ? "text-flora-200" : "text-gray-500")}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={cn("mt-2 text-sm leading-relaxed", plan.highlight ? "text-flora-100" : "text-gray-500")}>
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      className={cn("h-4 w-4 shrink-0 mt-0.5", plan.highlight ? "text-flora-200" : "text-flora-600")}
                      aria-hidden="true"
                    />
                    <span className={cn("text-sm", plan.highlight ? "text-flora-100" : "text-gray-600")}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.ctaHref ? (
                <Button
                  variant={plan.highlight ? "secondary" : plan.ctaVariant}
                  className={plan.highlight ? "bg-white text-flora-700 hover:bg-flora-50" : ""}
                  asChild
                >
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              ) : (
                <Button
                  variant={plan.ctaVariant}
                  onClick={() => setSalesOpen(true)}
                >
                  {plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ strip */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-600 text-sm">
          All plans include a{" "}
          <strong className="text-gray-900">14-day money-back guarantee</strong>. Questions?{" "}
          <button
            type="button"
            onClick={() => setSalesOpen(true)}
            className="text-flora-600 font-medium hover:underline"
          >
            Talk to our team.
          </button>
        </p>
      </section>

      <SalesModal open={salesOpen} onOpenChange={setSalesOpen} />
    </div>
  );
}
