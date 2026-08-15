import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

export default function ForgotPasswordLoading() {
  return (
    <AuthSplitLayout>
      <div className="mx-auto w-full max-w-[440px] animate-fade-up" role="status" aria-label="Loading forgot password form">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/70 bg-white/75 shadow-[0_18px_30px_rgba(9,17,31,0.08)] overflow-hidden">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
          </div>
          <div className="mx-auto mb-3 h-8 w-60 animate-pulse rounded-xl bg-slate-200" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded-lg bg-slate-100" />
        </div>

        <div className="glass-panel p-8 space-y-6">
          <div className="space-y-2">
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-13 w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div className="h-13 w-full animate-pulse rounded-2xl bg-amortix-navy/80" />

          <div className="mx-auto h-4 w-32 animate-pulse rounded bg-slate-100 mt-6" />
        </div>
      </div>
    </AuthSplitLayout>
  );
}
