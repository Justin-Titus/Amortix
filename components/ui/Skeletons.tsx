import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-[var(--radius-button)] bg-amortix-frost ${className}`} />;
}

export function SkeletonLine({ className = "" }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-full bg-amortix-frost ${className}`} />;
}

export function SkeletonHero({
  badgeWidth = "w-32",
  titleWidth = "w-64",
  descriptionWidth = "w-3/4 max-w-2xl",
  stats = 0,
  withActions = true,
  children,
}: {
  badgeWidth?: string;
  titleWidth?: string;
  descriptionWidth?: string;
  stats?: number;
  withActions?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="glass-panel mb-5 p-4 sm:p-5 md:p-8">
      <SkeletonLine className={`mb-4 h-6 ${badgeWidth}`} />

      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:gap-6">
        <div className="flex-1 min-w-0 w-full space-y-3">
          <SkeletonLine className={`h-8 sm:h-9 md:h-10 ${titleWidth}`} />
          <SkeletonLine className={`h-4 ${descriptionWidth}`} />
          
          {withActions && (
            <div className="mt-4 flex w-full flex-wrap items-center gap-2 sm:gap-3">
              <SkeletonBlock className="h-10 w-28 rounded-md" />
              <SkeletonBlock className="h-10 w-32 rounded-md" />
            </div>
          )}
        </div>

        {stats > 0 && (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3 sm:justify-end">
            {Array.from({ length: stats }).map((_, i) => (
              <div key={i} className="min-w-0 rounded-card border border-amortix-border-light bg-amortix-frost px-3 py-2 text-center sm:min-w-26 sm:px-4 sm:py-3 space-y-2">
                <SkeletonLine className="mx-auto h-2.5 w-16" />
                <SkeletonBlock className="mx-auto h-6 w-20 sm:h-7 rounded-md" />
              </div>
            ))}
          </div>
        )}
      </div>
      {children && <div className="mt-4 border-t border-slate-100 pt-4 sm:mt-5 sm:pt-5">{children}</div>}
    </div>
  );
}

export function SkeletonMetricGrid({
  count = 4,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-5 min-h-[110px] space-y-3">
          <SkeletonLine className="h-2.5 w-24" />
          <SkeletonBlock className="h-7 w-28 rounded-lg" />
          <SkeletonLine className="h-2.5 w-3/4" />
        </Card>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-amortix-border-light">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
          <div className="space-y-2 w-1/2">
            <SkeletonLine className="h-3.5 w-32" />
            <SkeletonLine className="h-2.5 w-24" />
          </div>
          <div className="space-y-2 w-1/3 flex flex-col items-end">
            <SkeletonLine className="h-3.5 w-20" />
            <SkeletonLine className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonLoanDetails() {
  return (
    <div className="animate-fade-up max-w-6xl mx-auto space-y-8 pb-3">
      <div className="flex items-center justify-between gap-4 p-4">
        <SkeletonLine className="h-5 w-32" />
        <SkeletonBlock className="h-9 w-24 rounded-lg" />
      </div>

      <div className="glass-panel p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_minmax(220px,auto)]">
          <div className="space-y-4">
            <SkeletonLine className="h-6 w-24" />
            <SkeletonLine className="h-10 w-64 md:w-96" />
            <SkeletonLine className="h-4 w-40" />
            <SkeletonBlock className="h-8 w-32 rounded-full" />
          </div>
          <div className="section-block min-w-60 p-5 bg-amortix-frost">
            <SkeletonLine className="h-2.5 w-24 mb-3" />
            <SkeletonBlock className="h-8 w-32 rounded-lg mb-6" />
            <div className="space-y-2 border-t border-amortix-border-light pt-4">
              <div className="flex justify-between">
                <SkeletonLine className="h-2 w-16" />
                <SkeletonLine className="h-2 w-8" />
              </div>
              <SkeletonBlock className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="section-block p-5 space-y-4">
            <SkeletonLine className="h-3 w-20" />
            <SkeletonBlock className="h-7 w-28 rounded-lg" />
            <SkeletonLine className="h-3 w-40 border-t border-amortix-border-light pt-3" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          <SkeletonBlock className="h-48 w-full rounded-2xl md:h-56" />
          
          <div className="space-y-3">
            <SkeletonLine className="h-3.5 w-48" />
            <SkeletonBlock className="h-64 w-full rounded-2xl" />
          </div>

          <div className="space-y-3">
            <SkeletonLine className="h-3.5 w-32" />
            <SkeletonBlock className="h-72 w-full rounded-2xl" />
          </div>
        </div>
        <div className="space-y-5">
          <SkeletonBlock className="h-[420px] w-full rounded-2xl" />
          <SkeletonBlock className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonLoanForm() {
  return (
    <div className="animate-fade-up max-w-4xl mx-auto space-y-6 pb-3">
      <div className="pb-2">
        <SkeletonLine className="h-5 w-40" />
      </div>
      
      <div className="glass-panel p-6 shadow-sm">
        <div className="mb-8">
          <SkeletonLine className="h-2.5 w-24 mb-2" />
          <SkeletonLine className="h-7 w-48 mb-2" />
          <SkeletonLine className="h-4 w-3/4" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <SkeletonLine className="h-3 w-32" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
        </div>

        <div className="flex justify-end gap-3 pt-8">
          <SkeletonBlock className="h-10 w-24 rounded-lg" />
          <SkeletonBlock className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardGrid({
  count,
  className = "",
  cardClassName = "",
}: {
  count: number;
  className?: string;
  cardClassName?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`card space-y-3 ${cardClassName}`}>
          <SkeletonLine className="h-4 w-24" />
          <SkeletonBlock className="h-6 w-2/3 rounded-lg" />
          <SkeletonLine className="h-3 w-1/2" />
          <SkeletonBlock className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
