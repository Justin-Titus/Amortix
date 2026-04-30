"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Clock, TrendingDown } from "lucide-react";
import { fadeUp, fadeUpStagger } from "@/lib/animations";

const stats = [
  {
    icon: TrendingDown,
    value: 2.3,
    prefix: "₹",
    suffix: "L",
    label: "Interest saved",
    description: "In a sample 4-loan portfolio with disciplined monthly extra payment.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Clock,
    value: 17,
    suffix: " mo",
    label: "Time reduced",
    description: "Median payoff acceleration when extra cash is prioritized by strategy.",
    color: "bg-slate-100 text-amortix-navy",
  },
  {
    icon: BarChart3,
    value: 24,
    suffix: "%",
    label: "Interest share drop",
    description: "Potential reduction in total interest vs minimum-only repayment.",
    color: "bg-amber-50 text-amber-600",
  },
];

function AnimatedValue({ value, prefix, suffix }: { value: number; prefix?: string; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentValue = value * progress;
      setDisplayValue(Number(currentValue.toFixed(value % 1 !== 0 ? 1 : 0)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="num-value text-4xl font-semibold tracking-tight text-amortix-navy">
      {prefix ?? ""}
      {displayValue}
      {suffix}
    </span>
  );
}

export default function StatsBand() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-slate-50 border-y border-slate-200 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <p className="section-label">Sample portfolio results</p>
          <h2 className="section-heading mt-3">What disciplined repayment looks like</h2>
        </div>

        <motion.ul initial={shouldReduceMotion ? false : "hidden"} whileInView={shouldReduceMotion ? undefined : "visible"} viewport={{ once: true, amount: 0.2 }} variants={fadeUpStagger} className="mt-12 grid gap-6 md:grid-cols-3 list-none" role="list">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.li key={item.label} variants={fadeUp} className="rounded-4xl border border-white/70 bg-white p-8 shadow-[0_20px_50px_rgba(15,27,45,0.06)]" role="listitem">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${item.color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="mt-6">
                  <AnimatedValue value={item.value} suffix={item.suffix} />
                  <h3 className="mt-3 text-xl font-semibold text-amortix-navy">{item.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-amortix-slate">{item.description}</p>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-amortix-text-muted">
          Sample portfolio assumptions: 4 mixed-rate loans, stable monthly payments, no penalties, no rate shocks.
        </p>
      </div>
    </section>
  );
}
