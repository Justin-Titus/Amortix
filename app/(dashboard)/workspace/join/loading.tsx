import { SkeletonBlock, SkeletonLine } from "@/components/ui/Skeletons";

export default function JoinWorkspaceLoading() {
  return (
    <div className="mx-auto max-w-md mt-16 card p-6 md:p-8 space-y-6 text-center shadow-xl border border-slate-100" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading invitation details...</span>

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50/50">
        <SkeletonBlock className="h-6 w-6 rounded-md" />
      </div>

      <div className="space-y-3 flex flex-col items-center">
        <SkeletonLine className="h-5 w-40" />
        <SkeletonLine className="h-3.5 w-full" />
        <SkeletonLine className="h-3.5 w-3/4" />
      </div>

      <SkeletonBlock className="h-16 w-full rounded-xl" />

      <div className="flex gap-3 justify-center">
        <SkeletonBlock className="h-10 w-28 rounded-lg" />
        <SkeletonBlock className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
