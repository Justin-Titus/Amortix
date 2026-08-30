import { SkeletonBlock, SkeletonHero, SkeletonMetricGrid, SkeletonLine } from "@/components/ui/Skeletons";

export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 pb-3" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading workspace...</span>
      
      {/* Workspace Hero */}
      <SkeletonHero badgeWidth="w-32" titleWidth="w-48" descriptionWidth="w-full max-w-xl" stats={4} />

      {/* Metrics Grid */}
      <SkeletonMetricGrid count={4} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">
        {/* Main Column - Shared Loans Placeholder */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <SkeletonLine className="h-4 w-28 mb-2" />
                <SkeletonLine className="h-3 w-48" />
              </div>
              <SkeletonLine className="h-4 w-32" />
            </div>

            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-amortix-border-light bg-slate-50/50 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <SkeletonLine className="h-4 w-40" />
                    <SkeletonBlock className="h-5 w-16 rounded-full" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100">
                    <div className="space-y-1.5">
                      <SkeletonLine className="h-2 w-12" />
                      <SkeletonLine className="h-3 w-20" />
                    </div>
                    <div className="space-y-1.5">
                      <SkeletonLine className="h-2 w-16" />
                      <SkeletonLine className="h-3 w-16" />
                    </div>
                    <div className="space-y-1.5">
                      <SkeletonLine className="h-2 w-16" />
                      <SkeletonLine className="h-3 w-10" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <SkeletonLine className="h-2 w-24" />
                      <SkeletonLine className="h-2 w-8" />
                    </div>
                    <SkeletonBlock className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column - Members & Invite Placeholders */}
        <div className="space-y-6">
          {/* Members Card */}
          <div className="card p-5 space-y-4">
            <div>
              <SkeletonLine className="h-4 w-24 mb-2" />
              <SkeletonLine className="h-3 w-40" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBlock className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonLine className="h-3.5 w-24" />
                    <SkeletonLine className="h-2.5 w-32" />
                  </div>
                  <SkeletonBlock className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Invite Partner Card */}
          <div className="card p-5 space-y-4">
            <div>
              <SkeletonLine className="h-4 w-24 mb-2" />
              <SkeletonLine className="h-3 w-40" />
            </div>
            <div className="space-y-3">
              <SkeletonBlock className="h-10 w-full rounded-lg" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
