"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import OAuthButtons from "./OAuthButtons";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

export default function LoginForm({
  callbackUrl,
  verified,
}: {
  callbackUrl?: string;
  verified?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const supabase = createClient();

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
        options: {
          captchaToken: captchaToken || undefined,
        },
      });

      if (authError) {
        setError(authError.message === "Invalid login credentials" ? "Invalid email or password" : authError.message);
        return;
      }

      // Use hard navigation to bypass PWA Service Worker cache.
      // router.replace() triggers a client-side RSC navigation that the SW
      // can intercept and hang; window.location.href forces a fresh full-page
      // load which also ensures the Supabase session cookie is read server-side.
      window.location.assign(callbackUrl || "/dashboard");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[440px] animate-fade-up">
      <div className="mb-8 text-center">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/70 bg-white/75 shadow-[0_18px_30px_rgba(9,17,31,0.08)] overflow-hidden">
          <Image src="/Amortix.png" alt="Amortix logo" width={56} height={56} className="h-full w-full object-contain" />
        </div>
        <h1 className="mb-3 text-3xl font-heading font-semibold tracking-tight text-[var(--color-navy)]">
          Enter your workspace
        </h1>
        <p className="text-[15px] text-[var(--color-slate)]">
          Sign in to view your debt cockpit, strategy models, and AI guidance.
        </p>
      </div>

      <div className="glass-panel p-8">
        <OAuthButtons callbackUrl={callbackUrl} />

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/70"></div>
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase tracking-[0.24em] text-amortix-slate">
            <span className="bg-[rgba(255,253,250,0.92)] px-4">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {verified && !error && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-[var(--radius-button)] px-4 py-3">
              Your account has been verified. You can now sign in.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-[var(--color-danger)] text-sm rounded-[var(--radius-button)] px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-[13px] font-semibold text-[var(--color-navy)] uppercase tracking-wide mb-2"
              >
                Email address
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full h-13 rounded-2xl border border-amortix-border-mid bg-white/80 pl-10 pr-4 text-sm text-[var(--color-navy)] placeholder:text-slate-400 outline-none transition-all focus:border-amortix-emerald focus:ring-4 focus:ring-amortix-emerald/10"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-[var(--color-danger)] text-xs mt-1.5 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-[13px] font-semibold text-[var(--color-navy)] uppercase tracking-wide"
                >
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full h-13 rounded-2xl border border-amortix-border-mid bg-white/80 pl-10 pr-12 text-sm text-[var(--color-navy)] placeholder:text-slate-400 outline-none transition-all focus:border-amortix-emerald focus:ring-4 focus:ring-amortix-emerald/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition-colors hover:text-[var(--color-amortix-navy)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[var(--color-danger)] text-xs mt-1.5 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <TurnstileWidget
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-navy)] text-sm font-semibold text-white shadow-[0_18px_34px_rgba(13,27,47,0.16)] transition-all duration-200 hover:scale-[1.01] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                Open dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-slate)] mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[var(--color-emerald)] font-medium hover:text-[var(--color-emerald-dark)] transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
