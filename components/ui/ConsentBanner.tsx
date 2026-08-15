"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, X, ChevronDown, ChevronUp, Lock, Check } from "lucide-react";
import {
  writeConsent,
  acceptAllConsent,
  declineAllConsent,
  isConsentPending,
  type ConsentDecision,
} from "@/lib/consent";

/**
 * DPDP-compliant consent banner.
 * Designed with floating glassmorphism, rich contrast, and sleek interaction.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState<ConsentDecision>("denied");
  const [functional, setFunctional] = useState<ConsentDecision>("denied");
  const [marketing, setMarketing] = useState<ConsentDecision>("denied");

  useEffect(() => {
    if (isConsentPending()) {
      setVisible(true);
    }

    const handler = () => setVisible(false);
    window.addEventListener("amortix:consent-changed", handler);
    return () => window.removeEventListener("amortix:consent-changed", handler);
  }, []);

  const handleSaveChoices = useCallback(() => {
    writeConsent({ analytics, functional, marketing });
    setVisible(false);
  }, [analytics, functional, marketing]);

  const handleAcceptAll = useCallback(() => {
    acceptAllConsent();
    setVisible(false);
  }, []);

  const handleDeclineAll = useCallback(() => {
    declineAllConsent();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-banner-title"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[9999] sm:max-w-xl w-full max-w-[calc(100vw-32px)]"
    >
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="consent-banner-title" className="text-sm font-semibold text-[#0D1F3C]">
                  Your Privacy Choices
                </h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/50">
                  DPDP Act 2023
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                We use essential cookies for service operation and analytics with your consent under India&apos;s DPDP Act.{" "}
                <a href="/privacy" className="font-medium text-emerald-600 hover:text-emerald-700 underline decoration-emerald-300">
                  Privacy Notice
                </a>
              </p>
            </div>
          </div>
          <button
            onClick={handleDeclineAll}
            aria-label="Close consent banner"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Granular Controls Accordion */}
        {expanded && (
          <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 animate-fade-in">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Manage consent by purpose
            </p>
            
            <ConsentRow
              id="consent-essential"
              label="Essential & Security"
              description="Required for authentication, payment logging, and security rate limiting. Cannot be disabled."
              value="granted"
              locked
            />

            <ConsentRow
              id="consent-analytics"
              label="Analytics & Insights"
              description="Allows PostHog and Vercel Analytics to measure traffic and feature usage anonymously."
              value={analytics}
              onChange={setAnalytics}
            />

            <ConsentRow
              id="consent-functional"
              label="Functional Preferences"
              description="Saves display preferences and recent workspace choices across sessions."
              value={functional}
              onChange={setFunctional}
            />

            <ConsentRow
              id="consent-marketing"
              label="Product Updates & Reminders"
              description="Allows us to send product updates and optional EMI reminder alerts."
              value={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
            aria-expanded={expanded}
          >
            {expanded ? "Hide choices" : "Manage choices"}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeclineAll}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Decline non-essential
            </button>
            {expanded ? (
              <button
                onClick={handleSaveChoices}
                className="rounded-xl bg-[#0D1F3C] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 shadow-sm"
              >
                Save choices
              </button>
            ) : (
              <button
                onClick={handleAcceptAll}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
              >
                Accept all
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Individual consent row component with smooth switch toggle */
function ConsentRow({
  id,
  label,
  description,
  value,
  onChange,
  locked = false,
}: {
  id: string;
  label: string;
  description: string;
  value: ConsentDecision;
  onChange?: (v: ConsentDecision) => void;
  locked?: boolean;
}) {
  const granted = value === "granted";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-[#0D1F3C]">{label}</p>
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              <Lock className="h-2.5 w-2.5" /> Required
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{description}</p>
      </div>

      {/* Switch Toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={locked || granted}
        disabled={locked}
        onClick={() => !locked && onChange?.(granted ? "denied" : "granted")}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          locked || granted ? "bg-emerald-600" : "bg-slate-300"
        } ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
            locked || granted ? "translate-x-4" : "translate-x-0"
          }`}
        >
          {(locked || granted) && <Check className="h-2.5 w-2.5 text-emerald-600" />}
        </span>
      </button>
    </div>
  );
}
