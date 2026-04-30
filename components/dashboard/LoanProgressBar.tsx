"use client";

import { motion, useReducedMotion } from "framer-motion";

type LoanProgressBarProps = {
  value: number;
  color: string;
};

export default function LoanProgressBar({ value, color }: LoanProgressBarProps) {
  const reduce = useReducedMotion();
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={reduce ? false : { width: "0%" }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
