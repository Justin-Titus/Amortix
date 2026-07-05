"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";

/**
 * Wires PostHog page view tracking to Next.js App Router navigation.
 * Place this inside a <Suspense> boundary in the root layout because
 * useSearchParams() requires it.
 */
export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = pathname;
      if (searchParams?.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      analytics.page(url);
    }
  }, [pathname, searchParams]);

  return null;
}
