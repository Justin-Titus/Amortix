import { describe, it, expect } from "vitest";
import {
  calculateEMI,
  totalInterest,
  totalAmount,
  calculateTotalInterest,
  calculateTenure,
} from "./emi";

describe("calculateEMI", () => {
  it("should calculate correct EMI for a known loan", () => {
    // ₹10,00,000 at 10% for 120 months
    // Known EMI ≈ ₹13,215
    const emi = calculateEMI(1000000, 10, 120);
    expect(emi).toBeGreaterThan(13000);
    expect(emi).toBeLessThan(13500);
  });

  it("should handle 0% interest rate", () => {
    const emi = calculateEMI(120000, 0, 12);
    expect(emi).toBe(10000);
  });

  it("should handle 1-month tenure", () => {
    const emi = calculateEMI(100000, 12, 1);
    // For 1 month: principal + 1 month interest = 100000 + 1000 = 101000
    expect(emi).toBeCloseTo(101000, -2);
  });

  it("should throw for invalid inputs", () => {
    expect(() => calculateEMI(-1000, 10, 12)).toThrow();
    expect(() => calculateEMI(1000, -1, 12)).toThrow();
    expect(() => calculateEMI(1000, 10, 0)).toThrow();
    expect(() => calculateEMI(NaN, 10, 12)).toThrow();
    expect(() => calculateEMI(1000, 10, Infinity)).toThrow();
  });

  it("should produce a higher EMI for a higher interest rate", () => {
    const emiLow = calculateEMI(500000, 8, 60);
    const emiHigh = calculateEMI(500000, 15, 60);
    expect(emiHigh).toBeGreaterThan(emiLow);
  });

  it("should produce a higher EMI for a shorter tenure", () => {
    const emiShort = calculateEMI(500000, 10, 36);
    const emiLong = calculateEMI(500000, 10, 60);
    expect(emiShort).toBeGreaterThan(emiLong);
  });
});

describe("totalInterest", () => {
  it("should calculate total interest correctly", () => {
    const emi = 13215;
    const result = totalInterest(emi, 120, 1000000);
    // 13215 * 120 - 1000000 = 585800
    expect(result).toBe(13215 * 120 - 1000000);
  });
});

describe("totalAmount", () => {
  it("should calculate total amount correctly", () => {
    expect(totalAmount(13215, 120)).toBe(13215 * 120);
  });
});

describe("calculateTotalInterest", () => {
  it("should be consistent with totalInterest (backward compat)", () => {
    const emi = 13215;
    const principal = 1000000;
    const tenure = 120;

    expect(calculateTotalInterest(principal, emi, tenure)).toBe(
      totalInterest(emi, tenure, principal)
    );
  });
});

describe("calculateTenure", () => {
  it("should calculate tenure that roughly matches calculateEMI inverse", () => {
    const principal = 500000;
    const rate = 10;
    const emi = calculateEMI(principal, rate, 60);

    const calculatedTenure = calculateTenure(principal, rate, emi);
    expect(calculatedTenure).toBeCloseTo(60, 0);
  });

  it("should handle 0% interest rate", () => {
    const tenure = calculateTenure(120000, 0, 10000);
    expect(tenure).toBe(12);
  });

  it("should return 0 if EMI is less than monthly interest", () => {
    // Monthly interest on 10L at 12% = ₹10,000
    // If EMI is ₹9,000, loan can never be paid off
    const tenure = calculateTenure(1000000, 12, 9000);
    expect(tenure).toBe(0);
  });
});
