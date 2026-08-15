import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import { Shield, FileText, Lock, Eye, RefreshCw, HelpCircle, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy & Data Protection Notice — Amortix",
  description: "Learn about how Amortix collects, processes, retains, and protects your data under India's Digital Personal Data Protection (DPDP) Act, 2023.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-amortix-frost text-amortix-text-primary">
      <LandingNav />
      
      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amortix-emerald-bg text-amortix-emerald">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-amortix-navy md:text-5xl">
            Privacy Policy & Data Protection Notice
          </h1>
          <p className="mt-4 text-sm text-amortix-slate">
            Effective Date: May 1, 2026. Last updated: August 14, 2026.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span>DPDP Act (India), 2023 Compliant</span>
          </div>
        </div>

        {/* Policy Content - Premium Glass/Card Layout */}
        <div className="card space-y-10 p-8 md:p-12">
          
          {/* Section 1: Overview & Notice */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                1. Data Protection Notice & Overview
              </h2>
            </div>
            {/* <!-- LEGAL REVIEW REQUIRED: DPDP Notice Text --> */}
            <p className="body-text text-base leading-7">
              Amortix (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your personal data in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India. This Privacy Notice explains what personal data we collect, the purposes for processing, data retention schedules, third-party data processors, your rights as a Data Principal, and how you can exercise those rights.
            </p>
          </section>

          {/* Section 2: Data Collected & Purpose */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                2. Personal Data We Collect and Purpose of Processing
              </h2>
            </div>
            {/* <!-- LEGAL REVIEW REQUIRED: Data Collection Inventory --> */}
            <p className="body-text text-base leading-7">
              We collect personal data strictly for specified, lawful purposes with your consent or for performance of our contractual service:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-amortix-navy">
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Data Items Collected</th>
                    <th className="p-3 font-semibold">Purpose</th>
                    <th className="p-3 font-semibold">Legal Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-amortix-slate">
                  <tr>
                    <td className="p-3 font-medium text-amortix-navy">Identity Data</td>
                    <td className="p-3">Full name, email address, password hash</td>
                    <td className="p-3">Account creation, authentication, security alerts</td>
                    <td className="p-3">Consent & Contractual necessity</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-amortix-navy">Financial Metrics</td>
                    <td className="p-3">Monthly income, expenses, credit score range, employment type, emergency fund status</td>
                    <td className="p-3">Calculating debt reduction strategies, risk scoring, AI advisor calculations</td>
                    <td className="p-3">Consent (User provided)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-amortix-navy">Loan Inventory</td>
                    <td className="p-3">Loan name, principal, balance, interest rate, tenure, EMI amount, lender name</td>
                    <td className="p-3">Amortization schedule generation, payoff strategy comparison (Avalanche/Snowball)</td>
                    <td className="p-3">Contractual necessity</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-amortix-navy">AI Interaction Data</td>
                    <td className="p-3">Chat message history with AI Advisor</td>
                    <td className="p-3">Providing tailored debt advice, maintaining conversation context</td>
                    <td className="p-3">Consent</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-amortix-navy">Usage & Technical Data</td>
                    <td className="p-3">Anonymized IP hash, device type, page views, error stack traces</td>
                    <td className="p-3">Platform security, error troubleshooting, performance optimization</td>
                    <td className="p-3">Consent (Analytics) & Legitimate interest (Security)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Third-Party Data Processors */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                3. Third-Party Data Processors
              </h2>
            </div>
            {/* <!-- LEGAL REVIEW REQUIRED: Third party processor disclosure --> */}
            <p className="body-text text-base leading-7">
              Amortix does not sell or rent your personal data. To deliver our services, we engage reputable third-party data processors bound by strict data processing agreements:
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li><strong>Supabase Auth & Database:</strong> User authentication and encrypted database hosting (PostgreSQL).</li>
              <li><strong>Vercel Inc.:</strong> Web application hosting, serverless edge infrastructure, and performance monitoring.</li>
              <li><strong>PostHog Inc. (Consent-Gated):</strong> Product analytics and feature usage metrics (loaded only if analytics consent is granted).</li>
              <li><strong>Functional Software (Sentry):</strong> Error logging and crash report capture.</li>
              <li><strong>Google Workspace (Gmail SMTP):</strong> Transactional email delivery for EMI payment reminders.</li>
            </ul>
          </section>

          {/* Section 4: Data Retention & Purge Policy */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                4. Data Retention & Purge Schedule
              </h2>
            </div>
            {/* <!-- LEGAL REVIEW REQUIRED: Retention periods --> */}
            <p className="body-text text-base leading-7">
              In compliance with DPDP Act §8(7), we retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable laws:
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li><strong>Account Profile & Loan Data:</strong> Retained for the lifetime of your active account. Purged within 30 days upon account deletion.</li>
              <li><strong>AI Conversation History:</strong> Retained for 12 months from creation date, after which message logs are automatically deleted.</li>
              <li><strong>Financial Snapshots & Analytics:</strong> Retained for 24 months to power historical trend charts, then anonymized.</li>
              <li><strong>Consent Logs:</strong> Retained for 5 years to demonstrate regulatory compliance as required under Indian law.</li>
            </ul>
          </section>

          {/* Section 5: Data Principal Rights under DPDP Act */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                5. Your Rights as a Data Principal (DPDP Act, 2023)
              </h2>
            </div>
            {/* <!-- LEGAL REVIEW REQUIRED: Data Principal rights listing --> */}
            <p className="body-text text-base leading-7">
              Under Sections 11 to 14 of the DPDP Act, Indian citizens and platform users possess the following statutory rights:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <h3 className="font-medium text-amortix-navy text-sm">Right to Summary & Access (§11)</h3>
                <p className="mt-1 text-xs text-amortix-slate">Request a summary of your personal data being processed and identities of data processors shared with.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <h3 className="font-medium text-amortix-navy text-sm">Right to Correction & Erasure (§12)</h3>
                <p className="mt-1 text-xs text-amortix-slate">Request correction of inaccurate data or complete erasure of your personal data from our systems.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <h3 className="font-medium text-amortix-navy text-sm">Right to Withdraw Consent (§6(4))</h3>
                <p className="mt-1 text-xs text-amortix-slate">Withdraw your consent at any time. Processing prior to withdrawal remains valid.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <h3 className="font-medium text-amortix-navy text-sm">Right of Grievance Redressal (§13)</h3>
                <p className="mt-1 text-xs text-amortix-slate">File a complaint with our Grievance Officer, who must respond within 30 days.</p>
              </div>
            </div>
            <div className="mt-4 pt-2 text-center">
              <Link href="/data-rights" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700">
                Submit a Data Rights Request
              </Link>
            </div>
          </section>

          {/* Section 6: Grievance Officer & Contact */}
          <section className="space-y-4 border-t border-slate-200/80 pt-8">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                6. Grievance Officer & Contact Information
              </h2>
            </div>
            {/* <!-- LEGAL REVIEW REQUIRED: Grievance officer contact details --> */}
            <p className="body-text text-base leading-7">
              If you have any questions, concerns, or grievances regarding our privacy practices or wish to exercise your data principal rights, please contact our designated Grievance Officer:
            </p>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-sm text-amortix-navy space-y-2">
              <p><strong>Grievance Officer:</strong> Data Protection & Compliance Cell</p>
              <p><strong>Entity:</strong> Amortix Platform Operations (India)</p>
              <p><strong>Grievance Email:</strong> <a href="mailto:amortix.admin@gmail.com" className="text-amortix-emerald underline font-medium">amortix.admin@gmail.com</a></p>
              <p><strong>Response SLA:</strong> Acknowledged within 48 hours; resolved within 30 days as mandated by DPDP Act §13.</p>
            </div>
          </section>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
