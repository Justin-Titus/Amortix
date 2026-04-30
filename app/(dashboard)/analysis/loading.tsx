import { SkeletonBlock, SkeletonHero } from "@/components/ui/Skeletons";

export default function AnalysisLoading() {
  return (
    <div className="space-y-8">
      <SkeletonHero badgeWidth="w-32" titleWidth="w-48" descriptionWidth="w-full max-w-xl" stats={4} withActions={false} />

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <div className="card space-y-6">
            <SkeletonBlock className="h-6 w-32" />
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 w-16" />
                </div>
                <SkeletonBlock className="h-2 w-full rounded-full" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 w-16" />
                </div>
                <SkeletonBlock className="h-2 w-full rounded-full" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between mb-2">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
              <SkeletonBlock className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="h-8 w-32 rounded-lg" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="card p-4">
                 <SkeletonBlock className="h-3 w-16 mb-2" />
                 <SkeletonBlock className="h-6 w-24" />
               </div>
             ))}
          </div>

          <SkeletonBlock className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
}
