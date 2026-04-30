import { SkeletonBlock, SkeletonHero, SkeletonMetricGrid } from "@/components/ui/Skeletons";

export default function LoansLoading() {
  return (
    <div className="space-y-8">
      <SkeletonHero badgeWidth="w-32" titleWidth="w-48" descriptionWidth="w-full max-w-2xl" withActions={true} />
      
      <SkeletonMetricGrid count={4} />

      <SkeletonBlock className="h-16 w-full rounded-xl" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-amortix-border-light bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 w-full">
                <SkeletonBlock className="h-2.5 w-2.5 rounded-full flex-shrink-0" />
                <div className="w-full">
                  <SkeletonBlock className="mb-2 h-5 w-16 rounded-full" />
                  <SkeletonBlock className="mt-3 h-5 w-3/4" />
                  <SkeletonBlock className="mt-1 h-3 w-1/2" />
                </div>
              </div>
              <SkeletonBlock className="h-10 w-10 flex-shrink-0 rounded-2xl" />
            </div>

            <SkeletonBlock className="mb-4 h-1.5 w-full rounded-full" />

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="mt-1 h-4 w-24" />
              </div>
              <div>
                <SkeletonBlock className="h-3 w-12" />
                <SkeletonBlock className="mt-1 h-4 w-16" />
              </div>
              <div>
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="mt-1 h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
