import { Card } from "@/components/ui/Card";

type MetricCardValueColor = "default" | "emerald" | "amber" | "red" | "muted";

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  isEmpty?: boolean;
  valueColor?: MetricCardValueColor;
  onClick?: () => void;
}

const colorMap: Record<MetricCardValueColor, string> = {
  default: "text-amortix-navy",
  emerald: "text-emerald-600",
  amber: "text-amber-500",
  red: "text-red-500",
  muted: "text-slate-300",
};

export function MetricCard({
  label,
  value,
  description,
  isEmpty,
  valueColor = "default",
  onClick,
}: MetricCardProps) {
  const cardContent = (
    <Card
      className={`p-5 min-h-[110px] ${
        onClick ? "cursor-pointer hover:border-amortix-emerald hover:shadow-[0_0_0_3px_rgba(17,140,118,0.08)]" : ""
      }`}
    >
      <p className="mb-2 text-[11px] font-medium tracking-[0.025em] text-amortix-slate uppercase">{label}</p>
      {isEmpty ? (
        <>
          <div className="mb-1.5 h-6 w-20 animate-pulse rounded bg-slate-100" />
          <p className="text-[11px] text-slate-300">{description ?? "Add loans to see this"}</p>
        </>
      ) : (
        <>
          <p className={`mb-1 text-[22px] font-medium font-mono ${colorMap[valueColor]}`}>{value}</p>
          {description ? <p className="text-[11px] leading-snug text-slate-500">{description}</p> : null}
        </>
      )}
    </Card>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}
