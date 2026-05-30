"use client";

import { motion, useReducedMotion } from "framer-motion";
import { getAffordabilityZoneLabel } from "@/lib/calculations";

type AffordabilityGaugeProps = {
  score: number;
};

function getGaugeColor(score: number) {
  if (score >= 75) return "#059669";
  if (score >= 50) return "#F59E0B";
  return "#DC2626";
}

export default function AffordabilityGauge({ score }: AffordabilityGaugeProps) {
  const reduce = useReducedMotion();
  const normalizedScore = Number.isFinite(score) ? score : 0;
  const safeScore = Math.min(100, Math.max(0, normalizedScore));
  const radius = 62;
  const cx = 80;
  const cy = 80;
  const circumference = Math.PI * radius;
  const progress = circumference * (1 - safeScore / 100);

  const zoneLabel = getAffordabilityZoneLabel(safeScore);

  return (
    <div className="mx-auto w-40" role="img" aria-label={`Affordability score: ${safeScore}, ${zoneLabel}`}>
      <svg width="160" height="90" viewBox="0 0 160 90" role="img" aria-hidden="true">
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={getGaugeColor(safeScore)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          aria-hidden="true"
        />
      </svg>

      <div className="-mt-9 text-center">
        <p className="num text-2xl font-medium text-amortix-navy">{safeScore}</p>
        <p className="text-xs text-amortix-slate">{zoneLabel}</p>
      </div>
    </div>
  );
}
