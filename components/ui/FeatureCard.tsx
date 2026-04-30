import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  Icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  className?: string;
};

import { Card } from "@/components/ui/Card";

export default function FeatureCard({
  Icon,
  title,
  description,
  iconBg,
  iconColor,
  className = "",
}: FeatureCardProps) {
  return (
    <Card className={className}>
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg} ${iconColor} ml-6 mt-6`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="px-6 pb-6">
        <h3 className="text-lg font-medium text-amortix-navy mb-2">{title}</h3>
        <p className="text-sm leading-7 text-amortix-slate">{description}</p>
      </div>
    </Card>
  );
}
