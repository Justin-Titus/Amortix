import { SkeletonBlock, SkeletonHero, SkeletonLine } from "@/components/ui/Skeletons";

export default function ProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-3" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading profile...</span>
      <SkeletonHero badgeWidth="w-32" titleWidth="w-48" descriptionWidth="w-full max-w-xl" />

      <div className="space-y-4">
        {/* Account Section Skeleton */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <SkeletonLine className="h-4 w-20 mb-1" />
            <SkeletonLine className="h-3 w-32" />
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            <SkeletonBlock className="h-12 w-12 rounded-full flex-shrink-0" />
            <div>
              <SkeletonLine className="h-4 w-40 mb-2" />
              <SkeletonLine className="h-3 w-48" />
            </div>
          </div>
        </div>

        {/* Financial Profile Section Skeleton */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <SkeletonLine className="h-4 w-32 mb-1" />
            <SkeletonLine className="h-3 w-48" />
          </div>
          <div className="px-6 py-5 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <SkeletonLine className="h-4 w-28" />
                 <SkeletonBlock className="h-10 w-full rounded-[var(--radius-button)]" />
               </div>
               <div className="space-y-2">
                 <SkeletonLine className="h-4 w-32" />
                 <SkeletonBlock className="h-10 w-full rounded-[var(--radius-button)]" />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <SkeletonLine className="h-4 w-24" />
                 <SkeletonBlock className="h-10 w-full rounded-[var(--radius-button)]" />
               </div>
               <div className="space-y-2">
                 <SkeletonLine className="h-4 w-32" />
                 <SkeletonBlock className="h-10 w-full rounded-[var(--radius-button)]" />
               </div>
             </div>

             <div className="flex gap-3">
               <SkeletonBlock className="h-10 w-24 rounded-[var(--radius-button)]" />
               <SkeletonBlock className="h-10 w-24 rounded-[var(--radius-button)]" />
             </div>
          </div>
        </div>

        {/* Account actions Section Skeleton */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <SkeletonLine className="h-4 w-32 mb-1" />
            <SkeletonLine className="h-3 w-48" />
          </div>
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <SkeletonLine className="h-4 w-20 mb-2" />
              <SkeletonLine className="h-3 w-48" />
            </div>
            <SkeletonBlock className="h-8 w-20 rounded-lg" />
          </div>
        </div>

      </div>
    </div>
  );
}
