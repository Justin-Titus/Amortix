"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  optimizeEMIAllocation,
  formatCurrency,
  type LoanState,
} from "@/lib/calculations";

function confidenceLabel(score: number): string {
  if (score >= 70) return "High confidence";
  if (score >= 40) return "Medium confidence";
  return "Low confidence";
}

export default function EMIOptimizerPanel({
  loans,
  extraBudget,
  onExtraBudgetChange,
  oneTimePayment = 0,
  onOneTimePaymentChange,
  currencyCode = "INR",
}: {
  loans: LoanState[];
  extraBudget: number;
  onExtraBudgetChange: (value: number) => void;
  oneTimePayment?: number;
  onOneTimePaymentChange?: (value: number) => void;
  currencyCode?: string;
}) {
  const result = useMemo(
    () => optimizeEMIAllocation(loans, extraBudget, currencyCode, 240, oneTimePayment),
    [loans, extraBudget, currencyCode, oneTimePayment]
  );

  const targetLoan = useMemo(() => {
    if (!result.allocations.length) return null;
    const top = result.allocations.reduce((best, curr) =>
      curr.extraAllocation > best.extraAllocation ? curr : best
    );
    return top.extraAllocation > 0 ? top.loanName : null;
  }, [result.allocations]);

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amortix-emerald">
            Smart Engine
          </div>
          <h3 className="mt-2 text-sm font-medium text-amortix-navy">Smart Payment Engine</h3>
          <p className="mt-1 text-xs text-amortix-slate">
            Based on your loan rates and balances, here&apos;s the optimal way to split your extra budget this month.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs text-amortix-slate">Extra monthly budget</label>
          <input
            type="number"
            value={extraBudget}
            min={0}
            step={500}
            onChange={(event) => onExtraBudgetChange(Number(event.target.value))}
            className="input mt-1"
          />
        </div>
        {onOneTimePaymentChange && (
          <div>
            <label className="text-xs text-amortix-slate">One-time prepayment</label>
            <input
              type="number"
              value={oneTimePayment}
              min={0}
              step={5000}
              onChange={(event) => onOneTimePaymentChange(Number(event.target.value))}
              className="input mt-1"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-card border border-amortix-border-light">
        <table className="w-full text-left text-xs">
          <thead className="bg-amortix-frost text-amortix-slate">
            <tr>
              <th className="px-3 py-2">Loan</th>
              <th className="px-3 py-2">Base EMI</th>
              <th className="px-3 py-2">+ Extra</th>
              <th className="px-3 py-2">Total payment</th>
            </tr>
          </thead>
          <tbody>
            {result.allocations.map((allocation, index) => (
              <motion.tr
                key={allocation.loanId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="border-t border-amortix-border-light"
              >
                <td className="px-3 py-2 text-amortix-navy">{allocation.loanName}</td>
                <td className="px-3 py-2 font-mono text-amortix-slate">{formatCurrency(allocation.baseEMI, currencyCode)}</td>
                <td className={`px-3 py-2 font-mono ${allocation.extraAllocation > 0 ? "text-amortix-emerald" : "text-amortix-slate"}`}>
                  {formatCurrency(allocation.extraAllocation, currencyCode)}
                </td>
                <td className="px-3 py-2 font-mono text-amortix-navy">{formatCurrency(allocation.totalPayment, currencyCode)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {targetLoan && extraBudget > 0 && (
          <div className="badge-green px-3 py-1.5 text-xs">
            Target: {targetLoan}
          </div>
        )}
        {oneTimePayment > 0 && (
          <div className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            +{formatCurrency(oneTimePayment, currencyCode)} prepaid
          </div>
        )}
        {result.vsAvalanche.monthsDifference > 0 && (
          <div className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            {result.vsAvalanche.monthsDifference} months earlier vs Avalanche
          </div>
        )}
        <div
          className={`rounded-full border px-3 py-1 text-[11px] ${result.confidenceScore >= 70 ? "border-emerald-200 text-emerald-700" : result.confidenceScore >= 40 ? "border-amber-200 text-amber-700" : "border-slate-200 text-slate-700"}`}
          title="Confidence is higher when rate and balance differences are larger across loans."
        >
          {confidenceLabel(result.confidenceScore)}
        </div>
      </div>
    </div>
  );
}
