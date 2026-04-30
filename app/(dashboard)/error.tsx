"use client";

import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="animate-fade-up mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <h2 className="text-lg font-heading font-medium text-red-900">Something went wrong</h2>
        <p className="mt-2 text-sm leading-6 text-red-700">
          We could not load this page completely. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
