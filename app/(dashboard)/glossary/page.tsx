import { BookOpen } from "lucide-react";
import { PageBadge } from "@/components/ui/PageBadge";
import GlossaryList from "@/components/glossary/GlossaryList";

export const metadata = {
  title: "Glossary ",
  description: "Understand key loan, repayment, and risk terms used across Amortix.",
};

const glossaryGroups = [
  {
    title: "Core loan terms",
    icon: "book-open",
    color: "blue",
    items: [
      {
        term: "Principal",
        definition: "The original amount borrowed, before adding interest.",
      },
      {
        term: "Outstanding balance",
        definition: "How much principal is still unpaid right now.",
      },
      {
        term: "Tenure",
        definition: "The total repayment duration, usually shown in months.",
      },
      {
        term: "Floating rate",
        definition: "A variable interest rate that can change based on market benchmarks.",
      },
    ],
  },
  {
    title: "Repayment strategy",
    icon: "trending-up",
    color: "emerald",
    items: [
      {
        term: "Debt avalanche",
        definition: "Prioritize extra payments toward the highest-interest loan first.",
      },
      {
        term: "Debt snowball",
        definition: "Prioritize the smallest outstanding loan first for faster closure wins.",
      },
      {
        term: "Hybrid strategy",
        definition: "Mix avalanche and snowball by balancing savings with momentum.",
      },
      {
        term: "Prepayment",
        definition: "A payment made above regular EMI to reduce future interest burden.",
      },
    ],
  },
  {
    title: "Risk and health metrics",
    icon: "shield-check",
    color: "amber",
    items: [
      {
        term: "DTI ratio",
        definition: "Debt-to-income ratio. Monthly EMI obligations divided by monthly income.",
      },
      {
        term: "EMI load",
        definition: "The total EMI amount you pay each month across all active loans.",
      },
      {
        term: "Default risk score",
        definition: "A model-driven estimate of repayment stress based on your profile and loan mix.",
      },
      {
        term: "Interest leak",
        definition: "Avoidable annual interest loss caused by inefficient allocation or loan structure.",
      },
    ],
  },
  {
    title: "Quick formulas",
    icon: "calculator",
    color: "slate",
    items: [
      {
        term: "DTI",
        definition: "DTI = Total monthly EMI / Monthly income",
      },
      {
        term: "Disposable income",
        definition: "Disposable income = Monthly income - Monthly expenses",
      },
      {
        term: "Paid percentage",
        definition: "Paid % = (1 - Outstanding / Principal) * 100",
      },
      {
        term: "Weighted average rate",
        definition: "Sum(rate * outstanding) / Sum(outstanding)",
      },
    ],
  },
];

export default function GlossaryPage() {
  return (
    <div className="animate-fade-up space-y-8">
      <div className="glass-panel p-6">
        <div className="max-w-3xl">
          <PageBadge icon={BookOpen} label="Learn the language" />
          <h1 className="mt-4 text-3xl font-heading font-medium text-amortix-navy md:text-4xl">Glossary</h1>
          <p className="mt-2 text-sm leading-7 text-amortix-slate md:text-[15px]">
            A quick reference for the financial terms, risk indicators, and formulas used across Amortix.
          </p>
        </div>
      </div>

      <GlossaryList groups={glossaryGroups} />
    </div>
  );
}
