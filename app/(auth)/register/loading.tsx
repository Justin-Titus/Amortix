export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-105 animate-fade-up space-y-5">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-white" />
        <div className="mx-auto h-9 w-64 animate-pulse rounded-2xl bg-white" />
        <div className="mx-auto h-4 w-72 animate-pulse rounded-lg bg-white" />
      </div>

      <div className="card space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />
        ))}
        <div className="h-11 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
