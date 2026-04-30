"use client";

import Image from "next/image";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validations/auth.schema";
import { resetPassword } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: { password: string; confirmPassword: string; token: string }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await resetPassword(data);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset your password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card text-center py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amortix-emerald-bg overflow-hidden">
          <Image src="/Amortix.png" alt="Amortix logo" width={56} height={56} className="h-full w-full object-contain" />
        </div>
        <h2 className="mb-2 text-xl font-heading font-medium text-amortix-navy">Password reset!</h2>
        <p className="mb-6 text-sm text-amortix-slate">Your password has been successfully updated.</p>
        <Link
          href="/login"
          className="btn-primary inline-flex"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="card text-center py-12">
        <h2 className="mb-2 text-xl font-heading font-medium text-amortix-navy">Invalid link</h2>
        <p className="mb-6 text-sm text-amortix-slate">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-amortix-emerald hover:text-emerald-700 transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/70 bg-white/75 shadow-[0_18px_30px_rgba(9,17,31,0.08)] overflow-hidden">
          <Image src="/Amortix.png" alt="Amortix logo" width={56} height={56} className="h-full w-full object-contain" />
        </div>
        <h1 className="mb-2 text-3xl font-heading font-medium text-amortix-navy">Set new password</h1>
        <p className="text-sm text-amortix-slate">Choose a strong password for your account</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-amortix-red">{error}</div>
          )}
          <input type="hidden" {...register("token")} />
          <div>
            <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-amortix-navy">New password</label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className="input"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
            />
            {errors.password && <p className="mt-1 text-xs text-amortix-red">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-medium text-amortix-navy">Confirm password</label>
            <input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="input"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-amortix-red">{errors.confirmPassword.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50"
            id="reset-submit-btn"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout>
      <div className="mx-auto w-full max-w-105">
        <Suspense fallback={<div className="card h-64 animate-pulse" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </AuthSplitLayout>
  );
}
