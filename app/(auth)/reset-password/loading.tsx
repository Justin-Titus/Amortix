export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-105 animate-fade-up space-y-5" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading...</span>
      <div className="space-y-3 text-center" aria-hidden="true">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-white" />
        <div className="mx-auto h-9 w-60 animate-pulse rounded-2xl bg-white" />
        <div className="mx-auto h-4 w-64 animate-pulse rounded-lg bg-white" />
      </div>

      <div className="card space-y-4" aria-hidden="true">
        <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-11 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
