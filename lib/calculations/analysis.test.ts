import { describe, it, expect } from "vitest";
import {
  detectInterestLeaks,
  loanHealthScore,
  monthsSince,
  type LoanInput,
  type FinancialProfileInput,
} from "./analysis";

const baseProfile: FinancialProfileInput = {
  monthlyIncome: 100000,
  monthlyExpenses: 40000,
  hasEmergencyFund: false,
  emergencyFundMonths: 0,
};

describe("detectInterestLeaks", () => {
  it("should detect HIGH_RATE_PERSONAL_LOAN when home loan exists", () => {
    const loans: LoanInput[] = [
      { id: "1", name: "Home Loan", loanType: "HOME", interestRate: 8.5, rateType: "FIXED", tenureMonths: 240, outstandingBalance: 3000000, emiAmount: 30000 },
      { id: "2", name: "Personal Loan", loanType: "PERSONAL", interestRate: 18, rateType: "FIXED", tenureMonths: 36, outstandingBalance: 200000, emiAmount: 8000 },
    ];

    const leaks = detectInterestLeaks(loans, baseProfile);
    const personalLeaks = leaks.filter((l) => l.type === "HIGH_RATE_PERSONAL_LOAN");

    expect(personalLeaks.length).toBe(1);
    expect(personalLeaks[0].loanName).toBe("Personal Loan");
    expect(personalLeaks[0].annualLeakAmount).toBeGreaterThan(0);
  });

  it("should detect FLOATING_RATE_RISK for long-tenure floating loans", () => {
    const loans: LoanInput[] = [
      { id: "1", name: "Home Loan", loanType: "HOME", interestRate: 8.5, rateType: "FLOATING", tenureMonths: 240, outstandingBalance: 3000000, emiAmount: 30000 },
    ];

    const leaks = detectInterestLeaks(loans, baseProfile);
    const floatingLeaks = leaks.filter((l) => l.type === "FLOATING_RATE_RISK");

    expect(floatingLeaks.length).toBe(1);
  });

  it("should NOT detect FLOATING_RATE_RISK for short-tenure loans", () => {
    const loans: LoanInput[] = [
      { id: "1", name: "Car Loan", loanType: "VEHICLE", interestRate: 11, rateType: "FLOATING", tenureMonths: 48, outstandingBalance: 400000, emiAmount: 12000 },
    ];

    const leaks = detectInterestLeaks(loans, baseProfile);
    const floatingLeaks = leaks.filter((l) => l.type === "FLOATING_RATE_RISK");

    expect(floatingLeaks.length).toBe(0);
  });

  it("should detect HIGH_EMI_LOW_PRINCIPAL when interest ratio > 80%", () => {
    const loans: LoanInput[] = [
      {
        id: "1", name: "Home Loan", loanType: "HOME",
        interestRate: 10, rateType: "FIXED", tenureMonths: 240,
        // Monthly interest = 3000000 * 10/1200 = 25000
        // EMI ratio = 25000 / 28000 ≈ 0.89 → should trigger
        outstandingBalance: 3000000, emiAmount: 28000,
      },
    ];

    const leaks = detectInterestLeaks(loans, baseProfile);
    const highInterestLeaks = leaks.filter((l) => l.type === "HIGH_EMI_LOW_PRINCIPAL");

    expect(highInterestLeaks.length).toBe(1);
  });

  it("should detect IDLE_BALANCE_OPPORTUNITY for excess emergency fund", () => {
    const profileWithExcess: FinancialProfileInput = {
      ...baseProfile,
      hasEmergencyFund: true,
      emergencyFundMonths: 12, // 6 months excess
    };

    const loans: LoanInput[] = [
      { id: "1", name: "Personal Loan", loanType: "PERSONAL", interestRate: 16, rateType: "FIXED", tenureMonths: 36, outstandingBalance: 200000, emiAmount: 8000 },
    ];

    const leaks = detectInterestLeaks(loans, profileWithExcess);
    const idleLeaks = leaks.filter((l) => l.type === "IDLE_BALANCE_OPPORTUNITY");

    expect(idleLeaks.length).toBe(1);
    expect(idleLeaks[0].annualLeakAmount).toBeGreaterThan(0);
  });

  it("should return leaks sorted by annualLeakAmount descending", () => {
    const loans: LoanInput[] = [
      { id: "1", name: "Home Loan", loanType: "HOME", interestRate: 8.5, rateType: "FLOATING", tenureMonths: 240, outstandingBalance: 3000000, emiAmount: 30000 },
      { id: "2", name: "Personal Loan", loanType: "PERSONAL", interestRate: 18, rateType: "FIXED", tenureMonths: 36, outstandingBalance: 200000, emiAmount: 8000 },
    ];

    const leaks = detectInterestLeaks(loans, baseProfile);

    for (let i = 1; i < leaks.length; i++) {
      expect(leaks[i - 1].annualLeakAmount).toBeGreaterThanOrEqual(leaks[i].annualLeakAmount);
    }
  });

  it("should return empty array for no loans", () => {
    const leaks = detectInterestLeaks([], baseProfile);
    expect(leaks).toEqual([]);
  });
});

describe("loanHealthScore", () => {
  it("should return 100 for a perfect loan", () => {
    const score = loanHealthScore({
      interestRate: 7,
      rateType: "FIXED",
      tenureMonths: 60,
      emiAmount: 5000,
      monthlyIncome: 100000,
      outstandingBalance: 0,
      principal: 300000,
    });

    expect(score).toBe(100);
  });

  it("should penalize high interest rates", () => {
    const lowRate = loanHealthScore({
      interestRate: 8, rateType: "FIXED", tenureMonths: 60,
      emiAmount: 10000, monthlyIncome: 100000,
      outstandingBalance: 400000, principal: 500000,
    });

    const highRate = loanHealthScore({
      interestRate: 18, rateType: "FIXED", tenureMonths: 60,
      emiAmount: 10000, monthlyIncome: 100000,
      outstandingBalance: 400000, principal: 500000,
    });

    expect(highRate).toBeLessThan(lowRate);
  });

  it("should penalize high EMI-to-income ratio", () => {
    const lowRatio = loanHealthScore({
      interestRate: 10, rateType: "FIXED", tenureMonths: 60,
      emiAmount: 10000, monthlyIncome: 100000,
      outstandingBalance: 400000, principal: 500000,
    });

    const highRatio = loanHealthScore({
      interestRate: 10, rateType: "FIXED", tenureMonths: 60,
      emiAmount: 40000, monthlyIncome: 100000,
      outstandingBalance: 400000, principal: 500000,
    });

    expect(highRatio).toBeLessThan(lowRatio);
  });

  it("should always be between 0 and 100", () => {
    // Worst case scenario
    const worstScore = loanHealthScore({
      interestRate: 24, rateType: "FLOATING", tenureMonths: 240,
      emiAmount: 50000, monthlyIncome: 100000,
      outstandingBalance: 1000000, principal: 1000000,
    });

    expect(worstScore).toBeGreaterThanOrEqual(0);
    expect(worstScore).toBeLessThanOrEqual(100);
  });
});

describe("monthsSince", () => {
  it("should return 0 for null/undefined input", () => {
    expect(monthsSince(null)).toBe(0);
    expect(monthsSince(undefined)).toBe(0);
  });

  it("should return 0 for future dates", () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(monthsSince(futureDate)).toBe(0);
  });

  it("should return positive months for past dates", () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    expect(monthsSince(pastDate)).toBeGreaterThanOrEqual(11);
    expect(monthsSince(pastDate)).toBeLessThanOrEqual(13);
  });

  it("should accept string dates", () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    expect(monthsSince(oneYearAgo.toISOString())).toBeGreaterThanOrEqual(11);
  });

  it("should return 0 for invalid strings", () => {
    expect(monthsSince("not-a-date")).toBe(0);
  });
});
