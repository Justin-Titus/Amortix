import { describe, expect, it } from "vitest";
import { optimizeEMIAllocation, type LoanState } from "@/lib/ml/emi-optimizer";

const loans: LoanState[] = [
  {
    id: "loan-a",
    name: "Personal Loan",
    outstanding: 500000,
    annualRate: 16,
    emi: 18000,
  },
  {
    id: "loan-b",
    name: "Home Loan",
    outstanding: 2500000,
    annualRate: 8.5,
    emi: 26000,
  },
];

describe("optimizeEMIAllocation", () => {
  it("allocates budget and returns complete outputs", () => {
    const result = optimizeEMIAllocation(loans, 5000);

    const totalExtra = result.allocations.reduce((sum, item) => sum + item.extraAllocation, 0);
    expect(totalExtra).toBeLessThanOrEqual(5000);
    expect(result.allocations).toHaveLength(2);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
  });

  it("returns zero-allocation behavior with zero budget", () => {
    const result = optimizeEMIAllocation(loans, 0);

    expect(result.allocations.every((item) => item.extraAllocation === 0)).toBe(true);
    expect(result.totalInterestSaved).toBeGreaterThanOrEqual(0);
    expect(result.monthsSaved).toBeGreaterThanOrEqual(0);
  });
});
