export type LeakType =
  | "HIGH_RATE_PERSONAL_LOAN"
  | "FLOATING_RATE_RISK"
  | "SUBOPTIMAL_TENURE"
  | "IDLE_BALANCE_OPPORTUNITY"
  | "HIGH_EMI_LOW_PRINCIPAL"
  | "LOAN_ORDERING_INEFFICIENCY";

export interface FinancialProfileInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  hasEmergencyFund: boolean;
  emergencyFundMonths: number;
}

export interface LoanInput {
  id: string;
  name: string;
  loanType: string;
  interestRate: number;
  rateType: "FIXED" | "FLOATING";
  tenureMonths: number;
  outstandingBalance: number;
  emiAmount: number;
}

export interface InterestLeak {
  type: LeakType;
  loanId: string;
  loanName: string;
  severity: "low" | "medium" | "high";
  annualLeakAmount: number;
  fixDescription: string;
  actionLabel: string;
  actionRoute: string;
}

export function detectInterestLeaks(
  loans: LoanInput[],
  profile: FinancialProfileInput
): InterestLeak[] {
  const leaks: InterestLeak[] = [];

  const personalLoans = loans.filter((loan) => loan.loanType === "PERSONAL" && loan.interestRate > 13);
  const homeLoan = loans.find((loan) => loan.loanType === "HOME");

  if (personalLoans.length > 0 && homeLoan) {
    for (const personalLoan of personalLoans) {
      const rateDiff = personalLoan.interestRate - homeLoan.interestRate;
      const annualLeak = personalLoan.outstandingBalance * (rateDiff / 100);

      leaks.push({
        type: "HIGH_RATE_PERSONAL_LOAN",
        loanId: personalLoan.id,
        loanName: personalLoan.name,
        severity: annualLeak > 50000 ? "high" : "medium",
        annualLeakAmount: annualLeak,
        fixDescription: `You are paying ${personalLoan.interestRate}% on this loan while your home loan is at ${homeLoan.interestRate}%. A home loan top-up could save you Rs ${Math.round(annualLeak).toLocaleString("en-IN")} per year.`,
        actionLabel: "See prepayment options",
        actionRoute: `/loans/${personalLoan.id}`,
      });
    }
  }

  loans
    .filter((loan) => loan.rateType === "FLOATING" && loan.tenureMonths > 120)
    .forEach((loan) => {
      const riskPremium = loan.outstandingBalance * 0.015;
      leaks.push({
        type: "FLOATING_RATE_RISK",
        loanId: loan.id,
        loanName: loan.name,
        severity: "medium",
        annualLeakAmount: riskPremium,
        fixDescription: `A 1.5% rate rise on this floating loan would cost you Rs ${Math.round(riskPremium).toLocaleString("en-IN")} more per year. Consider fixing the rate if your bank offers it.`,
        actionLabel: "Model rate risk",
        actionRoute: "/strategy",
      });
    });

  loans.forEach((loan) => {
    const monthInterestRate = loan.interestRate / 12 / 100;
    const monthlyInterest = loan.outstandingBalance * monthInterestRate;
    const interestRatio = loan.emiAmount > 0 ? monthlyInterest / loan.emiAmount : 0;

    if (interestRatio > 0.8) {
      leaks.push({
        type: "HIGH_EMI_LOW_PRINCIPAL",
        loanId: loan.id,
        loanName: loan.name,
        severity: interestRatio > 0.9 ? "high" : "medium",
        annualLeakAmount: monthlyInterest * 12 * 0.15,
        fixDescription: `${Math.round(interestRatio * 100)}% of each EMI on this loan goes to interest, only ${Math.round((1 - interestRatio) * 100)}% to principal. A Rs 10,000 prepayment now would save significantly.`,
        actionLabel: "Calculate prepayment impact",
        actionRoute: `/loans/${loan.id}`,
      });
    }
  });

  if (profile.hasEmergencyFund && profile.emergencyFundMonths > 6) {
    const excessMonths = profile.emergencyFundMonths - 6;
    const highestRateLoan = [...loans].sort((a, b) => b.interestRate - a.interestRate)[0];

    if (highestRateLoan) {
      const totalEMI = loans.reduce((sum, loan) => sum + loan.emiAmount, 0);
      const excessFund = excessMonths * (profile.monthlyExpenses + totalEMI);
      const annualSaving = excessFund * (highestRateLoan.interestRate / 100);

      leaks.push({
        type: "IDLE_BALANCE_OPPORTUNITY",
        loanId: highestRateLoan.id,
        loanName: highestRateLoan.name,
        severity: annualSaving > 30000 ? "high" : "low",
        annualLeakAmount: annualSaving,
        fixDescription: `You have ${excessMonths} months of extra emergency fund beyond the recommended 6. Using Rs ${Math.round(excessFund).toLocaleString("en-IN")} to prepay your ${highestRateLoan.interestRate}% loan could save Rs ${Math.round(annualSaving).toLocaleString("en-IN")} in interest this year.`,
        actionLabel: "Simulate prepayment",
        actionRoute: `/loans/${highestRateLoan.id}`,
      });
    }
  }

  return leaks.sort((a, b) => b.annualLeakAmount - a.annualLeakAmount);
}
