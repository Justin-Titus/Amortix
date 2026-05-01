import { getLoans } from "@/app/actions/loan";
import { getUserSettings } from "@/app/actions/settings";
import LiveStrategyModeler from "@/components/dashboard/LiveStrategyModeler";
import { createClient } from "@/lib/supabase/server";
import { buildLoanHeroStats } from "@/lib/calculations/loan-summary";
import { PageHero } from "@/components/layout/PageHero";
import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";

export const metadata = {
  title: "Live Analysis | Amortix",
  description: "Model debt repayment strategies in real time using your current loans.",
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

  const pageHeroStats = buildLoanHeroStats(loans);

  return (
    <PageWrapper>
      <PageHero
        badge={{ icon: Sparkles, label: "Live analysis" }}
        title="Live analysis"
        description="Compare repayment scenarios and model extra payments with the same trusted theme used across the dashboard."
        stats={pageHeroStats}
      />

      <div className="space-y-8">
        <LiveStrategyModeler loans={loans} profile={user?.financialProfile ?? null} userName={supabaseUser.user_metadata?.full_name ?? "there"} />
      </div>
    </PageWrapper>
  );
}
