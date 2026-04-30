import type { ReactNode } from "react";

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
  badgeWidth = "w-36",
  titleWidth = "w-72",
  descriptionWidth = "w-3/4",
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
    <div className="glass-panel space-y-4 p-6 md:p-8">
      <SkeletonLine className={`h-6 ${badgeWidth}`} />
      <SkeletonLine className={`h-10 ${titleWidth}`} />
      <SkeletonLine className={`h-4 ${descriptionWidth}`} />

      {withActions ? (
        <div className="flex flex-wrap gap-3 pt-1">
          <SkeletonBlock className="h-11 w-40 rounded-[var(--radius-button)]" />
          <SkeletonBlock className="h-11 w-32 rounded-[var(--radius-button)]" />
        </div>
      ) : null}

      {stats > 0 ? (
        <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
          {Array.from({ length: stats }).map((_, index) => (
            <div key={index} className="rounded-[var(--radius-card)] border border-amortix-border-light bg-amortix-frost px-4 py-3">
              <SkeletonLine className="mb-2 h-2.5 w-16" />
              <SkeletonBlock className="h-7 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      ) : null}

      {children}
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
    <div className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="metric-card space-y-3">
          <SkeletonLine className="h-2.5 w-24" />
          <SkeletonBlock className="h-7 w-28 rounded-lg" />
          <SkeletonLine className="h-2.5 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonLoanDetails() {
  return (
    <div className="animate-fade-up max-w-6xl mx-auto space-y-8">
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
    <div className="animate-fade-up max-w-4xl mx-auto space-y-6">
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
