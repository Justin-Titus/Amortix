import AddLoanForm from "@/components/loans/AddLoanForm";
import { ArrowLeft, Info, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function AddLoanPage() {
  return (
    <div className="animate-fade-up space-y-8">
      <div className="glass-panel p-6 md:p-8">
        <Link 
          href="/loans" 
          className="mb-4 inline-flex items-center gap-2 text-sm text-amortix-slate hover:text-amortix-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loans
        </Link>
        <h1 className="text-3xl font-heading font-medium text-amortix-navy md:text-4xl">
          Add New Loan
        </h1>
        <p className="mt-2 text-sm leading-7 text-amortix-slate">
          Enter your loan details accurately for precise repayment projections.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <div>
          <AddLoanForm />
        </div>
        
        <aside className="space-y-4">
          <div className="card space-y-3 bg-[var(--color-frost)]">
            <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--color-navy)] mb-4 border-b border-[var(--color-border)] pb-2">
              <Info className="w-4 h-4 text-[var(--color-emerald)]" />
              Why this matters
            </h3>
            <p className="text-xs text-[var(--color-slate)] leading-relaxed">
              Adding your loans allows our Strategy Engine to automatically calculate scenarios like the Avalanche or Snowball methods.
            </p>
            <p className="text-xs text-[var(--color-slate)] leading-relaxed">
              The more accurate your inputs (especially the current interest rate and outstanding balance), the better our AI can tailor advice to save you money.
            </p>
          </div>

          <div className="card space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--color-navy)] mb-4 border-b border-[var(--color-border)] pb-2">
              <HelpCircle className="w-4 h-4 text-[var(--color-amber)]" />
              Quick Tips
            </h3>
            <ul className="space-y-3 text-xs text-[var(--color-slate)]">
              <li className="flex gap-2">
                <span className="text-[var(--color-emerald)]">•</span>
                <span>You can usually find your exact <strong>outstanding balance</strong> on your lender's mobile app or last statement.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--color-emerald)]">•</span>
                <span>The <strong>EMI Amount</strong> is auto-calculated if you know the principal, rate, and tenure. You can manually adjust it if your bank rounded differently.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--color-emerald)]">•</span>
                <span>For <strong>Floating Rate</strong> loans, use the current effective rate. You can update this later if it changes.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
