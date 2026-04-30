import { SkeletonBlock } from "@/components/ui/Skeletons";

export default function ChatLoading() {
  return (
    <div className="h-full" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading chat...</span>
      <div className="grid h-full gap-6 xl:grid-cols-[320px_minmax(0,1fr)]" aria-hidden="true">
      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="glass-panel space-y-4 p-5">
          <SkeletonBlock className="h-6 w-28 rounded-full" />
          <div>
            <SkeletonBlock className="mb-2 h-8 w-48" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="mt-1 h-4 w-5/6" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-20 w-full rounded-xl" />
            <SkeletonBlock className="h-20 w-full rounded-xl" />
          </div>
        </div>

        <div className="card space-y-3">
          <SkeletonBlock className="h-5 w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
               <SkeletonBlock key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </aside>

      <div className="flex flex-col h-[600px] md:h-[calc(100vh-140px)] rounded-2xl border border-amortix-border-light bg-white overflow-hidden">
        <div className="flex flex-col flex-1 p-4 space-y-6">
           <div className="flex items-start gap-3 w-3/4">
             <SkeletonBlock className="flex-shrink-0 h-8 w-8 rounded-[10px]" />
             <SkeletonBlock className="h-24 w-full rounded-2xl rounded-tl-sm bg-slate-50" />
           </div>
           
           <div className="flex items-start gap-3 w-2/3 self-end flex-row-reverse">
             <SkeletonBlock className="flex-shrink-0 h-8 w-8 rounded-full" />
             <SkeletonBlock className="h-12 w-full rounded-2xl rounded-tr-sm bg-amortix-emerald/10" />
           </div>
           
           <div className="flex items-start gap-3 w-4/5">
             <SkeletonBlock className="flex-shrink-0 h-8 w-8 rounded-[10px]" />
             <SkeletonBlock className="h-32 w-full rounded-2xl rounded-tl-sm bg-slate-50" />
           </div>
        </div>
        
        <div className="border-t border-slate-100 p-4 bg-white">
          <div className="w-full flex items-center gap-3">
             <SkeletonBlock className="h-12 flex-1 rounded-[var(--radius-button)]" />
             <SkeletonBlock className="h-10 w-10 rounded-[var(--radius-button)]" />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
