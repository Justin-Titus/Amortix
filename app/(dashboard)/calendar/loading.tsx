import { SkeletonBlock, SkeletonHero, SkeletonLine } from "@/components/ui/Skeletons";

export default function CalendarLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-3">
      <SkeletonHero badgeWidth="w-32" titleWidth="w-48" descriptionWidth="w-full max-w-lg" stats={2} withActions={false} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          {/* CalendarControls Skeleton */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <SkeletonBlock className="h-8 w-40 rounded-lg" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-8 w-10 rounded-lg" />
              <SkeletonBlock className="h-8 w-10 rounded-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="py-2 text-center sm:py-3">
                <SkeletonLine className="mx-auto h-3 w-8" />
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 border-b border-r border-slate-50 p-1.5 sm:h-20 sm:p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1">
                  <SkeletonBlock className="h-5 w-5 rounded-full" />
                  <SkeletonBlock className="h-2 w-6 rounded-full" />
                </div>
                <div className="mt-1 flex flex-col gap-0.5 sm:mt-2 sm:flex-row sm:items-center sm:justify-between">
                  <SkeletonLine className="h-2.5 w-8" />
                  <SkeletonLine className="h-2.5 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5">
            <SkeletonLine className="mb-2 h-5 w-32" />
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="mt-1 h-4 w-2/3" />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
            <SkeletonLine className="mb-3 h-5 w-32" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                  <div className="space-y-1">
                    <SkeletonLine className="h-4 w-24" />
                    <SkeletonLine className="h-3 w-16" />
                  </div>
                  <SkeletonBlock className="h-5 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
