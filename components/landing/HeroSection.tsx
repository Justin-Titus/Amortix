"use client";

import Link from "next/link";
import { ArrowRight, TrendingDown, Zap } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_22px_90px_rgba(15,27,45,0.12)]">
      <div className="absolute right-0 top-0 h-48 w-48 -translate-x-12 -translate-y-12 rounded-full bg-emerald-100 blur-3xl" />
      <div className="rounded-4xl bg-amortix-navy-deep p-6 text-white shadow-inner">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Live snapshot</p>
            <h3 className="mt-3 text-xl font-semibold">Your debt command center</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/70">
            Updated now
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60">
              <TrendingDown className="h-4 w-4 text-emerald-300" />
              <span>Payoff momentum</span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight">₹18.2L</p>
            <p className="mt-2 text-sm text-white/60">Projected savings across all loans</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60">
              <Zap className="h-4 w-4 text-amber-300" />
              <span>Strategy leader</span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight">Avalanche</p>
            <p className="mt-2 text-sm text-white/60">Highest interest-first payoff plan</p>
          </div>

          <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/60">
              <span>Balance trajectory</span>
              <span>12-month view</span>
            </div>
            <div className="mt-4 flex h-24 items-end gap-2">
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

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Monthly EMI", value: "₹42,650" },
            { label: "Debt count", value: "04" },
            { label: "AI ready", value: "24/7" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">{item.label}</p>
              <p className="mt-3 text-xl font-semibold tracking-tight">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeroSection({ totalActiveLoans = 24000000 }: { totalActiveLoans?: number }) {
  const formattedAmount = formatIndianCurrency(totalActiveLoans);

  return (
    <section id="hero" aria-labelledby="hero-heading" className="bg-white py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <motion.div 
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label">3 strategies · 12-month projections · AI advisor</p>
          <h1 className="hero-h1 mt-6">A sharper way<br />to manage debt.</h1>
          <p className="body-text mt-6 max-w-xl">
            Amortix gives you a clean debt workspace: compare repayment strategies, model EMI pressure, and ask an AI advisor what to do next.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">
              Start free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#calculator" className="btn-secondary">
              Try the calculator
            </a>
          </div>

            <div className="mt-8 flex flex-col gap-4 rounded-4xl border border-slate-200/70 bg-amortix-frost p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['JT', 'AM', 'SR', 'PK'].map((initial, index) => (
                    <span key={initial} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0D1F3C] text-xs font-semibold text-white shadow-sm" style={{ marginLeft: index === 0 ? 0 : -8 }}>
                      {initial}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-amortix-slate">
                  Trusted by borrowers tracking <span className="font-medium text-amortix-navy">{formattedAmount}</span> in active loans.
                </p>
              </div>
              <p className="text-sm text-amortix-slate">
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
