import { notFound } from "next/navigation";
import { formatCurrency, loanHealthScore, getCurrencyConfig } from "@/lib/calculations";
import LoanActions from "@/components/loans/LoanActions";
import Link from "next/link";
import { ArrowLeft, Calendar, Building2, Receipt, Percent, History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import DefaultRiskCard from "@/components/ml/DefaultRiskCard";
import LoanHealthScoreBadge from "@/components/analysis/LoanHealthScoreBadge";
import PrepaymentSimulator from "@/components/analysis/PrepaymentSimulator";
import type { FinancialProfileInput } from "@/lib/validations/profile.schema";
import LogPaymentForm from "@/components/loans/LogPaymentForm";
import { slugifyLoanName } from "@/lib/loans/url";

function differenceInMonths(from: Date, to: Date): number {
  const yearDiff = to.getFullYear() - from.getFullYear();
  const monthDiff = to.getMonth() - from.getMonth();
  return Math.max(0, yearDiff * 12 + monthDiff);
}

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const rawParam = decodeURIComponent(resolvedParams.id);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  const loanData = await prisma.loan.findFirst({
    where: { id: rawParam, userId: userId },
    include: {
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 10,
      },
    },
  });

  let resolvedLoanData = loanData;
  if (!resolvedLoanData && userId) {
    const loansByUser = await prisma.loan.findMany({
      where: { userId },
      include: {
        payments: {
          orderBy: { paymentDate: "desc" },
          take: 10,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    resolvedLoanData = loansByUser.find((l) => slugifyLoanName(l.name) === rawParam) ?? null;
  }

  if (!resolvedLoanData) {
    notFound();
  }

  const loan = resolvedLoanData;

  let profile = null;
  let userLoans: Array<{
    emiAmount: number;
  }> = [];

  if (userId) {
    try {
      [profile, userLoans] = await Promise.all([
        prisma.financialProfile.findUnique({
          where: { userId: userId },
        }),
        prisma.loan.findMany({
          where: { userId: userId },
        }),
      ]);
    } catch (error) {
      console.error("Failed to load loan detail context:", error);
    }
  }

  const currencyCode = loan.currency ?? profile?.currency ?? "INR";

  const paidAmount = loan.principal - loan.outstandingBalance;
  const paidPercent = Math.max(0, Math.min(100, (paidAmount / Math.max(loan.principal, 1)) * 100));

  const totalMonthlyEMI = userLoans.reduce((sum, currentLoan) => sum + currentLoan.emiAmount, 0);
  const monthsActive = differenceInMonths(new Date(loan.startDate), new Date());

  const typedProfile = profile ? (profile as FinancialProfileInput) : null;

  const riskInput =
    typedProfile && typedProfile.monthlyIncome > 0
      ? {
          monthlyIncome: typedProfile.monthlyIncome,
          monthlyExpenses: typedProfile.monthlyExpenses,
          employmentType: typedProfile.employmentType,
          hasEmergencyFund: typedProfile.hasEmergencyFund,
          emergencyFundMonths: typedProfile.emergencyFundMonths,
          creditScoreRange: typedProfile.creditScoreRange,
          loanType: loan.loanType,
          interestRate: loan.interestRate,
          rateType: loan.rateType,
          tenureMonths: loan.tenureMonths,
          outstandingBalance: loan.outstandingBalance,
          emiAmount: loan.emiAmount,
          monthsActive,
          totalMonthlyEMI,
          numberOfActiveLoans: userLoans.length,
          debtToIncomeRatio: totalMonthlyEMI / typedProfile.monthlyIncome,
        }
      : null;

  const healthScore =
    profile && profile.monthlyIncome > 0
      ? loanHealthScore({
          interestRate: loan.interestRate,
          rateType: loan.rateType,
          tenureMonths: loan.tenureMonths,
          emiAmount: loan.emiAmount,
          monthlyIncome: profile.monthlyIncome,
          outstandingBalance: loan.outstandingBalance,
          principal: loan.principal,
        })
      : null;

  return (
    <div className="animate-fade-up mx-auto max-w-6xl space-y-8">
      <div className="section-block flex flex-wrap items-center justify-between gap-4 p-4">
        <Link href="/loans" className="inline-flex items-center gap-2 text-sm text-amortix-slate transition-colors hover:text-amortix-navy">
          <ArrowLeft className="h-4 w-4" />
          Back to Loans
        </Link>
        <LoanActions loanId={loan.id} loanName={loan.name} />
      </div>

      <div className="glass-panel p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(220px,auto)] xl:items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amortix-emerald">
              {loan.loanType} LOAN
            </div>
            <h1 className="text-3xl font-heading font-medium text-amortix-navy md:text-4xl">
              {loan.name}
            </h1>
            {loan.lender && (
              <p className="mt-2 flex items-center gap-2 text-sm text-amortix-slate">
                <Building2 className="h-4 w-4" />
                {loan.lender}
              </p>
            )}

            {healthScore !== null ? <LoanHealthScoreBadge score={healthScore} /> : null}
          </div>

          <div className="section-block min-w-60 bg-amortix-frost p-5 xl:justify-self-end">
            <p className="text-xs font-medium uppercase tracking-wider text-amortix-slate">Outstanding Balance</p>
            <p className="mt-2 text-3xl font-heading font-medium text-amortix-navy">{formatCurrency(loan.outstandingBalance, currencyCode)}</p>
            <div className="mt-4 border-t border-amortix-border-light pt-4">
              <div className="mb-2 flex justify-between text-[11px] text-amortix-slate">
                <span>Paid: {formatCurrency(paidAmount, currencyCode)}</span>
                <span>{paidPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-amortix-emerald"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="section-block space-y-2 p-5">
          <div className="mb-4 flex items-center gap-2 text-amortix-slate">
            <Receipt className="h-4 w-4" />
            <h3 className="text-sm font-medium uppercase tracking-wider">EMI Details</h3>
          </div>
          <p className="pb-1 text-2xl font-mono text-amortix-navy">
            {formatCurrency(loan.emiAmount, currencyCode)}
            <span className="text-sm font-sans text-amortix-slate">/mo</span>
          </p>
          <p className="mt-3 border-t border-amortix-border-light pt-3 text-sm text-amortix-slate">
            Principal: {formatCurrency(loan.principal, currencyCode)}
          </p>
        </div>

        <div className="section-block space-y-2 p-5">
          <div className="mb-4 flex items-center gap-2 text-amortix-slate">
            <Percent className="h-4 w-4" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Interest Rate</h3>
          </div>
          <p className="pb-1 text-2xl font-mono text-amortix-navy">{loan.interestRate}%</p>
          <p className="mt-3 border-t border-amortix-border-light pt-3 text-sm text-amortix-slate">
            Type: {loan.rateType}
          </p>
        </div>

        <div className="section-block space-y-2 p-5">
          <div className="mb-4 flex items-center gap-2 text-amortix-slate">
            <Calendar className="h-4 w-4" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Tenure</h3>
          </div>
          <p className="pb-1 text-2xl font-mono text-amortix-navy">
            {loan.tenureMonths} <span className="text-sm font-sans text-amortix-slate">months</span>
          </p>
          <p className="mt-3 border-t border-amortix-border-light pt-3 text-sm text-amortix-slate">
            Started: {new Date(loan.startDate).toLocaleDateString(getCurrencyConfig(currencyCode).locale, { month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          {riskInput ? <DefaultRiskCard riskInput={riskInput} currencyCode={currencyCode} /> : null}

          <div className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-amortix-slate">Prepayment Impact Simulator</h2>
            <PrepaymentSimulator
              outstandingBalance={loan.outstandingBalance}
              interestRate={loan.interestRate}
              tenureMonths={loan.tenureMonths}
              emiAmount={loan.emiAmount}
              currencyCode={currencyCode}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-amortix-slate" />
              <h2 className="text-sm font-medium uppercase tracking-wider text-amortix-slate">Recent Payment History</h2>
            </div>
            
            {loan.payments.length === 0 ? (
              <div className="section-block p-8 text-center text-sm text-amortix-slate">
                No payments recorded yet. Record your first EMI to see history.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-amortix-border-light bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-amortix-frost border-b border-amortix-border-light">
                    <tr>
                      <th className="px-6 py-3 font-medium text-amortix-navy">Date</th>
                      <th className="px-6 py-3 font-medium text-amortix-navy">Type</th>
                      <th className="px-6 py-3 font-medium text-amortix-navy">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amortix-border-light">
                    {loan.payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-amortix-slate">
                          {new Date(payment.paymentDate).toLocaleDateString(getCurrencyConfig(currencyCode).locale, { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                            payment.type === "EMI" 
                              ? "bg-emerald-50 text-amortix-emerald" 
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {payment.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-amortix-navy">
                          {formatCurrency(payment.amount, currencyCode)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <LogPaymentForm loanId={loan.id} defaultAmount={loan.emiAmount} loanName={loan.name} currencyCode={currencyCode} />
          
          <div className="glass-panel p-5 bg-amortix-frost">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amortix-navy mb-3">Balance Management</h3>
            <p className="text-xs text-amortix-slate leading-relaxed">
              Recording a payment automatically updates your outstanding balance. 
              Regular EMI logs also advance your next scheduled due date.
            </p>
          </div>
        </div>
      </div>

      {loan.notes && (
        <div className="section-block">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-amortix-slate">Notes</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-amortix-navy">{loan.notes}</p>
        </div>
      )}

      <div className="section-block mt-8 p-8 text-center">
        <p className="text-sm text-amortix-slate">Detailed amortization schedule features are part of the Strategy engine.</p>
        <Link href="/strategy" className="mt-3 inline-flex text-sm font-medium text-amortix-emerald hover:underline">
          View Repayment Strategies &rarr;
        </Link>
      </div>
    </div>
  );
}
