import { Loader2 } from "lucide-react";
import { SkeletonBlock, SkeletonCardGrid, SkeletonMetricGrid } from "@/components/ui/Skeletons";

interface DashboardRouteLoadingProps {
  title?: string;
  description?: string;
}

export default function DashboardRouteLoading({
  title = "Loading your dashboard",
  description = "Pulling the latest balances, trends, and repayment signals.",
}: DashboardRouteLoadingProps) {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="glass-panel p-6 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-amortix-border-light bg-white px-3 py-1 text-xs text-amortix-slate" role="status" aria-live="polite">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amortix-emerald" aria-label="Loading" />
          Syncing data
        </div>
        <h1 className="mt-4 text-3xl font-medium text-amortix-navy md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm leading-7 text-amortix-slate">{description}</p>
      </div>

      <SkeletonMetricGrid />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-4">
          <SkeletonBlock className="h-5 w-40 rounded-lg" />
          <SkeletonBlock className="h-56 rounded-2xl" />
        </div>
        <div className="card space-y-4">
          <SkeletonBlock className="h-5 w-32 rounded-lg" />
          <SkeletonCardGrid count={2} className="space-y-4" cardClassName="h-28" />
        </div>
      </div>
    </div>
  );
}
