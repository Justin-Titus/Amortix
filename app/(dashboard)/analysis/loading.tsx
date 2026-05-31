import { SkeletonBlock, SkeletonHero, SkeletonMetricGrid, SkeletonList } from "@/components/ui/Skeletons";

export default function AnalysisLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero badgeWidth="w-24" titleWidth="w-48" descriptionWidth="w-full max-w-xl" stats={0} withActions={false} />

      <SkeletonMetricGrid count={4} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card h-fit space-y-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="h-3 w-64" />
          </div>
          <SkeletonList count={4} />
          <div className="flex items-center justify-between border-t border-amortix-border-light pt-4 mt-2">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-6 w-24" />
          </div>
        </div>

        <div className="card h-fit space-y-4">
          <SkeletonBlock className="h-6 w-36 mb-4" />
          <SkeletonList count={6} />
        </div>
      </div>
    </div>
  );
}
