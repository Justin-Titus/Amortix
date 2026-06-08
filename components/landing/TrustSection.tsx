"use client";

import { ShieldCheck, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function TrustSection() {
  return (
    <section className="bg-slate-50 py-20 border-y border-amortix-border-light">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="section-label">Built to be trusted</p>
            <h2 className="section-heading mt-3">
              Built to be trusted with serious financial decisions.
            </h2>
            <p className="body-text mt-4">
              Every number Amortix shows you is calculated from the debt details you enter. No bank connection, no third-party sharing, and no surprises.
            </p>
          </motion.div>

          <ul 
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 list-none" 
            role="list"
          >
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.li 
                  key={item.label} 
                  className="flex items-center gap-3 rounded-3xl border border-amortix-border-light bg-white px-5 py-4 shadow-[0_18px_40px_rgba(15,27,45,0.06)]" 
                  role="listitem" 
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-amortix-navy">{item.label}</p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
