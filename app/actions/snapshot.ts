"use server";

import { prisma } from "@/lib/prisma";
import { calculateAffordabilityScore } from "@/lib/calculations";
import { generateMonthlyRanges } from "@/lib/calculations/calendar";
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

  // Backfill missing snapshots dynamically
  await backfillMissingSnapshots(userId);

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

export async function backfillMissingSnapshots(userId: string): Promise<void> {
  try {
    const profileResult = await prisma.financialProfile.findUnique({ where: { userId } });
    if (!profileResult) return;
    const profile = profileResult as unknown as SnapshotProfile;

    // Get all user loans
    const loans = await prisma.loan.findMany({ where: { userId } });
    if (loans.length === 0) return;

    // Get user registration date
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!userRecord) return;

    const earliestDate = userRecord.createdAt;
    const startYear = earliestDate.getFullYear();
    const startMonth = earliestDate.getMonth();

    // Clean up any historical snapshots created before the user's registration date
    const registrationMonthStart = new Date(startYear, startMonth, 1);
    await prisma.healthSnapshot.deleteMany({
      where: {
        userId,
        capturedAt: {
          lt: registrationMonthStart,
        },
      },
    });

    const now = new Date();
    const periods = generateMonthlyRanges(earliestDate, now);

    for (const period of periods) {
      const targetDate = period.start;
      const targetDateEnd = period.end;

      // Check if snapshot already exists for this month
      const nextMonthStart = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
      const existing = await prisma.healthSnapshot.findFirst({
        where: {
          userId,
          capturedAt: {
            gte: targetDate,
            lt: nextMonthStart,
          },
        },
      });

      if (!existing) {
        // Find active loans in this target month
        const activeLoansInMonth = loans.filter((loan) => new Date(loan.startDate) <= targetDateEnd);

        if (activeLoansInMonth.length > 0) {
          // Reconstruct balances for each loan in this target month
          const reconstructedLoans = await Promise.all(
            activeLoansInMonth.map(async (loan) => {
              // Sum payments made after targetDateEnd
              const paymentsAfter = await prisma.payment.findMany({
                where: {
                  loanId: loan.id,
                  paymentDate: { gt: targetDateEnd },
                },
              });
              const paidAfter = paymentsAfter.reduce((sum, p) => sum + p.amount, 0);
              const balanceInMonth = Math.min(loan.principal, loan.outstandingBalance + paidAfter);

              return {
                ...loan,
                outstandingBalance: balanceInMonth,
              };
            })
          );

          const totalEMI = reconstructedLoans.reduce((sum, l) => sum + l.emiAmount, 0);
          const totalOutstanding = reconstructedLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
          const otherMonthlyDebt = typeof profile.otherMonthlyDebt === "number" ? profile.otherMonthlyDebt : 0;
          const totalMonthlyDebt = totalEMI + otherMonthlyDebt;

          const affordability = calculateAffordabilityScore({
            monthlyIncome: profile.monthlyIncome,
            monthlyExpenses: profile.monthlyExpenses,
            totalMonthlyEMI: totalEMI,
            creditScoreRange: profile.creditScoreRange,
            hasEmergencyFund: profile.hasEmergencyFund,
            emergencyFundMonths: profile.emergencyFundMonths,
            loans: reconstructedLoans.map((l) => ({
              annualRate: l.interestRate,
              tenureMonths: l.tenureMonths,
              rateType: l.rateType,
            })),
          });

          // Create the snapshot record
          await prisma.healthSnapshot.create({
            data: {
              userId,
              capturedAt: targetDate,
              affordabilityScore: affordability.score,
              dtiRatio: profile.monthlyIncome > 0 ? totalMonthlyDebt / profile.monthlyIncome : 0,
              emiToIncomeRatio: profile.monthlyIncome > 0 ? totalEMI / profile.monthlyIncome : 0,
              totalOutstanding,
              totalEMI,
              activeLoans: reconstructedLoans.length,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to backfill missing snapshots:", error);
  }
}
