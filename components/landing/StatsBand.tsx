"use client";

import { BarChart3, Clock, TrendingDown } from "lucide-react";
import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function CountUpNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [displayValue, setDisplayValue] = useState("0");
  const hasDecimals = value % 1 !== 0;

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(v) {
          setDisplayValue(hasDecimals ? v.toFixed(1) : Math.round(v).toString());
        },
      });
      return () => controls.stop();
    }
  }, [isInView, value, hasDecimals]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function StatsBand() {
  return (
    <section className="bg-slate-50 border-y border-slate-200 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <p className="section-label">Sample portfolio results</p>
          <h2 className="section-heading mt-3">What disciplined repayment looks like</h2>
        </motion.div>

        <ul 
          className="mt-12 grid gap-6 md:grid-cols-3 list-none" 
          role="list"
        >
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <motion.li 
                key={item.label} 
                className="rounded-4xl border border-white/70 bg-white p-8 shadow-[0_20px_50px_rgba(15,27,45,0.06)]" 
                role="listitem"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${item.color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="mt-6">
                  <span className="num-value text-4xl font-semibold tracking-tight text-amortix-navy">
                    <CountUpNumber value={item.value} prefix={item.prefix} suffix={item.suffix} />
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-amortix-navy">{item.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-amortix-slate">{item.description}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <motion.p 
          className="mx-auto mt-8 max-w-2xl text-center text-sm text-amortix-text-muted"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Sample portfolio assumptions: 4 mixed-rate loans, stable monthly payments, no penalties, no rate shocks.
        </motion.p>
      </div>
    </section>
  );
}
