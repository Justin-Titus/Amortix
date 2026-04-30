import type { LucideIcon } from "lucide-react";

interface StrategyOptionButtonProps {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function StrategyOptionButton({
  id,
  name,
  desc,
  icon: Icon,
  isActive,
  onClick,
}: StrategyOptionButtonProps) {
  return (
    <button
      data-id={id}
      onClick={onClick}
      className={`w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
        isActive
          ? "border-amortix-emerald bg-emerald-50 ring-1 ring-amortix-emerald"
          : "border-amortix-border-light hover:border-amortix-emerald-light hover:bg-emerald-50/50"
      }`}
    >
      <div
        className={`mt-0.5 rounded-full p-2 ${
          isActive ? "bg-amortix-emerald text-white" : "bg-amortix-frost text-amortix-slate"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3
          className={`text-sm font-medium ${
            isActive ? "text-amortix-emerald-dark" : "text-amortix-navy"
          }`}
        >
          {name}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-amortix-slate">{desc}</p>
      </div>
    </button>
  );
}
