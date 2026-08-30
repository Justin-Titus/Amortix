import { SkeletonBlock, SkeletonHero, SkeletonLine } from "@/components/ui/Skeletons";

export default function StrategyLoading() {
  return (
    <div className="space-y-8 pb-3">
      <SkeletonHero badgeWidth="w-36" titleWidth="w-56" descriptionWidth="w-full max-w-2xl" stats={0} withActions={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 border-t border-slate-100/60 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-2">
              <SkeletonBlock className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 w-full">
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonHero>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:gap-8 xl:grid-cols-[360px_minmax(0,1.25fr)]">
        <div className="space-y-6">
          {/* EMI Optimizer Panel Skeleton */}
          <div className="section-block p-5 space-y-5">
            <SkeletonLine className="h-5 w-40 mb-2" />
            <div className="space-y-3">
              <SkeletonLine className="h-3 w-full" />
              <SkeletonLine className="h-3 w-3/4" />
            </div>
            <SkeletonBlock className="h-10 w-full rounded-lg" />
            <SkeletonBlock className="h-10 w-full rounded-lg" />
            <SkeletonBlock className="h-24 w-full rounded-lg" />
          </div>

          {/* Select Strategy Skeleton */}
          <div className="section-block p-5 space-y-4">
            <SkeletonLine className="h-5 w-32" />
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="section-block p-5 space-y-2">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonBlock className="h-8 w-20 rounded-md" />
                <SkeletonLine className="h-3 w-32" />
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="section-block p-5">
            <div className="mb-6">
              <SkeletonLine className="h-6 w-48" />
            </div>
            <SkeletonBlock className="h-72 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Amortization Table Skeleton */}
      <div className="section-block p-5 space-y-4">
        <SkeletonLine className="h-6 w-40" />
        <div className="space-y-2">
          <SkeletonBlock className="h-10 w-full rounded-md" />
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonLine key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
