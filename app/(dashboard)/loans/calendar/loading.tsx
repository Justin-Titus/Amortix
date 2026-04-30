export default function Loading() {
  return (
    <div className="animate-fade-up rounded-2xl border border-[var(--color-border)] bg-white p-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading...</span>
      <div className="h-8 w-52 animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-3 h-4 w-2/3 animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}
