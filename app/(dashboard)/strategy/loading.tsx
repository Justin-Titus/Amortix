import { SkeletonBlock, SkeletonHero } from "@/components/ui/Skeletons";

export default function StrategyLoading() {
  return (
    <div className="space-y-8">
      <SkeletonHero badgeWidth="w-36" titleWidth="w-56" descriptionWidth="w-full max-w-2xl" stats={4} withActions={false}>
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

      {/* Strategy Comparison Block */}
      <div className="space-y-6">
        <SkeletonBlock className="h-14 w-full max-w-sm rounded-xl mx-auto" />
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <SkeletonBlock className="h-32 w-full rounded-2xl" />
            <SkeletonBlock className="h-64 w-full rounded-2xl" />
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-6">
              <SkeletonBlock className="h-8 w-40 mb-6" />
              <SkeletonBlock className="h-25 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
