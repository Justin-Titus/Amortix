import { SkeletonBlock, SkeletonLine } from "@/components/ui/Skeletons";

export default function GlossaryLoading() {
  return (
    <div className="space-y-8">
      <div className="glass-panel p-6">
        <div className="max-w-3xl">
          <SkeletonBlock className="h-6 w-40 rounded-full mb-5" />
          <SkeletonLine className="h-10 w-48 mb-3" />
          <SkeletonLine className="h-4 w-3/4" />
        </div>
      </div>

      <div className="space-y-8">
        {[1, 2, 3, 4].map((group) => (
          <div key={group} className="space-y-4">
            <div className="flex items-center gap-2">
               <SkeletonBlock className="h-5 w-5 rounded" />
               <SkeletonLine className="h-6 w-40" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="card p-5">
                  <SkeletonLine className="h-5 w-32 mb-3" />
                  <SkeletonLine className="h-4 w-full mb-2" />
                  <SkeletonLine className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
