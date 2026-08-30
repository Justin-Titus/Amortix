import { SkeletonBlock, SkeletonHero, SkeletonLine } from "@/components/ui/Skeletons";

export default function InsightsLoading() {
  return (
    <div className="space-y-8 pb-3">
      <SkeletonHero badgeWidth="w-40" titleWidth="w-32" descriptionWidth="w-full max-w-xl" stats={3} withActions={false} />

      <section className="space-y-3">
        <SkeletonLine className="h-6 w-48 mb-3" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
             <div key={i} className="card p-5">
               <div className="flex items-center justify-between gap-2 mb-3">
                 <SkeletonLine className="h-4 w-24" />
                 <SkeletonBlock className="h-5 w-16 rounded-full" />
               </div>
               <SkeletonBlock className="h-8 w-16 mb-2 rounded-md" />
               <SkeletonLine className="h-3 w-20 mb-4" />
               <SkeletonLine className="h-3 w-full" />
               <SkeletonLine className="mt-1 h-3 w-5/6" />
             </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SkeletonLine className="h-6 w-48 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 flex items-start justify-between gap-4">
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <SkeletonBlock className="h-4 w-4 rounded" />
                  <SkeletonLine className="h-4 w-32" />
                </div>
                <SkeletonLine className="mt-1 h-3 w-2/3" />
              </div>
              <SkeletonBlock className="h-6 w-24 flex-shrink-0 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
