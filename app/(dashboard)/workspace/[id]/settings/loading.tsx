import { SkeletonBlock, SkeletonHero, SkeletonLine } from "@/components/ui/Skeletons";

export default function WorkspaceSettingsLoading() {
  return (
    <div className="space-y-6 pb-3" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading settings...</span>

      <div className="flex items-center">
        <SkeletonLine className="h-4 w-48" />
      </div>

      <SkeletonHero badgeWidth="w-36" titleWidth="w-40" descriptionWidth="w-full max-w-xl" withActions={false} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left/Middle Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rename Workspace */}
          <div className="card p-6 space-y-4">
            <div>
              <SkeletonLine className="h-4 w-28 mb-2" />
              <SkeletonLine className="h-3 w-48" />
            </div>
            <SkeletonBlock className="h-10 w-full rounded-lg" />
          </div>

          {/* Manage Shared Loans */}
          <div className="card p-6 space-y-4">
            <div>
              <SkeletonLine className="h-4 w-36 mb-2" />
              <SkeletonLine className="h-3 w-64" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                  <div className="space-y-1.5 w-1/2">
                    <SkeletonLine className="h-3.5 w-32" />
                    <SkeletonLine className="h-2.5 w-24" />
                  </div>
                  <SkeletonBlock className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Members */}
          <div className="card p-5 space-y-4">
            <div>
              <SkeletonLine className="h-4 w-24 mb-2" />
              <SkeletonLine className="h-3 w-40" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
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
        </div>
      </div>
    </div>
  );
}
