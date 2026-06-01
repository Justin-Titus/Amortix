"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { syncUserWithPrisma, isPasswordLeaked } from "@/app/actions/auth";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "var(--color-danger)" };
  if (score <= 2)
    return { score, label: "Fair", color: "var(--color-amber)" };
  if (score <= 3)
    return { score, label: "Good", color: "var(--color-amber-light)" };
  return { score, label: "Strong", color: "var(--color-emerald)" };
}

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const supabase = createClient();
  const password = watch("password", "");
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Check for leaked password first
      const pwned = await isPasswordLeaked(data.password);
      if (pwned) {
        setError("This password has been compromised in a data breach. Please select a different password.");
        setIsSubmitting(false);
        return;
      }

      // 1. Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        // 2. Sync with Prisma
        const syncResult = await syncUserWithPrisma({
          id: authData.user.id,
          email: data.email,
          name: data.name,
        });

        if (!syncResult?.success) {
          setError("Failed to sync user data. Please try again.");
          return;
        }

        setSuccess(true);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto w-full max-w-[440px]">
        <div className="glass-panel py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amortix-emerald-bg overflow-hidden">
            <Image src="/Amortix.png" alt="Amortix logo" width={56} height={56} className="h-full w-full object-contain" />
          </div>
          <h2 className="text-xl font-heading font-medium text-[var(--color-navy)] mb-2">
            Check your inbox
          </h2>
          <p className="text-sm text-[var(--color-slate)] mb-6 max-w-[280px] mx-auto">
            We&apos;ve sent a verification link to your email. Click the link to
            activate your account.
          </p>
          <Link
            href="/login"
            className="text-sm text-[var(--color-emerald)] font-medium hover:text-[var(--color-emerald-dark)] transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="mb-8 text-center">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/70 bg-white/75 shadow-[0_18px_30px_rgba(9,17,31,0.08)] overflow-hidden">
          <Image src="/Amortix.png" alt="Amortix logo" width={56} height={56} className="h-full w-full object-contain" />
        </div>
        <h1 className="mb-2 text-3xl font-heading font-medium text-[var(--color-navy)]">
          Create your account
        </h1>
        <p className="text-[var(--color-slate)] text-sm">
          Start tracking loans in a cleaner, more interactive workspace.
        </p>
      </div>

      <div className="glass-panel p-8">


        {error && (
          <div className="bg-red-50 border border-red-200 text-[var(--color-danger)] text-sm rounded-[var(--radius-button)] px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="register-name"
              className="block text-sm font-medium text-[var(--color-navy)] mb-1.5"
            >
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className="input"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-[var(--color-danger)] text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-[var(--color-navy)] mb-1.5"
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="input"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-[var(--color-danger)] text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-[var(--color-navy)] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
                className="input pr-12"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
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
              <p className="text-[var(--color-danger)] text-xs mt-1">
                {errors.password.message}
              </p>
            )}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors duration-200"
                      style={{
                        backgroundColor:
                          i <= strength.score
                            ? strength.color
                            : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="register-confirm"
              className="block text-sm font-medium text-[var(--color-navy)] mb-1.5"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="register-confirm"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="input pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                aria-pressed={showConfirmPassword}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition-colors hover:text-[var(--color-amortix-navy)]"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[var(--color-danger)] text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
            id="register-submit-btn"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--color-slate)] mt-4">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-[var(--color-emerald)] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[var(--color-emerald)] hover:underline">
            Privacy Policy
          </Link>.
        </p>

        <p className="text-center text-sm text-[var(--color-slate)] mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--color-emerald)] font-medium hover:text-[var(--color-emerald-dark)] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
