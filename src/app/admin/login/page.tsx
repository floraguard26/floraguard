"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPageWrapper() {
  return (
    <Suspense>
      <AdminLoginPage />
    </Suspense>
  );
}

function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Login failed");
      toast("success", "Welcome back!");
      const redirect = params.get("redirect") ?? "/admin/dashboard";
      router.push(redirect);
    } catch (err: unknown) {
      toast("error", "Login failed", err instanceof Error ? err.message : "Check your credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-flora-700 font-bold text-2xl" aria-label="FloraGuard home">
            <Leaf className="h-7 w-7 text-flora-600" aria-hidden="true" />
            FloraGuard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <span className="inline-block rounded-full bg-flora-100 px-3 py-1 text-xs font-semibold text-flora-700 mb-3">
              ADMIN ACCESS
            </span>
            <h1 className="text-2xl font-bold text-gray-900">Admin Sign In</h1>
            <p className="mt-1 text-sm text-gray-500">Restricted to authorized administrators</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="username email"
              placeholder="admin@floraguard.local"
              autoFocus
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPwd ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In to Admin
            </Button>
          </form>

        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Not an admin?{" "}
          <Link href="/auth" className="text-flora-600 hover:underline">
            User sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
