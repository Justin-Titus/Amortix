import { SkeletonBlock, SkeletonHero, SkeletonMetricGrid, SkeletonLine, SkeletonList } from "@/components/ui/Skeletons";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero badgeWidth="w-40" titleWidth="w-64" descriptionWidth="w-full max-w-2xl" stats={4} />
      
      <section>
        <SkeletonMetricGrid count={4} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:gap-5">
        <div className="space-y-4">
          {/* Health Trend Chart Placeholder */}
          <div className="glass-panel p-5">
            <SkeletonLine className="mb-2 h-4 w-32" />
            <SkeletonLine className="mb-4 h-3 w-48" />
            <SkeletonBlock className="h-64 w-full rounded-[var(--radius-card)]" />
          </div>

          {/* Active Loans List Placeholder */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <SkeletonLine className="mb-2 h-4 w-24" />
                <SkeletonLine className="h-3 w-48" />
              </div>
              <SkeletonLine className="h-4 w-16" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-card border border-amortix-border-light bg-white/80 p-3 shadow-[0_12px_28px_rgba(9,17,31,0.05)]">
                  <div className="mb-2 flex justify-between">
                    <SkeletonLine className="h-4 w-32" />
                    <SkeletonBlock className="h-5 w-12 rounded-full" />
                  </div>
                  <div className="mb-3 flex justify-between">
                    <SkeletonLine className="h-3 w-20" />
                    <SkeletonLine className="h-3 w-20" />
                  </div>
                  <SkeletonBlock className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight Placeholder */}
          <div className="glass-panel p-5 flex items-start gap-4">
            <SkeletonBlock className="h-10 w-10 flex-shrink-0 rounded-2xl" />
            <div className="w-full space-y-3">
              <SkeletonLine className="h-4 w-24" />
              <SkeletonLine className="h-12 w-full" />
            </div>
          </div>
          
          {/* Analysis Workspace Card Placeholder */}
          <div className="card flex items-start gap-3">
            <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            <div className="w-full space-y-3">
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="h-10 w-full" />
              <SkeletonLine className="h-4 w-24" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Affordability Gauge Placeholder */}
          <div className="card space-y-4">
            <div>
              <SkeletonLine className="mb-2 h-4 w-32" />
              <SkeletonLine className="h-3 w-48" />
            </div>
            <div className="flex justify-center py-4">
              <SkeletonBlock className="h-32 w-32 rounded-full border-[8px] border-amortix-frost bg-transparent" />
            </div>
            <div className="space-y-3 pt-2 divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between py-2">
                  <SkeletonLine className="h-3 w-24" />
                  <SkeletonLine className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Debt Distribution Chart Placeholder */}
          <div className="card space-y-4">
            <div>
              <SkeletonLine className="mb-2 h-4 w-32" />
              <SkeletonLine className="h-3 w-40" />
            </div>
            <div className="flex justify-center py-4">
              <SkeletonBlock className="h-40 w-40 rounded-full border-[12px] border-amortix-frost bg-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
