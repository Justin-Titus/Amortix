"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { hoverLift, pressScale, numberTickUp } from "@/lib/animations-extended";

type MetricCardValueColor = "default" | "emerald" | "amber" | "red" | "muted";

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  isEmpty?: boolean;
  valueColor?: MetricCardValueColor;
  onClick?: () => void;
}

const colorMap: Record<MetricCardValueColor, string> = {
  default: "text-amortix-navy",
  emerald: "text-amortix-emerald",
  amber: "text-amortix-amber",
  red: "text-amortix-red",
  muted: "text-amortix-text-muted",
};

export function MetricCard({
  label,
  value,
  description,
  isEmpty,
  valueColor = "default",
  onClick,
}: MetricCardProps) {
  const cardContent = (
    <Card
      className={`p-5 min-h-[110px] ${
        onClick ? "cursor-pointer hover:border-amortix-emerald" : ""
      }`}
    >
      <p className="mb-2 text-[11px] font-medium tracking-[0.025em] text-amortix-slate uppercase">
        {label}
      </p>
      {isEmpty ? (
        <>
          <div className="mb-1.5 h-6 w-20 animate-pulse rounded bg-slate-100" />
          <p className="text-[11px] text-slate-300">{description ?? "Add loans to see this"}</p>
        </>
      ) : (
        <>
          {/* Animated number value — slides up when value changes */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={String(value)}
              variants={numberTickUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`mb-1 text-[22px] font-medium font-mono ${colorMap[valueColor]}`}
            >
              {value}
            </motion.p>
          </AnimatePresence>
          {description ? (
            <p className="text-[11px] leading-snug text-slate-500 line-clamp-2">{description}</p>
          ) : null}
        </>
      )}
    </Card>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className="w-full text-left rounded-3xl"
        {...hoverLift}
        {...pressScale}
      >
        {cardContent}
      </motion.button>
    );
  }

  return (
    <motion.div className="rounded-3xl" {...hoverLift}>
      {cardContent}
    </motion.div>
  );
}
