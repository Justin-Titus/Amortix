import { getLoans } from "@/app/actions/loan";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | Amortix",
  description: "View your loan portfolio health, repayment progress, and monthly debt metrics.",
};

export default async function DashboardPage() {
  const session = await auth();

  const loans = await getLoans();

  let profile = null;
  let snapshots: Array<{
    id: string;
    capturedAt: Date;
    affordabilityScore: number;
    dtiRatio: number;
    totalOutstanding: number;
  }> = [];

  if (session?.user?.id) {
    try {
      [profile, snapshots] = await Promise.all([
        prisma.financialProfile.findUnique({
          where: { userId: session.user.id },
        }),
        prisma.healthSnapshot.findMany({
          where: { userId: session.user.id },
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
          hasEmergencyFund: Boolean(profile.hasEmergencyFund),
          emergencyFundMonths: profile.emergencyFundMonths ?? 0,
        }
      : null;

  return (
    <DashboardHome
      loans={loans}
      userName={session?.user?.name ?? "there"}
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

