import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-amortix-frost flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-[32px] font-heading font-semibold text-amortix-navy">404 — Page not found</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              The page you are looking for does not exist or has been moved. Use one of the links below to continue.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Back to home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
