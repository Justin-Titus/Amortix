"use server";

import { prisma } from "@/lib/prisma";
import { calculateAffordabilityScore } from "@/lib/calculations/affordability";
import { reportError } from "@/lib/logger";

type SnapshotLoan = {
  emiAmount: number;
  outstandingBalance: number;
  interestRate: number;
  tenureMonths: number;
  rateType: "FIXED" | "FLOATING";
};

type SnapshotProfile = {
  monthlyIncome: number;
  monthlyExpenses: number;
  creditScoreRange: string;
  hasEmergencyFund: boolean;
  emergencyFundMonths: number;
  otherMonthlyDebt?: number | null;
};

function getCurrentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function captureMonthlySnapshot(userId: string): Promise<void> {
  if (!userId) {
    return;
  }

  try {
    const thisMonth = getCurrentMonthStart();

    const [profileResult, loansResult] = await Promise.all([
      prisma.financialProfile.findUnique({ where: { userId } }),
      prisma.loan.findMany({ where: { userId } }),
    ]);

    const profile = profileResult as SnapshotProfile | null;
    const loans = loansResult as SnapshotLoan[];

    if (!profile) {
      return;
    }

    const totalEMI = loans.reduce((sum: number, loan: SnapshotLoan) => sum + loan.emiAmount, 0);
    const totalOutstanding = loans.reduce((sum: number, loan: SnapshotLoan) => sum + loan.outstandingBalance, 0);
    const otherMonthlyDebt = typeof profile.otherMonthlyDebt === "number" ? profile.otherMonthlyDebt : 0;
    const totalMonthlyDebt = totalEMI + otherMonthlyDebt;

    const affordability = calculateAffordabilityScore({
      monthlyIncome: profile.monthlyIncome,
      monthlyExpenses: profile.monthlyExpenses,
      totalMonthlyEMI: totalEMI,
      creditScoreRange: profile.creditScoreRange,
      hasEmergencyFund: profile.hasEmergencyFund,
      emergencyFundMonths: profile.emergencyFundMonths,
      loans: loans.map((loan: SnapshotLoan) => ({
        annualRate: loan.interestRate,
        tenureMonths: loan.tenureMonths,
        rateType: loan.rateType,
      })),
    });

    await prisma.healthSnapshot.create({
      data: {
        userId,
        capturedAt: thisMonth,
        affordabilityScore: affordability.score,
        dtiRatio: profile.monthlyIncome > 0 ? totalMonthlyDebt / profile.monthlyIncome : 0,
        emiToIncomeRatio: profile.monthlyIncome > 0 ? totalEMI / profile.monthlyIncome : 0,
        totalOutstanding,
        totalEMI,
        activeLoans: loans.length,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error) {
      const knownError = error as Error & { code?: string };
      if (knownError.code === "P2002") {
        // A snapshot for this user/month already exists; ignore duplicate creation.
        return;
      }
    }
    reportError(error, { flow: "captureMonthlySnapshot", userId });
  }
}
