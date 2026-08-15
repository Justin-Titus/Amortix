import { getLoans } from "@/app/actions/loan";
import { formatCurrency } from "@/lib/calculations";
import { Plus, Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildLoanPath } from "@/lib/loans/url";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My Loans ",
  description: "Review active loans, balances, rates, and monthly EMI obligations.",
};

export default async function LoansPage() {
  const loans = await getLoans();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user ? await prisma.financialProfile.findUnique({ where: { userId: user.id } }) : null;
  const currencyCode = profile?.currency ?? "INR";

  const activeLoans = loans.filter((loan) => loan.outstandingBalance > 0.01);
  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const totalEMI = activeLoans.reduce((sum, loan) => sum + loan.emiAmount, 0);
  const weightedAverageRate =
    totalOutstanding > 0
      ? activeLoans.reduce((sum, loan) => sum + loan.interestRate * loan.outstandingBalance, 0) / totalOutstanding
      : 0;
  const highRateLoans = activeLoans.filter((loan) => loan.interestRate >= 12).length;

  return (
    <div className="animate-fade-up space-y-8">
      <PageHero
        badge={{ icon: Info, label: "Portfolio view" }}
        title="My Loans"
        description="Review every balance, compare monthly burden, and keep high-interest debt visible at a glance."
        actions={
          <Link href="/loans/add" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add loan
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Active loans"
          value={activeLoans.length}
          description="Number of loans currently tracked"
          isEmpty={activeLoans.length === 0}
        />
        <MetricCard
          label="Outstanding"
          value={formatCurrency(totalOutstanding, currencyCode)}
          description="Total remaining balance"
          isEmpty={activeLoans.length === 0}
        />
        <MetricCard
          label="Monthly EMI"
          value={formatCurrency(totalEMI, currencyCode)}
          description="Estimated recurring payment"
          isEmpty={activeLoans.length === 0}
        />
        <MetricCard
          label="Avg rate"
          value={`${weightedAverageRate.toFixed(2)}%`}
          description="Weighted average interest rate"
          isEmpty={activeLoans.length === 0}
        />
      </div>


      {activeLoans.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl">
          <EmptyState
            icon={<Info className="w-5 h-5 text-slate-400" />}
            title="No loans tracked yet"
            description="Add your first loan to start comparing repayment strategies and tracking your progress toward debt freedom."
            action={{ label: "Add your first loan", href: "/loans/add" }}
          />
        </div>
      ) : (
        <>
          <div className={`rounded-xl border p-4 transition-all hover:border-slate-300 hover:shadow-sm ${highRateLoans > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${highRateLoans > 0 ? "bg-amber-100/50 text-amber-600" : "bg-emerald-100/50 text-emerald-600"}`}>
                  {highRateLoans > 0 ? (
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                  ) : (
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500">Risk watch</p>
                  <p className="mt-1 text-sm font-medium text-[#0D1F3C]">
                    {highRateLoans > 0
                      ? `${highRateLoans} loan${highRateLoans > 1 ? "s" : ""} above 12% interest`
                      : "No loans above 12% interest"}
                  </p>
                </div>
              </div>
              <Link href="/strategy" className="text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1.5">
                Open strategy engine
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeLoans.map((loan, index) => {
              const loanColor = ["#059669", "#1E3A5F", "#F59E0B", "#378ADD", "#DC2626", "#34D399"][index % 6];
              const paidPercent = Math.round((1 - loan.outstandingBalance / Math.max(loan.principal, 1)) * 100);

              return (
                <Link
                  key={loan.id}
                  href={buildLoanPath(loan.name, loan.id)}
                  className="group block rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: loanColor }} />
                      <div className="min-w-0">
                        <span className="mb-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                          {loan.loanType}
                        </span>
                        <h3 className="mt-3 truncate text-lg font-medium text-[#0D1F3C] group-hover:text-emerald-600">
                          {loan.name}
                        </h3>
                        <p className="text-xs text-slate-500">{loan.lender || "Unknown lender"}</p>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      role="progressbar"
                      aria-valuemin={0 as number}
                      aria-valuemax={100 as number}
                      aria-valuenow={Math.round(Math.max(0, Math.min(100, paidPercent))) as number}
                      aria-label={`Payment progress: ${Math.round(Math.max(0, Math.min(100, paidPercent)))}% paid`}
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, paidPercent))}%` }}
                    />
                  </div>

                  <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] text-slate-400">Outstanding</p>
                      <p className="mt-1 font-mono font-medium text-[#0D1F3C]">{formatCurrency(loan.outstandingBalance, loan.currency ?? currencyCode)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Rate</p>
                      <p className="mt-1 font-mono font-medium text-[#0D1F3C]">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Monthly EMI</p>
                      <p className="mt-1 font-mono font-medium text-[#0D1F3C]">{formatCurrency(loan.emiAmount, loan.currency ?? currencyCode)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Paid Off Loans Section */}
      {loans.filter((loan) => loan.outstandingBalance <= 0.01).length > 0 && (
        <div className="mt-10 space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#0D1F3C]">Paid Off Loans 🎉</h2>
              <p className="text-xs text-slate-500">Historical loans that have been fully cleared.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
              {loans.filter((loan) => loan.outstandingBalance <= 0.01).length} Closed
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loans
              .filter((loan) => loan.outstandingBalance <= 0.01)
              .map((loan) => (
                <Link
                  key={loan.id}
                  href={buildLoanPath(loan.name, loan.id)}
                  className="group block rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5 transition-all hover:border-emerald-300"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        ✓ PAID OFF 100%
                      </span>
                      <h3 className="mt-2 truncate text-base font-semibold text-[#0D1F3C] group-hover:text-emerald-700">
                        {loan.name}
                      </h3>
                      <p className="text-xs text-slate-500">{loan.lender || "Completed Loan"}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-3">
                    <span>Original Principal:</span>
                    <span className="font-mono font-medium text-[#0D1F3C]">
                      {formatCurrency(loan.principal, loan.currency ?? currencyCode)}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
