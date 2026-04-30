import { describe, expect, it } from "vitest";
import { detectInterestLeaks, type FinancialProfileInput, type LoanInput } from "@/lib/analysis/interest-leak";

const profile: FinancialProfileInput = {
  monthlyIncome: 120000,
  monthlyExpenses: 50000,
  hasEmergencyFund: true,
  emergencyFundMonths: 9,
};

const loans: LoanInput[] = [
  {
    id: "l1",
    name: "Personal Express",
    loanType: "PERSONAL",
    interestRate: 17,
    rateType: "FLOATING",
    tenureMonths: 180,
    outstandingBalance: 650000,
    emiAmount: 13000,
  },
  {
    id: "l2",
    name: "Home Advantage",
    loanType: "HOME",
    interestRate: 9,
    rateType: "FIXED",
    tenureMonths: 240,
    outstandingBalance: 3000000,
    emiAmount: 26000,
  },
];

describe("detectInterestLeaks", () => {
  it("detects multiple leak categories and sorts by annual amount", () => {
    const leaks = detectInterestLeaks(loans, profile);

    expect(leaks.length).toBeGreaterThan(0);
    expect(leaks[0].annualLeakAmount).toBeGreaterThanOrEqual(leaks[leaks.length - 1].annualLeakAmount);
    expect(leaks.some((leak) => leak.type === "HIGH_RATE_PERSONAL_LOAN")).toBe(true);
    expect(leaks.some((leak) => leak.type === "FLOATING_RATE_RISK")).toBe(true);
  });

  it("returns no leaks for low-risk profile and loans", () => {
    const noLeakLoans: LoanInput[] = [
      {
        id: "l3",
        name: "Low Risk Home",
        loanType: "HOME",
        interestRate: 8,
        rateType: "FIXED",
        tenureMonths: 96,
        outstandingBalance: 400000,
        emiAmount: 25000,
      },
    ];

    const noLeakProfile: FinancialProfileInput = {
      monthlyIncome: 150000,
      monthlyExpenses: 40000,
      hasEmergencyFund: false,
      emergencyFundMonths: 0,
    };

    const leaks = detectInterestLeaks(noLeakLoans, noLeakProfile);
    expect(leaks).toHaveLength(0);
  });
});
