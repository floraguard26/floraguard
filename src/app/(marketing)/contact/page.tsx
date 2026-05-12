"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Mail, Phone, MapPin } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast("success", "Message sent!", "We'll reply within 1-2 business days.");
      reset();
    } catch {
      toast("error", "Failed to send", "Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">Get in Touch</h1>
          <p className="mt-4 text-gray-600">
            Have questions about FloraGuard? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Contact info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-5">
              {[
                { icon: Mail, label: "Email", value: "hello@floraguard.ai" },
                { icon: Phone, label: "Phone", value: "+1 (800) FLORA-AI" },
                { icon: MapPin, label: "Location", value: "San Francisco, CA, USA" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flora-100">
                    <Icon className="h-5 w-5 text-flora-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">{label}</div>
                    <div className="text-sm font-medium text-gray-700">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-xl bg-flora-50 border border-flora-100 p-5">
              <h3 className="font-semibold text-flora-800 mb-1">Sales Inquiries</h3>
              <p className="text-sm text-flora-700">
                Looking for Enterprise pricing or a demo? Email us at{" "}
                <span className="font-medium">sales@floraguard.ai</span> or use the form on the
                Pricing page.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            noValidate
            aria-label="Contact form"
          >
            <h2 className="text-lg font-semibold text-gray-900">Send a Message</h2>
            <Input
              label="Your Name"
              required
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Message <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell us how we can help..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-flora-500 focus:outline-none focus:ring-2 focus:ring-flora-500/20 resize-none"
                aria-invalid={!!errors.message}
                {...register("message")}
              />
              {errors.message && (
                <p role="alert" className="text-xs text-red-600">{errors.message.message}</p>
              )}
            </div>
            <Button type="submit" loading={submitting} className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
