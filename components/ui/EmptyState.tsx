import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  variant?: "default" | "compact";
}

export function EmptyState({ icon, title, description, action, variant = "default" }: EmptyStateProps) {
  const padding = variant === "compact" ? "py-10" : "py-16";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${padding} px-8`}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amortix-frost">
          {icon}
        </div>
      )}
      <h3 className="mb-1.5 text-[15px] font-medium text-amortix-navy">{title}</h3>
      <p className="mb-5 max-w-sm text-[13px] leading-relaxed text-amortix-slate">{description}</p>
      {action &&
        (action.href ? (
          <Link href={action.href} className="btn-primary inline-flex">
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="btn-primary inline-flex"
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
