"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/logger";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { route: "/", boundary: "root" });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Application error
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Something went wrong while loading Amortix.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            The error has been captured for review. You can retry the page or return to the dashboard once the issue is resolved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Try again
            </button>
            <a
              href="/dashboard"
              className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
