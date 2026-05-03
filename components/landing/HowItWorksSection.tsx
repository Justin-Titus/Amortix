"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, CheckCircle2, Plus } from "lucide-react";
import StepCard from "@/components/ui/StepCard";
import { fadeUp, fadeUpStagger } from "@/lib/animations";

const steps = [
  {
    number: "01",
    title: "Add your loans",
    description: "Enter principal, rate, tenure, and EMI once. Amortix keeps the details organized.",
    outcome: "Your full debt portfolio in one place",
    Icon: Plus,
  },
  {
    number: "02",
    title: "Compare the math",
    description: "See which payoff strategy saves the most interest and which one clears debt fastest.",
    outcome: "Pick the right strategy in minutes",
    Icon: BarChart3,
  },
  {
    number: "03",
    title: "Act with confidence",
    description: "Use the AI advisor, reminders, and exports to stay on track without second-guessing.",
    outcome: "Stay on track every month",
    Icon: CheckCircle2,
  },
];

export default function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="section-label">How it works</p>
          <h2 id="how-it-works-heading" className="section-heading mt-3">
            Three steps from chaos to control.
          </h2>
        </div>

        <motion.ol initial={shouldReduceMotion ? false : "hidden"} whileInView={shouldReduceMotion ? undefined : "visible"} viewport={{ once: true, amount: 0.2 }} variants={fadeUpStagger} className="relative mt-12 grid gap-6 lg:grid-cols-3 list-none">
          <div className="pointer-events-none absolute inset-x-0 top-10 hidden h-px bg-slate-200 lg:block" />
          {steps.map((step) => (
            <motion.li key={step.number} variants={fadeUp} className="relative list-none">
              <StepCard
                number={step.number}
                title={step.title}
                description={step.description}
                outcome={step.outcome}
                Icon={step.Icon}
              />
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
