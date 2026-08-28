"use client";

import { recordUserConsent } from "@/app/actions/consent";

/**
 * Amortix Consent Management
 *
 * Stores per-purpose consent decisions in localStorage.
 * The server-side ConsentRecord table is the authoritative audit trail;
 * localStorage is used for fast, synchronous reads on the client.
 *
 * Purposes:
 *   analytics   — PostHog page view / event tracking, Vercel Analytics, Speed Insights
 *   functional  — Enhanced UX features (e.g. remember last viewed loan)
 *   marketing   — Promotional emails and product update communications
 */

export type ConsentPurpose = "analytics" | "functional" | "marketing";
export type ConsentDecision = "granted" | "denied" | "pending";

export interface ConsentState {
  analytics: ConsentDecision;
  functional: ConsentDecision;
  marketing: ConsentDecision;
  /** Unix timestamp (ms) when the decision was last recorded */
  decidedAt: number | null;
  /** Schema version — increment when adding new purposes */
  version: 1;
}

const CONSENT_KEY = "amortix_consent_v1";

const DEFAULT_STATE: ConsentState = {
  analytics: "pending",
  functional: "pending",
  marketing: "pending",
  decidedAt: null,
  version: 1,
};

function isClient(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/** Read the current consent state from localStorage. Returns defaults if not yet set. */
export function readConsent(): ConsentState {
  if (!isClient()) return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as ConsentState;
    // Guard against stale versions
    if (parsed.version !== 1) return { ...DEFAULT_STATE };
    return parsed;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/** Write a partial update to the consent state. Merges with current state and syncs to PostgreSQL DB. */
export function writeConsent(update: Partial<Omit<ConsentState, "version" | "decidedAt">>): ConsentState {
  if (!isClient()) return { ...DEFAULT_STATE };
  const current = readConsent();
  const next: ConsentState = {
    ...current,
    ...update,
    decidedAt: Date.now(),
    version: 1,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(next));

  // Dispatch a custom event so other tabs / components can react
  window.dispatchEvent(new CustomEvent("amortix:consent-changed", { detail: next }));

  // Asynchronously record consent decision in PostgreSQL DB for audit trail
  (async () => {
    try {
      for (const [purpose, decision] of Object.entries(update)) {
        if (decision === "granted" || decision === "denied") {
          await recordUserConsent({
            purpose: `${purpose}_cookies`,
            granted: decision === "granted",
          });
        }
      }
    } catch (e) {
      console.warn("Failed to log consent record in PostgreSQL DB:", e);
    }
  })();

  return next;
}

/** Grant consent for one or more purposes. */
export function grantConsent(...purposes: ConsentPurpose[]): ConsentState {
  const update = Object.fromEntries(purposes.map((p) => [p, "granted"])) as Partial<ConsentState>;
  return writeConsent(update);
}

/** Deny consent for one or more purposes. */
export function denyConsent(...purposes: ConsentPurpose[]): ConsentState {
  const update = Object.fromEntries(purposes.map((p) => [p, "denied"])) as Partial<ConsentState>;
  return writeConsent(update);
}

/** Accept all purposes (analytics + functional + marketing). */
export function acceptAllConsent(): ConsentState {
  return writeConsent({ analytics: "granted", functional: "granted", marketing: "granted" });
}

/** Deny all non-essential purposes (analytics + marketing). Functional may be kept. */
export function declineAllConsent(): ConsentState {
  return writeConsent({ analytics: "denied", functional: "denied", marketing: "denied" });
}

/** True if the user has not yet made any consent decision. */
export function isConsentPending(): boolean {
  const state = readConsent();
  return state.decidedAt === null;
}

/** Check if a specific purpose has been granted. */
export function isConsentGranted(purpose: ConsentPurpose): boolean {
  return readConsent()[purpose] === "granted";
}

/** Triggers the consent banner to open for managing choices / withdrawing consent. */
export function openConsentBanner(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("amortix:show-consent-banner"));
  }
}

