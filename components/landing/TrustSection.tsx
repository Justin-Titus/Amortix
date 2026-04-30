"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Lock, Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/animations";

const trustItems = [
  {
    icon: ShieldCheck,
    label: "No bank connection needed",
  },
  {
    icon: Lock,
    label: "Your data stays on-device",
  },
  {
    icon: Sparkles,
    label: "All calculations are auditable",
  },
];

export default function TrustSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-slate-50 py-20 border-y border-amortix-border-light">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={shouldReduceMotion ? false : "hidden"} whileInView={shouldReduceMotion ? undefined : "visible"} viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">Built to be trusted</p>
            <h2 className="section-heading mt-3">
              Built to be trusted with serious financial decisions.
            </h2>
            <p className="body-text mt-4">
              Every number Amortix shows you is calculated from the debt details you enter. No bank connection, no third-party sharing, and no surprises.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 list-none" role="list">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center gap-3 rounded-3xl border border-amortix-border-light bg-white px-5 py-4 shadow-[0_18px_40px_rgba(15,27,45,0.06)]" role="listitem">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-amortix-navy">{item.label}</p>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
