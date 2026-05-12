"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Enter a valid international phone number"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

// Resend cooldown in seconds
const RESEND_COOLDOWN = 60;

export default function AuthPageWrapper() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}

function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  async function onPhoneSubmit(data: PhoneForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send OTP");
      setPhone(data.phone);
      otpForm.reset({ otp: "" });   // clear any stale OTP value before showing the field
      setStep("otp");
      setResendTimer(RESEND_COOLDOWN);
      toast("info", "OTP sent!", `A 6-digit code was sent to ${data.phone}`);
    } catch (err: unknown) {
      toast("error", "Failed to send OTP", err instanceof Error ? err.message : "Try again");
    } finally {
      setLoading(false);
    }
  }

  async function onOtpSubmit(data: OtpForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: data.otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Invalid OTP");
      toast("success", "Welcome to FloraGuard!");
      const redirect = params.get("redirect") ?? "/try";
      router.push(redirect);
    } catch (err: unknown) {
      toast("error", "Verification failed", err instanceof Error ? err.message : "Check the code and try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      setResendTimer(RESEND_COOLDOWN);
      toast("info", "OTP resent!", "Check your messages.");
    } catch {
      toast("error", "Failed to resend", "Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-flora-50 px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-flora-700 font-bold text-2xl"
            aria-label="FloraGuard home"
          >
            <Leaf className="h-7 w-7 text-flora-600" aria-hidden="true" />
            FloraGuard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === "phone" ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center">Sign In / Sign Up</h1>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Enter your phone number to receive a one-time password.
              </p>

              <form
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="mt-8 space-y-5"
                noValidate
              >
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  required
                  autoComplete="tel"
                  autoFocus
                  hint="Include country code, e.g. +1 for USA"
                  error={phoneForm.formState.errors.phone?.message}
                  {...phoneForm.register("phone")}
                />
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Send OTP
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-flora-600 hover:underline">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-flora-600 hover:underline">Privacy Policy</Link>.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center">Enter OTP</h1>
              <p className="mt-2 text-sm text-gray-500 text-center">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-gray-700">{phone}</span>.
              </p>

              <form
                onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                className="mt-8 space-y-5"
                noValidate
              >
                <Input
                  key="otp-input"
                  label="One-Time Password"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  required
                  autoComplete="one-time-code"
                  autoFocus
                  error={otpForm.formState.errors.otp?.message}
                  {...otpForm.register("otp")}
                />
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Verify & Sign In
                </Button>
              </form>

              {/* Resend OTP */}
              <div className="mt-5 text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-400">
                    Resend code in <span className="font-medium text-gray-600">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-flora-600 hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    otpForm.reset();
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Change phone number
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Admin?{" "}
          <Link href="/admin/login" className="text-flora-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
