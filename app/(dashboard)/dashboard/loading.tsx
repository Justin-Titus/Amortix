import { SkeletonBlock, SkeletonHero, SkeletonMetricGrid } from "@/components/ui/Skeletons";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero badgeWidth="w-40" titleWidth="w-64" descriptionWidth="w-full max-w-2xl" stats={4} />
      
      <section>
        <SkeletonMetricGrid count={4} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-4">
          {/* Health Trend Chart Placeholder */}
          <div className="glass-panel p-5">
            <SkeletonBlock className="mb-2 h-4 w-32" />
            <SkeletonBlock className="mb-4 h-3 w-48" />
            <SkeletonBlock className="h-64 w-full" />
          </div>

          {/* Active Loans List Placeholder */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <SkeletonBlock className="mb-1 h-4 w-24" />
                <SkeletonBlock className="h-3 w-48" />
              </div>
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[var(--radius-card)] border border-amortix-border-light bg-white/80 p-3">
                  <div className="mb-2 flex justify-between">
                    <SkeletonBlock className="h-4 w-32" />
                    <SkeletonBlock className="h-5 w-12 rounded-full" />
                  </div>
                  <div className="mb-3 flex justify-between">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-3 w-20" />
                  </div>
                  <SkeletonBlock className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight Placeholder */}
          <div className="glass-panel p-5">
            <div className="flex gap-4">
              <SkeletonBlock className="h-10 w-10 flex-shrink-0 rounded-xl" />
              <div className="w-full space-y-2">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Affordability Gauge Placeholder */}
          <div className="card space-y-4">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-48" />
            <div className="flex justify-center py-4">
              <SkeletonBlock className="h-32 w-32 rounded-full" />
            </div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Interest Leak Placeholder */}
          <div className="card space-y-4">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3 w-56" />
            <SkeletonBlock className="h-24 w-full" />
          </div>

          {/* Momentum Chart Placeholder */}
          <div className="card space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
              <SkeletonBlock className="h-5 w-16" />
            </div>
            <SkeletonBlock className="mt-4 h-44 w-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
