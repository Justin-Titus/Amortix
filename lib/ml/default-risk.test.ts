import { describe, expect, it } from "vitest";
import { predictDefaultRisk, type DefaultRiskInput } from "@/lib/ml/default-risk";

const baseInput: DefaultRiskInput = {
  monthlyIncome: 100000,
  monthlyExpenses: 40000,
  employmentType: "SALARIED",
  hasEmergencyFund: true,
  emergencyFundMonths: 6,
  creditScoreRange: "750-800",
  loanType: "HOME",
  interestRate: 8.5,
  rateType: "FIXED",
  tenureMonths: 240,
  outstandingBalance: 3000000,
  emiAmount: 28000,
  monthsActive: 60,
  totalMonthlyEMI: 28000,
  numberOfActiveLoans: 1,
  debtToIncomeRatio: 0.28,
};

describe("predictDefaultRisk", () => {
  it("returns bounded probability and score", () => {
    const result = predictDefaultRisk(baseInput);

    expect(result.probability).toBeGreaterThanOrEqual(0);
    expect(result.probability).toBeLessThanOrEqual(1);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.topFactors.length).toBe(3);
  });

  it("increases risk under weaker repayment conditions", () => {
    const safer = predictDefaultRisk(baseInput);
    const riskier = predictDefaultRisk({
      ...baseInput,
      debtToIncomeRatio: 0.62,
      emiAmount: 55000,
      monthlyExpenses: 70000,
      hasEmergencyFund: false,
      emergencyFundMonths: 0,
      creditScoreRange: "650-700",
      employmentType: "OTHER",
      rateType: "FLOATING",
      interestRate: 15,
      numberOfActiveLoans: 4,
      monthsActive: 3,
    });

    expect(riskier.probability).toBeGreaterThan(safer.probability);
    expect(riskier.riskScore).toBeGreaterThan(safer.riskScore);
  });
});
