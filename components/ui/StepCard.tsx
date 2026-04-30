import type { LucideIcon } from "lucide-react";

type StepCardProps = {
  number: string;
  title: string;
  description: string;
  outcome: string;
  Icon: LucideIcon;
};

import { Card } from "@/components/ui/Card";

export default function StepCard({ number, title, description, outcome, Icon }: StepCardProps) {
  const titleId = `step-${number}-title`;

  return (
    <Card className="flex min-h-70 flex-col items-center bg-amortix-frost p-6 text-center" aria-labelledby={titleId}>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amortix-navy text-sm font-mono font-medium text-white ring-4 ring-white">
        {number}
      </div>
      <h3 id={titleId} className="text-lg font-medium text-amortix-navy mb-3">{title}</h3>
      <p className="text-sm leading-7 text-amortix-slate mb-6">{description}</p>
      <div className="mt-auto inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{outcome}</span>
      </div>
    </Card>
  );
}
