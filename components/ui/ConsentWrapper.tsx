"use client";

/**
 * ConsentWrapper — gates non-essential trackers behind analytics consent.
 * Renders children (PostHogPageView, Analytics, SpeedInsights) only when
 * the user has granted analytics consent.
 */

import { useState, useEffect } from "react";
import { isConsentGranted } from "@/lib/consent";

export function ConsentWrapper({ children }: { children: React.ReactNode }) {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    // Initial read
    setAnalyticsAllowed(isConsentGranted("analytics"));

    // React to subsequent changes (e.g. user updates consent in banner)
    const handler = () => {
      setAnalyticsAllowed(isConsentGranted("analytics"));
    };
    window.addEventListener("amortix:consent-changed", handler);
    return () => window.removeEventListener("amortix:consent-changed", handler);
  }, []);

  if (!analyticsAllowed) return null;
  return <>{children}</>;
}
