"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth.schema";
import { forgotPassword } from "@/app/actions/auth";
import Link from "next/link";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await forgotPassword({
        email: data.email,
        captchaToken: captchaToken || undefined,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send the reset link. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="mx-auto w-full max-w-105">
          {success ? (
            <div className="card text-center py-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amortix-emerald-bg overflow-hidden">
              <Image src="/Amortix.png" alt="Amortix logo" width={56} height={56} className="h-full w-full object-contain" />
            </div>
              <h2 className="mb-2 text-xl font-heading font-medium text-amortix-navy">
                Check your email
              </h2>
              <p className="mb-6 text-sm text-amortix-slate">
                If an account exists with that email, we&apos;ve sent a password reset link.
              </p>
              <Link href="/login" className="text-sm font-medium text-amortix-emerald hover:text-emerald-700 transition-colors">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/70 bg-white/75 shadow-[0_18px_30px_rgba(9,17,31,0.08)] overflow-hidden">
                  <Image src="/Amortix.png" alt="Amortix logo" width={56} height={56} className="h-full w-full object-contain" />
                </div>
                <h1 className="mb-2 text-3xl font-heading font-medium text-amortix-navy">
                  Forgot password?
                </h1>
                <p className="text-sm text-amortix-slate">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>
              <div className="card">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-amortix-red">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-amortix-navy">
                      Email address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                      className="input"
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-amortix-red">{errors.email.message}</p>
                    )}
                  </div>
                  <TurnstileWidget onVerify={(token) => setCaptchaToken(token)} />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full disabled:opacity-50"
                    id="forgot-submit-btn"
                  >
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-amortix-slate">
                  <Link href="/login" className="font-medium text-amortix-emerald hover:text-emerald-700 transition-colors">
                    Back to login
                  </Link>
                </p>
              </div>
            </>
          )}
      </div>
    </AuthSplitLayout>
  );
}
