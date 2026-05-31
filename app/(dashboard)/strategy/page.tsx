import { getLoans } from "@/app/actions/loan";
import { buildLoanHeroStats, type LoanSummaryInput, type StrategyLoanInput } from "@/lib/calculations";
import StrategyComparison from "@/components/strategy/StrategyComparison";
import { BarChart3, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Repayment Strategy ",
  description: "Optimize your debt repayment with AI-driven strategies.",
};

export default async function StrategyPage() {
  const userLoans = await getLoans();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user ? await prisma.financialProfile.findUnique({ where: { userId: user.id } }) : null;
  const currencyCode = profile?.currency ?? "INR";

  const pageHeroStats = buildLoanHeroStats(userLoans as LoanSummaryInput[], currencyCode);

  const mappedLoans: StrategyLoanInput[] = userLoans.map((loan) => ({
    id: loan.id,
    name: loan.name,
    outstanding: loan.outstandingBalance,
    annualRate: loan.interestRate,
    emi: loan.emiAmount,
    currency: loan.currency ?? currencyCode,
  }));

  return (
    <PageWrapper>
      <PageHero
        badge={{ icon: Sparkles, label: "Strategy engine" }}
        title="Repayment strategy"
        description="Compare avalanche, snowball, and hybrid payoff paths with live savings, payoff timing, and detailed amortization schedules."
        stats={pageHeroStats}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, text: "Extra payments go to the highest-rate debt first", color: "bg-emerald-50 text-emerald-600" },
            { icon: ShieldCheck, text: "Switch to snowball if you need psychological wins", color: "bg-blue-50 text-blue-600" },
            { icon: BarChart3, text: "See payoff dates, saved interest, and full schedules", color: "bg-amber-50 text-amber-600" },
          ].map(({ icon: Icon, text, color }, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-xl transition-all hover:bg-slate-50/50">
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{text}</p>
            </div>
          ))}
        </div>
      </PageHero>

      {userLoans.length === 0 ? (
        <div className="bg-white border border-amortix-border-light rounded-2xl">
          <EmptyState
            icon={<BarChart3 className="w-5 h-5 text-slate-400" />}
            title="No loans to optimize"
            description="Add at least one loan to compare Avalanche, Snowball, and Hybrid repayment strategies and see how much you can save."
            action={{ label: "Add a loan first", href: "/loans/add" }}
          />
        </div>
      ) : (
        <StrategyComparison loans={mappedLoans} currencyCode={currencyCode} />
      )}
    </PageWrapper>
  );
}
