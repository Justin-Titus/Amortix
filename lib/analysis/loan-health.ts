export interface LoanHealthLoanInput {
  interestRate: number;
  rateType: "FIXED" | "FLOATING";
  tenureMonths: number;
  emiAmount: number;
  monthlyIncome: number;
  outstandingBalance: number;
  principal: number;
}

export function loanHealthScore(input: LoanHealthLoanInput): number {
  let score = 100;

  if (input.interestRate > 15) score -= 25;
  else if (input.interestRate > 12) score -= 15;
  else if (input.interestRate > 9) score -= 5;

  if (input.rateType === "FLOATING" && input.tenureMonths > 120) score -= 15;

  const emiRatio = input.monthlyIncome > 0 ? input.emiAmount / input.monthlyIncome : 1;
  if (emiRatio > 0.3) score -= 20;
  else if (emiRatio > 0.2) score -= 10;

  const paidRatio = 1 - input.outstandingBalance / Math.max(input.principal, 1);
  score += Math.round(paidRatio * 15);

  return Math.max(0, Math.min(100, score));
}
