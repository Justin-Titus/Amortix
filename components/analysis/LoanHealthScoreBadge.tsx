"use client";

function scoreTone(score: number): string {
  if (score >= 75) return "bg-amortix-emerald text-white";
  if (score >= 50) return "bg-amortix-amber text-amortix-navy";
  return "bg-amortix-red text-white";
}

export default function LoanHealthScoreBadge({ score }: { score: number }) {
  return (
    <div className="group relative">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs font-medium ${scoreTone(score)}`}>
        {score}
      </div>
      <div className="pointer-events-none absolute right-0 top-12 z-10 w-56 rounded-xl border border-amortix-border-light bg-white p-3 text-[11px] text-amortix-slate opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        This score reflects this loan&apos;s interest rate, EMI burden, and repayment progress.
      </div>
    </div>
  );
}
