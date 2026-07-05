import { describe, it, expect } from "vitest";
import {
  calculateMinimumPaymentBaseline,
  calculateStrategy,
  compareAllStrategies,
  type StrategyLoanInput,
} from "./strategies";

const sampleLoans: StrategyLoanInput[] = [
  { id: "1", name: "Personal Loan", outstanding: 200000, annualRate: 16, emi: 5000 },
  { id: "2", name: "Home Loan", outstanding: 3000000, annualRate: 8.5, emi: 30000 },
  { id: "3", name: "Car Loan", outstanding: 500000, annualRate: 11, emi: 12000 },
];

describe("calculateMinimumPaymentBaseline", () => {
  it("should compute positive total interest and a finite month count", () => {
    const result = calculateMinimumPaymentBaseline(sampleLoans);

    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.months).toBeGreaterThan(0);
    expect(result.months).toBeLessThanOrEqual(600);
  });

  it("should handle a single loan", () => {
    const result = calculateMinimumPaymentBaseline([
      { id: "1", name: "Loan A", outstanding: 100000, annualRate: 10, emi: 5000 },
    ]);

    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.months).toBeGreaterThan(0);
  });

  it("should not mutate input loans", () => {
    const loans: StrategyLoanInput[] = [
      { id: "1", name: "Loan A", outstanding: 100000, annualRate: 10, emi: 5000 },
    ];
    const originalOutstanding = loans[0].outstanding;

    calculateMinimumPaymentBaseline(loans);

    expect(loans[0].outstanding).toBe(originalOutstanding);
  });
});

describe("calculateStrategy", () => {
  it("avalanche should save more or equal interest vs snowball", () => {
    const extraBudget = 5000;

    const avalanche = calculateStrategy(sampleLoans, extraBudget, "avalanche");
    const snowball = calculateStrategy(sampleLoans, extraBudget, "snowball");

    // Avalanche targets highest rate first → should always save more interest
    expect(avalanche.totalInterestPaid).toBeLessThanOrEqual(snowball.totalInterestPaid);
  });

  it("all strategies should pay off all debt (balance → 0)", () => {
    const extraBudget = 3000;

    for (const strategy of ["avalanche", "snowball", "hybrid"] as const) {
      const result = calculateStrategy(sampleLoans, extraBudget, strategy);

      const lastMonth = result.schedule[result.schedule.length - 1];
      expect(lastMonth.totalDebtRemaining).toBe(0);
    }
  });

  it("extra budget should reduce total interest vs baseline", () => {
    const baseline = calculateMinimumPaymentBaseline(sampleLoans);
    const withExtra = calculateStrategy(sampleLoans, 5000, "avalanche");

    expect(withExtra.totalInterestPaid).toBeLessThan(baseline.totalInterest);
    expect(withExtra.monthsToPayoff).toBeLessThanOrEqual(baseline.months);
  });

  it("should handle one-time payment in month 1", () => {
    const withoutOneTime = calculateStrategy(sampleLoans, 3000, "avalanche", 0);
    const withOneTime = calculateStrategy(sampleLoans, 3000, "avalanche", 50000);

    expect(withOneTime.totalInterestPaid).toBeLessThan(withoutOneTime.totalInterestPaid);
  });

  it("totalSavedVsMinimum should be positive when extra budget is provided", () => {
    const result = calculateStrategy(sampleLoans, 5000, "avalanche");
    expect(result.totalSavedVsMinimum).toBeGreaterThan(0);
  });

  it("should not mutate input loans", () => {
    const loans: StrategyLoanInput[] = [
      { id: "1", name: "Loan A", outstanding: 200000, annualRate: 16, emi: 5000 },
    ];
    const original = loans[0].outstanding;

    calculateStrategy(loans, 3000, "avalanche");

    expect(loans[0].outstanding).toBe(original);
  });
});

describe("compareAllStrategies", () => {
  it("should return all three strategies plus baseline", () => {
    const result = compareAllStrategies(sampleLoans, 5000);

    expect(result.avalanche).toBeDefined();
    expect(result.snowball).toBeDefined();
    expect(result.hybrid).toBeDefined();
    expect(result.baseline).toBeDefined();

    expect(result.avalanche.strategy).toBe("avalanche");
    expect(result.snowball.strategy).toBe("snowball");
    expect(result.hybrid.strategy).toBe("hybrid");
  });

  it("all strategies should save vs baseline", () => {
    const result = compareAllStrategies(sampleLoans, 5000);

    expect(result.avalanche.totalInterestPaid).toBeLessThan(result.baseline.totalInterest);
    expect(result.snowball.totalInterestPaid).toBeLessThan(result.baseline.totalInterest);
    expect(result.hybrid.totalInterestPaid).toBeLessThan(result.baseline.totalInterest);
  });
});
