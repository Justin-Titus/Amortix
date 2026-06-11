"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { formatCurrency, type LoanInput } from "@/lib/calculations";

export default function InterestLeakDetector({
  loans,
  currencyCode = "INR",
}: {
  loans: LoanInput[];
  currencyCode?: string;
  profile?: any; // To keep interface compatible with page.tsx
}) {
  const totalInterestPerMonth = useMemo(() => {
    return loans.reduce((s, l) => {
      const monthlyRate = l.interestRate / 12 / 100;
      return s + (l.outstandingBalance * monthlyRate);
    }, 0);
  }, [loans]);

  const leakData = useMemo(() => {
    return loans
      .map(loan => {
        const monthlyInt = loan.outstandingBalance * (loan.interestRate / 12 / 100);
        return {
          id: loan.id,
          name: loan.name,
          interestRate: loan.interestRate,
          monthlyInterest: monthlyInt,
          pctOfTotalLeak: totalInterestPerMonth > 0 ? (monthlyInt / totalInterestPerMonth) * 100 : 0,
        };
      })
      .sort((a, b) => b.monthlyInterest - a.monthlyInterest);
  }, [loans, totalInterestPerMonth]);

  if (loans.length === 0) {
    return null;
  }

  return (
    <div className="card h-fit">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-base font-heading font-medium text-amortix-navy">
          <AlertTriangle className="h-5 w-5 text-amortix-amber" />
          Avoidable Interest Analysis
        </h2>
        <p className="mt-1 text-[11px] text-amortix-slate">
          Monthly interest bleeding from each loan
        </p>
      </div>

      <div className="divide-y divide-amortix-border-light">
        {leakData.map((loan) => (
          <div key={loan.id} className="py-4 first:pt-0">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-amortix-navy">{loan.name}</span>
                <span className={`text-[11px] font-bold ${loan.interestRate >= 15 ? 'text-amortix-red' : loan.interestRate >= 12 ? 'text-amortix-amber' : 'text-amortix-emerald'}`}>
                  {loan.interestRate}%
                </span>
              </div>
              <span className="num text-sm text-amortix-slate">
                {formatCurrency(loan.monthlyInterest, currencyCode)} / mo
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-amortix-frost">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${loan.interestRate >= 15 ? 'bg-amortix-red' : loan.interestRate >= 12 ? 'bg-amortix-amber' : 'bg-amortix-emerald'}`}
                  style={{ width: `${Math.min(100, loan.pctOfTotalLeak)}%` }}
                />
              </div>
              <span className="num w-8 text-right text-[11px] text-amortix-slate">
                {Math.round(loan.pctOfTotalLeak)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-amortix-border-light pt-4">
        <span className="text-sm text-amortix-slate">Monthly Interest Cost:</span>
        <span className="num text-lg font-medium text-amortix-red">
          {formatCurrency(totalInterestPerMonth, currencyCode)}
        </span>
      </div>
    </div>
  );
}
