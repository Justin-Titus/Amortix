"use client";

import dynamic from "next/dynamic";

const CalculatorSection = dynamic(() => import("@/components/landing/CalculatorSection"), {
  ssr: false,
  loading: () => (
    <div className="mt-20 rounded-4xl border border-slate-200 bg-slate-50 p-12 text-center text-sm text-amortix-slate shadow-[0_28px_80px_rgba(15,27,45,0.08)]">
      Loading calculator…
    </div>
  ),
});

export default function DeferredCalculator() {
  return <CalculatorSection />;
}
