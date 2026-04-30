import { SkeletonBlock } from "@/components/ui/Skeletons";

export default function CalendarLoading() {
  return (
    <div className="card h-[calc(100vh-200px)] min-h-[600px] flex flex-col p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <SkeletonBlock className="h-8 w-40" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-10" />
          <SkeletonBlock className="h-8 w-10" />
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="py-2 text-center">
            <SkeletonBlock className="mx-auto h-4 w-8" />
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-slate-100 gap-[1px]">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="bg-white p-2 flex flex-col gap-2">
            <SkeletonBlock className="h-4 w-6 self-end" />
            {i % 4 === 0 && <SkeletonBlock className="h-5 w-full rounded" />}
            {i % 7 === 2 && <SkeletonBlock className="h-5 w-3/4 rounded" />}
          </div>
        ))}
      </div>
    </div>
  );
}
