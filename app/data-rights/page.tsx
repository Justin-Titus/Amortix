"use client";

import { useState } from "react";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import { ShieldCheck, CheckCircle2, Loader2, FileText } from "lucide-react";
import { submitDataRightsRequest } from "@/app/actions/data-rights";
import { CustomSelect } from "@/components/ui/CustomSelect";

type RequestType = "ACCESS" | "CORRECTION" | "ERASURE" | "WITHDRAW" | "PORTABILITY";

const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: "ACCESS", label: "Right to Summary & Access (DPDP §11)" },
  { value: "CORRECTION", label: "Right to Correction / Updating (DPDP §12)" },
  { value: "ERASURE", label: "Right to Erasure / Deletion (DPDP §12)" },
  { value: "WITHDRAW", label: "Right to Withdraw Consent (DPDP §6(4))" },
  { value: "PORTABILITY", label: "Right to Data Portability" },
];

export default function DataRightsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("ACCESS");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await submitDataRightsRequest({
        name,
        email,
        requestType,
        details,
      });

      if ("error" in res && res.error) {
        setErrorMsg(res.error);
      } else if ("message" in res && typeof res.message === "string") {
        setSuccessMsg(res.message);
        setName("");
        setEmail("");
        setDetails("");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amortix-frost text-amortix-text-primary">
      <LandingNav />

      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-24">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-amortix-navy md:text-4xl">
            Data Principal Rights Request
          </h1>
          <p className="mt-3 text-sm text-amortix-slate max-w-xl mx-auto">
            Under India&apos;s Digital Personal Data Protection (DPDP) Act, 2023, you have statutory rights regarding your personal data. Submit your request below for processing.
          </p>
        </div>

        {/* Card Form */}
        <div className="card p-8 md:p-10">
          {successMsg ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-medium text-amortix-navy">Request Submitted Successfully</h2>
              <p className="text-sm text-amortix-slate max-w-md mx-auto">{successMsg}</p>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anti-bot honeypot field */}
              <input
                type="text"
                name="hp_field"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-amortix-navy mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-amortix-navy mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label htmlFor="requestType" className="block text-sm font-medium text-amortix-navy mb-1">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <CustomSelect<RequestType>
                  id="requestType"
                  value={requestType}
                  options={REQUEST_TYPE_OPTIONS}
                  onChange={(val) => setRequestType(val)}
                  placeholder="Select request type..."
                />
              </div>

              <div>
                <label htmlFor="details" className="block text-sm font-medium text-amortix-navy mb-1">
                  Request Details (Optional)
                </label>
                <textarea
                  id="details"
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide specific details to help us process your request faster..."
                  className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-amortix-slate space-y-1">
                <p className="font-medium text-amortix-navy flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-red-600" />
                  DPDP Act Response Guarantee
                </p>
                <p>
                  As mandated by DPDP Act §13, our Grievance Officer will acknowledge your request within 48 hours and complete resolution within <strong>30 days</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  "Submit Data Rights Request"
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
