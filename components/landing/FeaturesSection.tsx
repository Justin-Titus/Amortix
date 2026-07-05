"use client";

import { BarChart3, Bot, ShieldCheck, Users } from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import { motion } from "framer-motion";

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
    icon: Users,
    title: "Household workspaces",
    description: "Invite family members to collaborate on shared loans with granular member control.",
    iconBg: "bg-emerald-50",
    iconColor: "text-[#118c76]",
  },
  {
    icon: ShieldCheck,
    title: "Safer planning",
    description: "Track affordability, emergency coverage, and EMI pressure before you commit to new debt.",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
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

export default function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-heading" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <p className="section-label">What you get</p>
          <h2 id="features-heading" className="section-heading mt-3">
            Everything needed for a cleaner debt experience.
          </h2>
        </motion.div>

        <ul 
          className="mt-10 grid gap-4 lg:grid-cols-3 xl:gap-6 list-none" 
          role="list"
        >
          <motion.li 
            className="row-span-2 rounded-4xl bg-amortix-navy p-8 text-white shadow-[0_24px_80px_rgba(15,27,45,0.12)]" 
            role="listitem"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
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
                    <motion.div 
                      className={`${item.color} h-full rounded-full`} 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.li>

          {features.map((feature) => (
            <motion.li 
              key={feature.title} 
              role="listitem" 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <FeatureCard
                Icon={feature.icon}
                title={feature.title}
                description={feature.description}
                iconBg={feature.iconBg}
                iconColor={feature.iconColor}
                className="rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,27,45,0.06)] h-full"
              />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
