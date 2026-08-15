"use client";

/**
 * PostHog Analytics — client-side event tracking.
 * Free tier: 1,000,000 events/month.
 *
 * Usage:
 *   import { analytics } from "@/lib/analytics";
 *   analytics.track("loan_created", { loanType: "HOME", currency: "INR" });
 */

import { isConsentGranted } from "@/lib/consent";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

// Lazy-loaded PostHog instance
let posthogLib: typeof import("posthog-js").default | null = null;

async function getPostHog() {
  if (!POSTHOG_KEY || process.env.NODE_ENV !== "production") return null;
  if (!isConsentGranted("analytics")) return null;

  if (!posthogLib) {
    const { default: posthog } = await import("posthog-js");
    if (!posthog.__loaded) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // We capture manually for SPA correctness
        capture_pageleave: true,
        persistence: "localStorage",
        // Privacy: don't capture IPs or session recordings by default
        disable_session_recording: true,
        sanitize_properties: (properties) => {
          // Strip any accidental PII fields
          delete properties.$email;
          delete properties.email;
          return properties;
        },
      });
    }
    posthogLib = posthog;
  }

  return posthogLib;
}

// ─────────────────────────────────────────────
// Typed event catalog — keeps tracking consistent
// ─────────────────────────────────────────────

export type AnalyticsEvent =
  | { name: "loan_created"; props: { loanType: string; currency: string } }
  | { name: "loan_deleted"; props: { loanType: string } }
  | { name: "payment_recorded"; props: { type: "EMI" | "PREPAYMENT"; amount: number } }
  | { name: "strategy_compared"; props: { extraBudget: number; strategy: string } }
  | { name: "chat_message_sent"; props: { messageCount: number } }
  | { name: "onboarding_step_completed"; props: { step: string } }
  | { name: "milestone_hit"; props: { milestone: string; loanType: string } }
  | { name: "page_viewed"; props: { path: string } };

export const analytics = {
  async identify(userId: string) {
    const ph = await getPostHog();
    ph?.identify(userId);
  },

  async track<E extends AnalyticsEvent>(
    event: E["name"],
    props: Extract<AnalyticsEvent, { name: E["name"] }>["props"]
  ) {
    const ph = await getPostHog();
    ph?.capture(event, props);
  },

  async page(path: string) {
    const ph = await getPostHog();
    ph?.capture("$pageview", { $current_url: path });
  },

  async reset() {
    const ph = await getPostHog();
    ph?.reset();
  },
};
