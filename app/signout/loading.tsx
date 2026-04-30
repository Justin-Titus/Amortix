export default function Loading() {
  return (
    <main className="min-h-screen animate-fade-up bg-slate-950 px-4 py-12 text-white" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading...</span>
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" aria-hidden="true" />
          <span>Signing out...</span>
        </div>
      </div>
    </main>
  );
}
