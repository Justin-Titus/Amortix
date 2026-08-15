  "use client";

import Link from "next/link";
import { ArrowRight, TrendingDown, Zap } from "lucide-react";
import { motion } from "framer-motion";
import TotalLoanTracker from "@/components/landing/TotalLoanTracker";

function formatIndianCurrency(amount: number) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr+`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L+`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k+`;
  }
  return `₹${amount}`;
}


function DashboardPreview() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_75px_rgba(15,27,45,0.11)]">
      <div className="absolute right-0 top-0 h-44 w-44 -translate-x-12 -translate-y-12 rounded-full bg-emerald-100 blur-3xl" />
      <div className="rounded-3xl bg-amortix-navy-deep p-5 sm:p-6 text-white shadow-inner">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Live snapshot</p>
            <h3 className="mt-2 text-lg sm:text-xl font-semibold">Your debt command center</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
            Updated now
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
              <TrendingDown className="h-4 w-4 text-emerald-300" />
              <span>Payoff momentum</span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">₹18.2L</p>
            <p className="mt-1.5 text-xs text-white/60">Projected savings across all loans</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
              <Zap className="h-4 w-4 text-amber-300" />
              <span>Strategy leader</span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">Avalanche</p>
            <p className="mt-1.5 text-xs text-white/60">Highest interest-first payoff plan</p>
          </div>

          <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
              <span>Balance trajectory</span>
              <span>12-month view</span>
            </div>
            <div className="mt-3.5 flex h-20 items-end gap-1.5">
              {[34, 44, 58, 48, 38, 31, 25, 20, 18, 12, 9, 5].map((value, index) => (
                <motion.div
                  key={index}
                  className="flex-1 rounded-t-full bg-linear-to-t from-emerald-500 to-emerald-300"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.05 + 0.5 }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Monthly EMI", value: "₹42,650" },
            { label: "Debt count", value: "04" },
            { label: "AI ready", value: "24/7" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">{item.label}</p>
              <p className="mt-2 text-lg font-semibold tracking-tight">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function HeroSection() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <section id="hero" aria-labelledby="hero-heading" className="bg-white py-10 sm:py-12 md:py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <motion.div 
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label">3 strategies · 12-month projections · AI advisor</p>
          <h1 className="hero-h1 mt-4">A sharper way<br />to manage <span className="text-amortix-emerald">debt</span>.</h1>
          <p className="body-text mt-5 max-w-xl">
            Amortix gives you a clean debt workspace: compare repayment strategies, model EMI pressure, and ask an AI advisor what to do next.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {user ? (
              <Link href="/dashboard" prefetch={true} className="btn-primary">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/register" prefetch={true} className="btn-primary">
                Start free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            <a href="#calculator" className="btn-secondary">
              Try the calculator
            </a>
          </div>

            <div className="mt-7 flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-amortix-frost p-4.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['JT', 'AM', 'SR', 'PK'].map((initial, index) => (
                    <span key={initial} className="flex h-8.5 w-8.5 items-center justify-center rounded-full border-2 border-white bg-[#0D1F3C] text-[11px] font-semibold text-white shadow-sm" style={{ marginLeft: index === 0 ? 0 : -8 }}>
                      {initial}
                    </span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-amortix-slate">
                  Trusted by borrowers tracking <TotalLoanTracker /> in active loans.
                </p>
              </div>
              <p className="text-xs sm:text-sm text-amortix-slate">
                A calmer, cleaner debt workflow that feels precise instead of noisy.
              </p>
            </div>
          </motion.div>

        <motion.div 
          className="lg:justify-self-end"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
