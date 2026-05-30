"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { detectInterestLeaks, formatCurrency, type FinancialProfileInput, type LoanInput } from "@/lib/calculations";

export default function InterestLeakDetector({
  loans,
  profile,
  currencyCode = "INR",
}: {
  loans: LoanInput[];
  profile: FinancialProfileInput | null;
  currencyCode?: string;
}) {
  if (!profile || loans.length === 0) {
    return null;
  }

  const leaks = detectInterestLeaks(loans, profile, currencyCode);

  if (leaks.length === 0) {
    return null;
  }

  const totalAnnualLeak = leaks.reduce((sum, leak) => sum + leak.annualLeakAmount, 0);

  return (
    <div className="card border-amber-200 bg-amber-50/60 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <span>
            We found {leaks.length} interest leak{leaks.length === 1 ? "" : "s"} costing you {formatCurrency(totalAnnualLeak, currencyCode)}/year.
          </span>
        </div>
        <Link href="/insights" className="text-xs font-semibold text-amber-800 hover:text-amber-900">
          View all {'->'}
        </Link>
      </div>
    </div>
  );
}
