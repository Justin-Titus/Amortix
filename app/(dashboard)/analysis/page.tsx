import { getLoans } from "@/app/actions/loan";
import { getUserSettings } from "@/app/actions/settings";
import { createClient } from "@/lib/supabase/server";
import { buildLoanHeroStats, formatCurrency } from "@/lib/calculations";
import { PageHero } from "@/components/layout/PageHero";
import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { prisma } from "@/lib/prisma";
import InterestLeakDetector from "@/components/analysis/InterestLeakDetector";
import Link from "next/link";
import { MetricCard } from "@/components/ui/MetricCard";

export const metadata = {
  title: "Analysis",
  description: "Real-time debt health signals and affordability insights.",
};

type AnalysisUser = {
  financialProfile: {
    monthlyIncome?: number | null;
    monthlyExpenses?: number | null;
    creditScoreRange?: string | null;
    hasEmergencyFund?: boolean | null;
    emergencyFundMonths?: number | null;
    employmentType?: string | null;
  } | null;
};

export default async function AnalysisPage() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    redirect("/login");
  }

  const loans = await getLoans();
  const userCandidate = await getUserSettings().catch(() => null);
  const user: AnalysisUser | null =
    userCandidate && typeof userCandidate === "object" && "financialProfile" in userCandidate
      ? (userCandidate as AnalysisUser)
      : null;

  const profile = await prisma.financialProfile.findUnique({ where: { userId: supabaseUser.id } });
  const currencyCode = profile?.currency ?? "INR";

  const pageHeroStats = buildLoanHeroStats(loans, currencyCode);

  // Core metrics calculations
  const totalOutstanding = loans.reduce((s, l) => s + l.outstandingBalance, 0);
  const totalEMI = loans.reduce((s, l) => s + l.emiAmount, 0);
  const dti = profile?.monthlyIncome ? (totalEMI / profile.monthlyIncome) * 100 : 0;
  const surplus = profile ? (profile.monthlyIncome - profile.monthlyExpenses - totalEMI) : 0;
  const highRiskLoans = loans.filter(l => l.interestRate >= 15);
  
  const totalInterestPerMonth = loans.reduce((s, l) => {
    const monthlyRate = l.interestRate / 12 / 100;
    return s + (l.outstandingBalance * monthlyRate);
  }, 0);

  return (
    <PageWrapper>
      <PageHero
        badge={{ icon: Sparkles, label: "Deep analysis" }}
        title="Analysis"
        description="Real-time debt health signals and affordability insights."
        stats={pageHeroStats}
      />

      {loans.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amortix-emerald-bg text-amortix-emerald">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-heading text-xl font-medium text-amortix-navy">No data yet</h2>
          <p className="mt-2 max-w-lg text-sm text-amortix-slate">
            Add loans to see detailed analysis.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/loans/add" className="btn-primary">
              Add a loan
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <MetricCard
              label="Debt-to-Income"
              value={`${dti.toFixed(1)}%`}
              description={dti > 40 ? 'Above safe threshold' : 'Within safe range'}
              valueColor={dti > 40 ? 'red' : dti > 30 ? 'amber' : 'emerald'}
            />
            <MetricCard
              label="Monthly surplus"
              value={formatCurrency(Math.max(0, surplus), currencyCode)}
              description={surplus < 0 ? 'Deficit detected' : 'After EMI + expenses'}
              valueColor={surplus < 0 ? 'red' : 'emerald'}
            />
            <MetricCard
              label="Monthly interest cost"
              value={formatCurrency(totalInterestPerMonth, currencyCode)}
              description="Total interest expense"
              valueColor="amber"
            />
            <MetricCard
              label="High-risk loans"
              value={highRiskLoans.length}
              description="Loans above 15% rate"
              valueColor={highRiskLoans.length > 0 ? 'red' : 'emerald'}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InterestLeakDetector 
              loans={loans.map(l => ({
                id: l.id,
                name: l.name,
                outstandingBalance: l.outstandingBalance,
                interestRate: l.interestRate,
                emiAmount: l.emiAmount,
                loanType: l.loanType,
                rateType: l.rateType,
                tenureMonths: l.tenureMonths,
              }))}
              profile={user?.financialProfile ?? null} 
              currencyCode={currencyCode} 
            />

            {profile && (
              <div className="card h-fit">
                <h2 className="mb-4 text-base font-heading font-medium text-amortix-navy">
                  Financial profile
                </h2>
                <div className="divide-y divide-amortix-border-light">
                  {[
                    ['Monthly income', formatCurrency(profile.monthlyIncome, currencyCode)],
                    ['Monthly expenses', formatCurrency(profile.monthlyExpenses, currencyCode)],
                    ['Total EMI', formatCurrency(totalEMI, currencyCode)],
                    ['Net surplus', formatCurrency(Math.max(0, surplus), currencyCode)],
                    ['Credit score range', profile.creditScoreRange],
                    ['Emergency fund', profile.hasEmergencyFund ? `${profile.emergencyFundMonths} months` : 'No'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-3">
                      <span className="text-sm text-amortix-slate">{label}</span>
                      <span className="num text-sm font-medium text-amortix-navy">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
