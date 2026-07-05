import { describe, it, expect } from "vitest";
import {
  generateAmortizationSchedule,
  getScheduleSummary,
} from "./amortization";

describe("generateAmortizationSchedule", () => {
  it("should generate a correct schedule for a standard loan", () => {
    // ₹10,00,000 at 10% for 120 months
    const schedule = generateAmortizationSchedule(1000000, 10, 120);

    expect(schedule.length).toBe(120);
    expect(schedule[0].month).toBe(1);
    expect(schedule[119].month).toBe(120);

    // Final balance should be 0
    expect(schedule[119].outstandingBalance).toBe(0);

    // First month interest should be 10% / 12 * 10L ≈ 8333.33
    expect(schedule[0].interestComponent).toBeCloseTo(8333.33, 0);

    // Every entry should have positive principal and interest
    for (const entry of schedule) {
      expect(entry.principalComponent).toBeGreaterThanOrEqual(0);
      expect(entry.interestComponent).toBeGreaterThanOrEqual(0);
      expect(entry.emi).toBeGreaterThan(0);
    }
  });

  it("should handle 0% interest rate", () => {
    const schedule = generateAmortizationSchedule(120000, 0, 12);

    expect(schedule.length).toBe(12);

    // Each EMI should be exactly principal / tenure
    for (const entry of schedule) {
      expect(entry.emi).toBeCloseTo(10000, 0);
      expect(entry.interestComponent).toBe(0);
    }

    expect(schedule[11].outstandingBalance).toBe(0);
  });

  it("should handle extra prepayments that shorten tenure", () => {
    const scheduleNoExtra = generateAmortizationSchedule(500000, 12, 60);
    const scheduleWithExtra = generateAmortizationSchedule(500000, 12, 60, 5000);

    // Extra payment should result in shorter tenure
    expect(scheduleWithExtra.length).toBeLessThan(scheduleNoExtra.length);

    // Both should end with 0 balance
    expect(scheduleNoExtra[scheduleNoExtra.length - 1].outstandingBalance).toBe(0);
    expect(scheduleWithExtra[scheduleWithExtra.length - 1].outstandingBalance).toBe(0);
  });

  it("should handle very large principal (₹10 Crore)", () => {
    const schedule = generateAmortizationSchedule(100000000, 8.5, 240);

    expect(schedule.length).toBe(240);
    expect(schedule[239].outstandingBalance).toBe(0);

    // Total interest paid should be a meaningful positive number
    const summary = getScheduleSummary(schedule);
    expect(summary.totalInterest).toBeGreaterThan(0);
  });

  it("should return empty array for invalid inputs", () => {
    expect(generateAmortizationSchedule(-1000, 10, 12)).toEqual([]);
    expect(generateAmortizationSchedule(1000, -1, 12)).toEqual([]);
    expect(generateAmortizationSchedule(1000, 10, 0)).toEqual([]);
    expect(generateAmortizationSchedule(1000, 10, 12, -1)).toEqual([]);
  });

  it("should handle a fixed EMI override", () => {
    const schedule = generateAmortizationSchedule(100000, 10, 12, 0, 15000);

    // Should end sooner since fixedEmi is higher than standard EMI
    expect(schedule.length).toBeLessThanOrEqual(12);
    expect(schedule[schedule.length - 1].outstandingBalance).toBe(0);
  });

  it("should have decreasing interest and increasing principal over time", () => {
    const schedule = generateAmortizationSchedule(500000, 12, 60);

    // Interest should decrease from first month to last
    expect(schedule[0].interestComponent).toBeGreaterThan(
      schedule[schedule.length - 1].interestComponent
    );

    // Principal should increase from first month to last
    expect(schedule[0].principalComponent).toBeLessThan(
      schedule[schedule.length - 2].principalComponent // second to last avoids the capped final payment
    );
  });
});

describe("getScheduleSummary", () => {
  it("should calculate correct totals", () => {
    const schedule = generateAmortizationSchedule(1000000, 10, 120);
    const summary = getScheduleSummary(schedule);

    expect(summary.months).toBe(120);
    expect(summary.finalBalance).toBe(0);

    // Total paid = total interest + principal
    expect(summary.totalPaid).toBeCloseTo(
      summary.totalInterest + 1000000,
      -2 // allow rounding within ₹100
    );

    // For a 10L loan at 10% for 10 years, total interest should be around ₹5.85L
    expect(summary.totalInterest).toBeGreaterThan(500000);
    expect(summary.totalInterest).toBeLessThan(700000);
  });

  it("should return zeros for empty schedule", () => {
    const summary = getScheduleSummary([]);

    expect(summary.totalInterest).toBe(0);
    expect(summary.totalPaid).toBe(0);
    expect(summary.months).toBe(0);
    expect(summary.finalBalance).toBe(0);
  });
});
