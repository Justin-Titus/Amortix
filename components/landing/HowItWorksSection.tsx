"use client";

import { BarChart3, CheckCircle2, Plus } from "lucide-react";
import StepCard from "@/components/ui/StepCard";
import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label">How it works</p>
          <h2 id="how-it-works-heading" className="section-heading mt-3">
            Three steps from chaos to control.
          </h2>
        </motion.div>

        <ol 
          className="relative mt-12 grid gap-6 lg:grid-cols-3 list-none"
          role="list"
        >
          <div className="pointer-events-none absolute inset-x-0 top-10 hidden h-px bg-slate-200 lg:block" />
          {steps.map((step) => (
            <motion.li 
              key={step.number} 
              className="relative list-none" 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <StepCard
                number={step.number}
                title={step.title}
                description={step.description}
                outcome={step.outcome}
                Icon={step.Icon}
              />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
