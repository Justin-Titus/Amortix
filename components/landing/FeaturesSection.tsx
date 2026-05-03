"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Bot, FileDown, ShieldCheck } from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import { fadeUp, fadeUpStagger } from "@/lib/animations";

const features = [
  {
    icon: BarChart3,
    title: "Strategy comparison",
    description: "Avalanche, Snowball, and Hybrid payoff plans ranked by cost and time saved.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Bot,
    title: "Personal AI advisor",
    description: "Ask questions about extra payments, payoff timing, and balance reduction in plain language.",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: FileDown,
    title: "Export-ready reports",
    description: "Turn amortization schedules into CSV or PDF summaries without reformatting the data.",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    icon: ShieldCheck,
    title: "Safer planning",
    description: "Track affordability, emergency coverage, and EMI pressure before you commit to new debt.",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
];

export default function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="features" aria-labelledby="features-heading" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="section-label">What you get</p>
          <h2 id="features-heading" className="section-heading mt-3">
            Everything needed for a cleaner debt experience.
          </h2>
        </div>

        <motion.ul initial={shouldReduceMotion ? false : "hidden"} whileInView={shouldReduceMotion ? undefined : "visible"} viewport={{ once: true, amount: 0.2 }} variants={fadeUpStagger} className="mt-10 grid gap-4 lg:grid-cols-3 xl:gap-6 list-none" role="list">
          <motion.li variants={fadeUp} className="row-span-2 rounded-4xl bg-amortix-navy p-8 text-white shadow-[0_24px_80px_rgba(15,27,45,0.12)]" role="listitem">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-200">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="mt-6 text-2xl font-semibold">Clear loan visibility</h3>
            <p className="mt-4 text-sm leading-7 text-white/80">
              See balances, rates, and monthly load in one calm dashboard instead of scattered spreadsheets.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { label: "Home loan", value: 34, color: "bg-emerald-400" },
                { label: "Education", value: 61, color: "bg-amber-400" },
                { label: "Personal loan", value: 18, color: "bg-slate-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.li>

          {features.map((feature) => (
            <motion.li key={feature.title} variants={fadeUp} role="listitem">
              <FeatureCard
                Icon={feature.icon}
                title={feature.title}
                description={feature.description}
                iconBg={feature.iconBg}
                iconColor={feature.iconColor}
                className="rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,27,45,0.06)]"
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
