"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            System crash
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            A critical system error occurred.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            This issue has been captured and reported. You can try refreshing the application to restore service.
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
              href="/"
              className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
            >
              Reload application
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
