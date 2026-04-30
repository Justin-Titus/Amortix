import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { PageBadge } from "@/components/ui/PageBadge";

interface PageHeroProps {
  badge?: { icon: LucideIcon; label: string };
  title: string;
  description?: string;
  stats?: Array<{ label: string; value: string; muted?: boolean; color?: string }>;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHero({ badge, title, description, stats, actions, children }: PageHeroProps) {
  return (
    <div className="glass-panel mb-5 p-4 sm:p-5 md:p-8">
      {badge && <PageBadge icon={badge.icon} label={badge.label} />}

      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="mb-1 text-2xl font-medium tracking-tight text-amortix-navy sm:text-3xl md:text-4xl">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm leading-6 text-amortix-slate md:text-[15px] md:leading-7">{description}</p>
          )}
          {actions && <div className="mt-4 flex w-full flex-wrap items-center gap-2 sm:gap-3">{actions}</div>}
        </div>

        {stats && stats.length > 0 && (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3 sm:justify-end">
            {stats.map((stat, i) => (
              <div key={i} className="min-w-0 rounded-card border border-amortix-border-light bg-amortix-frost px-3 py-2 text-center sm:min-w-26 sm:px-4 sm:py-3">
                <p className="mb-1 whitespace-nowrap text-[10px] font-medium text-amortix-slate uppercase tracking-wider">{stat.label}</p>
                <p className={`text-[16px] font-medium font-mono sm:text-[19px] ${stat.muted ? "text-slate-300" : stat.color ? stat.color : "text-amortix-navy"}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {children && <div className="mt-4 border-t border-slate-100 pt-4 sm:mt-5 sm:pt-5">{children}</div>}
    </div>
  );
}
