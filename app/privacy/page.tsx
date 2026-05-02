import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import { Shield, FileText, Lock, Eye } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Amortix",
  description: "Learn about how Amortix collects, uses, and safeguards your personal and financial information.",
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-amortix-slate">
            Effective Date: May 1, 2026. Last updated: May 1, 2026.
          </p>
        </div>

        {/* Policy Content - Premium Glass/Card Layout */}
        <div className="card space-y-10 p-8 md:p-12">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                1. Information We Collect
              </h2>
            </div>
            <p className="body-text text-base leading-7">
              At Amortix, we are committed to being transparent about the data we collect. Our platform is designed to provide actionable loan strategy insights while respecting your privacy.
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li>
                <strong>Account Information:</strong> When you register on Amortix, we collect your name, email address, and authentication credentials through our auth providers.
              </li>
              <li>
                <strong>Financial Information:</strong> To calculate debt reduction strategies, you input specific loan details such as total debt amount, interest rate, term length, and extra monthly payments.
              </li>
              <li>
                <strong>Usage and Device Information:</strong> We collect technical data, including IP address, browser type, operating system, and usage statistics, to help improve the performance and security of our platform.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                2. How We Use Your Information
              </h2>
            </div>
            <p className="body-text text-base leading-7">
              We process your data for the following legitimate business purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li>To provide and maintain the Amortix dashboard, including tracking your loans and visualizing amortization tables.</li>
              <li>To calculate and present custom payoff strategies, such as Avalanche or Snowball techniques.</li>
              <li>To provide customer support and troubleshoot account-related issues.</li>
              <li>To improve our analytics, optimize design patterns, and harden site security.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amortix-emerald" />
              <h2 className="font-heading text-2xl font-medium text-amortix-navy">
                3. Data Security and Retention
              </h2>
            </div>
            <p className="body-text text-base leading-7">
              We understand that financial details are highly sensitive. We implement enterprise-grade security measures to keep your data safe:
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li><strong>Encryption:</strong> All information is transmitted over secure channels (HTTPS) and encrypted at rest using industry-standard protocols.</li>
              <li><strong>Access Controls:</strong> We restrict internal access to your personal data to only those employees or partners who require it to provide the service.</li>
              <li><strong>Retention:</strong> We retain your data as long as your account remains active. You can completely delete your account and associated loan details at any time directly through the dashboard settings.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-medium text-amortix-navy">
              4. Sharing Your Information
            </h2>
            <p className="body-text text-base leading-7">
              Amortix does not sell, trade, or rent your personal data to third parties. We only share information with reputable service providers to the extent necessary to support our operations (e.g., our primary cloud hosting, authentication providers, and error trackers), or if required by law to comply with valid legal processes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-medium text-amortix-navy">
              5. Your Rights and Choices
            </h2>
            <p className="body-text text-base leading-7">
              As an Amortix user, you have full ownership over your data:
            </p>
            <ul className="list-disc pl-6 space-y-2 body-text text-base">
              <li><strong>Access & Export:</strong> You can review and export your inputted loan profiles.</li>
              <li><strong>Correction:</strong> You can edit any loan metrics immediately within your loan settings view.</li>
              <li><strong>Deletion:</strong> You have the right to request deletion of all data we hold about you.</li>
            </ul>
          </section>

          <div className="border-t border-slate-200/80 pt-8 text-center">
            <p className="text-sm text-amortix-slate">
              Have questions about this Privacy Policy? Contact us at{" "}
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
