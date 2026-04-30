"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CircleAlert, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  predictDefaultRisk,
  type DefaultRiskInput,
  type DefaultRiskResult,
} from "@/lib/ml/default-risk";

function riskColor(result: DefaultRiskResult): string {
  if (result.riskScore < 15) return "#059669";
  if (result.riskScore < 35) return "#F59E0B";
  if (result.riskScore < 60) return "#DC2626";
  return "#B91C1C";
}

function riskBadge(result: DefaultRiskResult): string {
  if (result.riskLevel === "low") return "badge-green";
  if (result.riskLevel === "medium") return "badge-amber";
  if (result.riskLevel === "high") return "badge-red";
  return "badge-red";
}

export default function DefaultRiskCard({ riskInput }: { riskInput: DefaultRiskInput }) {
  const [expanded, setExpanded] = useState(false);
  const risk = useMemo(() => predictDefaultRisk(riskInput), [riskInput]);

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium uppercase tracking-wider text-amortix-slate">Default Risk (3M)</h3>
        <span className={riskBadge(risk)}>{risk.riskLevel.toUpperCase()}</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-amortix-border-light">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${risk.riskScore}%` }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.12 }}
          className="h-full rounded-full"
          style={{ backgroundColor: riskColor(risk) }}
        />
      </div>

      <p className="text-sm text-amortix-navy">Risk score: <span className="font-mono">{risk.riskScore}%</span></p>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="inline-flex items-center gap-1 text-xs font-medium text-amortix-emerald hover:text-emerald-700"
      >
        3 key factors
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded ? (
        <div className="space-y-2">
          {risk.topFactors.map((factor) => (
            <div key={factor.name} className="rounded-lg border border-amortix-border-light px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-amortix-navy">{factor.name}</p>
                {factor.impact === "negative" ? (
                  <CircleAlert className="h-4 w-4 text-amortix-red" />
                ) : (
                  <CircleCheck className="h-4 w-4 text-amortix-emerald" />
                )}
              </div>
              <p className="mt-1 text-[11px] text-amortix-slate">{factor.description}</p>
            </div>
          ))}
        </div>
      ) : null}

      <p className="text-[13px] italic text-amortix-slate">{risk.recommendation}</p>
    </Card>
  );
}
