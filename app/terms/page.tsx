import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import { Scale, FileText, CheckCircle, AlertTriangle, Shield } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Amortix",
  description: "Read our Terms of Service to understand your rights and responsibilities when using Amortix.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-amortix-frost text-amortix-text-primary">
      <LandingNav />
      
      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amortix-emerald-bg text-amortix-emerald">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-amortix-navy md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-amortix-slate">
            Effective Date: May 1, 2026. Last updated: May 1, 2026.
          </p>
        </div>

        {/* Terms Content - Premium Glass/Card Layout */}
        <div className="card space-y-10 p-8 md:p-12">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                1. Acceptance of Terms
              </h2>
            </div>
            <p className="body-text text-base leading-7">
              Welcome to Amortix. By visiting our website or using our software platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue the use of our services immediately.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                2. User Accounts and Eligibility
              </h2>
            </div>
            <p className="body-text text-base leading-7">
              To use Amortix, you must be at least 18 years of age. By registering for an account, you represent and warrant that the information you provide is true and accurate. You are solely responsible for maintaining the confidentiality of your credentials and for any activity that occurs under your account. Amortix is not responsible for any losses arising from unauthorized access to your account.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                3. Disclaimer of Financial Advice
              </h2>
            </div>
            <p className="body-text text-base leading-7">
              Amortix provides automated calculations, interest comparisons, and visualization models for informational and strategic planning purposes only.
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li>Amortix does not offer personal, professional, or corporate financial, investment, or legal advice.</li>
              <li>The software generates scenarios based on inputs you provide; accuracy of external results is subject to variables we cannot control.</li>
              <li>Always perform independent validation or consult a certified financial planner before making significant payment adjustments or financial decisions.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-medium text-amortix-navy">
              4. Permitted and Prohibited Uses
            </h2>
            <p className="body-text text-base leading-7">
              You agree to use Amortix only for lawful purposes in accordance with these Terms. You specifically agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li>Reverse engineer, decompile, or extract the underlying logic, schemas, or source code of Amortix.</li>
              <li>Engage in any activity that interferes with or disrupts our servers or services.</li>
              <li>Upload malicious code, script injections, or false/misleading metadata that disrupts core system functions.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-medium text-amortix-navy">
              5. Intellectual Property
            </h2>
            <p className="body-text text-base leading-7">
              The design, structure, codebases, features, and content of Amortix (excluding user-submitted metrics) are the exclusive property of Amortix and are protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to access and use the platform for your own personal use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-medium text-amortix-navy">
              6. Limitation of Liability and Termination
            </h2>
            <p className="body-text text-base leading-7">
              In no event shall Amortix or its developers be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services. We reserve the right to suspend or terminate access to our platform for any reason, including any breach of these Terms, at our sole discretion without notice.
            </p>
          </section>

          {/* Section 7: Data Protection & DPDP Compliance */}
          {/* <!-- LEGAL REVIEW REQUIRED: Data protection clause --> */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                7. Data Protection and Privacy (DPDP Act, 2023)
              </h2>
            </div>
            <p className="body-text text-base leading-7">
              Amortix complies with the Digital Personal Data Protection Act, 2023 (India). By using our services, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li>Your personal and financial data is collected and processed based on your explicit consent or performance of service contracts.</li>
              <li>You retain statutory rights to access, correct, erase, and port your personal data, as well as the right to withdraw consent at any time.</li>
              <li>You may file grievances directly with our designated Grievance Officer (<a href="mailto:amortix.admin@gmail.com" className="text-amortix-emerald underline">amortix.admin@gmail.com</a>), who will respond within 30 days.</li>
              <li>For detailed information regarding processing purposes, data processors, and retention periods, please refer to our <a href="/privacy" className="text-amortix-emerald underline font-medium">Privacy Policy</a>.</li>
            </ul>
          </section>

          <div className="border-t border-slate-200/80 pt-8 text-center">
            <p className="text-sm text-amortix-slate">
              Questions regarding these Terms of Service? Please reach out to{" "}
              <a href="mailto:amortix.admin@gmail.com" className="font-medium text-amortix-emerald hover:underline">
                amortix.admin@gmail.com
              </a>
            </p>
          </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
