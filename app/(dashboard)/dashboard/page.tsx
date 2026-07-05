import { getLoans } from "@/app/actions/loan";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "Dashboard ",
  description: "View your loan portfolio health, repayment progress, and monthly debt metrics.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const loans = await getLoans();

  let profile = null;
  let snapshots: Array<{
    id: string;
    capturedAt: Date;
    affordabilityScore: number;
    dtiRatio: number;
    totalOutstanding: number;
  }> = [];

  if (user?.id) {
    try {
      [profile, snapshots] = await Promise.all([
        prisma.financialProfile.findUnique({
          where: { userId: user.id },
        }),
        prisma.healthSnapshot.findMany({
          where: { userId: user.id },
          orderBy: { capturedAt: "asc" },
          take: 12,
        }),
      ]);
    } catch (error) {
      console.error("Failed to load dashboard profile data:", error);
      profile = null;
      snapshots = [];
    }
  }

  const mappedProfile =
    profile &&
    typeof profile.monthlyIncome === "number" &&
    typeof profile.monthlyExpenses === "number"
      ? {
          monthlyIncome: profile.monthlyIncome,
          monthlyExpenses: profile.monthlyExpenses,
          creditScoreRange: profile.creditScoreRange,
          hasEmergencyFund: Boolean(profile.hasEmergencyFund),
          emergencyFundMonths: profile.emergencyFundMonths ?? 0,
        }
      : null;

  return (
    <DashboardHome
      loans={loans}
      userName={user?.user_metadata?.full_name ?? "there"}
      profile={mappedProfile}
      snapshots={snapshots.map((snapshot) => ({
        id: snapshot.id,
        capturedAt: snapshot.capturedAt.toISOString(),
        affordabilityScore: snapshot.affordabilityScore,
        dtiRatio: snapshot.dtiRatio,
        totalOutstanding: snapshot.totalOutstanding,
      }))}
    />
  );
}

