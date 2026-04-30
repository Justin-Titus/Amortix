import Link from "next/link";
import { getLoans } from "@/app/actions/loan";
import { getUserSettings } from "@/app/actions/settings";
import { detectInterestLeaks } from "@/lib/analysis/interest-leak";
import type { LoanInput as LeakLoanInput } from "@/lib/analysis/interest-leak";
import type { FinancialProfileInput } from "@/lib/validations/profile.schema";
import { predictDefaultRisk } from "@/lib/ml/default-risk";
import { formatCurrency } from "@/lib/calculations/emi";
import { Check, Lock, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { monthsSince } from "@/lib/utils/insights";
import { RiskWatchlist } from "@/components/insights/RiskWatchlist";
import { LeakDetector } from "@/components/insights/LeakDetector";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Insights | Amortix",
  description: "See your portfolio risk, interest leak hotspots, and the highest-priority actions.",
};

export const dynamic = "force-dynamic";

type InsightLoan = LeakLoanInput & {
  startDate: Date;
};

type InsightsUser = {
  financialProfile: FinancialProfileInput | null;
};

function LockedSection({ title, description }: { title: string; description: string }) {
  return (
    <Card className="bg-slate-50 opacity-80 p-8 text-center">
      <div className="mb-3 flex items-center justify-center">
        <Lock className="h-4 w-4 text-slate-400" />
      </div>
      <p className="text-[13px] font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-[12px] text-slate-400">{description}</p>
    </Card>
  );
}

export default async function InsightsPage() {
  const [loans, user]: [InsightLoan[], InsightsUser] = await Promise.all([
    getLoans(),
    getUserSettings() as Promise<InsightsUser>,
  ]);

  const profile = user.financialProfile;
  const typedProfile = profile;

  const totals = {
    outstanding: loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0),
    emi: loans.reduce((sum, loan) => sum + loan.emiAmount, 0),
    avgRate:
      loans.length > 0
        ? loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length
        : 0,
  };

  const leaks = typedProfile
    ? detectInterestLeaks(
        loans.map((loan) => ({
          id: loan.id,
          name: loan.name,
          interestRate: loan.interestRate,
          rateType: loan.rateType,
          tenureMonths: loan.tenureMonths,
          outstandingBalance: loan.outstandingBalance,
          emiAmount: loan.emiAmount,
          loanType: loan.loanType,
        })),
        {
          monthlyIncome: typedProfile.monthlyIncome,
          monthlyExpenses: typedProfile.monthlyExpenses,
          hasEmergencyFund: typedProfile.hasEmergencyFund,
          emergencyFundMonths: typedProfile.emergencyFundMonths,
        }
      )
    : [];

  const riskRows = typedProfile
    ? loans
        .map((loan) => {
          const result = predictDefaultRisk({
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
            monthsActive: monthsSince(loan.startDate),
            totalMonthlyEMI: totals.emi,
            numberOfActiveLoans: loans.length,
            debtToIncomeRatio: typedProfile.monthlyIncome > 0 ? totals.emi / typedProfile.monthlyIncome : 1,
          });

          return {
            loanId: loan.id,
            loanName: loan.name,
            risk: result,
          };
        })
        .sort((a, b) => b.risk.riskScore - a.risk.riskScore)
        .slice(0, 3)
    : [];

  if (loans.length === 0) {
    return (
      <PageWrapper>
        <PageHero
          badge={{ icon: Sparkles, label: "Actionable signals" }}
          title="Insights"
          description="Track portfolio pressure and identify the next action with the biggest repayment impact."
          stats={[
            { label: "Total debt", value: formatCurrency(0), muted: true },
            { label: "Monthly EMI", value: formatCurrency(0), muted: true },
            { label: "Avg rate", value: "0.00%", muted: true },
          ]}
        />

        <Card>
          <EmptyState
            icon={<Sparkles className="h-5 w-5 text-slate-400" />}
            title="Add a loan to unlock insights"
            description="Insights are generated from your live loan data. Add your first loan to see risk watchlists and leak detection." 
            action={{ label: "Add your first loan", href: "/loans/add" }}
          />
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHero
        badge={{ icon: Sparkles, label: "Actionable signals" }}
        title="Insights"
        description="Track portfolio pressure and identify the next action with the biggest repayment impact."
        stats={[
          { label: "Total debt", value: formatCurrency(totals.outstanding), muted: totals.outstanding === 0 },
          { label: "Monthly EMI", value: formatCurrency(totals.emi), muted: totals.emi === 0 },
          { label: "Avg rate", value: `${totals.avgRate.toFixed(2)}%`, muted: totals.avgRate === 0 },
        ]}
      />

      {!profile ? (
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-amber-500" />
              <h2 className="text-[14px] font-medium text-amortix-navy">Complete your profile to unlock deeper insights</h2>
            </div>
            {[
              { label: "Add monthly income and expenses", done: false, href: "/profile" },
              { label: "Set your emergency fund status", done: false, href: "/profile" },
              { label: "Add at least one loan", done: loans.length > 0, href: "/loans/add" },
            ].map(({ label, done, href }) => (
              <div key={label} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? "bg-emerald-100" : "border-2 border-slate-200"}`}>
                  {done ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                </div>
                <span className={`text-[13px] ${done ? "line-through text-slate-400" : "text-slate-600"}`}>{label}</span>
                {!done ? (
                  <Link href={href} className="ml-auto text-[12px] text-emerald-600 hover:underline">
                    Set up →
                  </Link>
                ) : null}
              </div>
            ))}
          </Card>

          <div className="grid gap-4">
            <LockedSection title="Health trend chart" description="Unlocks after your first monthly snapshot" />
            <LockedSection title="Interest leak detector" description="Unlocks once loans and profile are complete" />
            <LockedSection title="Default risk scores" description="Unlocks once loans and profile are complete" />
          </div>
        </div>
      ) : (
        <>
          <RiskWatchlist rows={riskRows} />
          <LeakDetector leaks={leaks} />
        </>
      )}
    </PageWrapper>
  );
}
