import { describe, it, expect } from "vitest";
import {
  formatDateKey,
  parseDateKey,
  getLoanDueDateForMonth,
  buildCalendarData,
  generateMonthlyRanges,
  type RawLoan,
} from "./calendar";

describe("formatDateKey", () => {
  it("should format date as YYYY-MM-DD with zero padding", () => {
    expect(formatDateKey(new Date(2025, 0, 5))).toBe("2025-01-05");
    expect(formatDateKey(new Date(2025, 11, 25))).toBe("2025-12-25");
  });
});

describe("parseDateKey", () => {
  it("should parse YYYY-MM-DD string into correct date", () => {
    const date = parseDateKey("2025-06-15");
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(5); // 0-indexed
    expect(date.getDate()).toBe(15);
  });

  it("should round-trip with formatDateKey", () => {
    const original = "2025-02-28";
    const parsed = parseDateKey(original);
    expect(formatDateKey(parsed)).toBe(original);
  });
});

describe("getLoanDueDateForMonth", () => {
  const baseLoan: RawLoan = {
    id: "1",
    name: "Test Loan",
    emiAmount: 10000,
    nextEmiDate: "2025-01-15",
    startDate: "2024-01-15",
    payments: [],
  };

  it("should return the due date clamped to the given month", () => {
    const currentMonth = new Date(2025, 5, 1); // June 2025
    const dueDate = getLoanDueDateForMonth(baseLoan, currentMonth);

    expect(dueDate).not.toBeNull();
    expect(dueDate!.getMonth()).toBe(5); // June
    expect(dueDate!.getDate()).toBe(15);
  });

  it("should clamp day for February (non-leap year)", () => {
    const loan: RawLoan = {
      ...baseLoan,
      nextEmiDate: "2025-01-31", // anchor day = 31
    };

    const feb = new Date(2025, 1, 1); // Feb 2025
    const dueDate = getLoanDueDateForMonth(loan, feb);

    expect(dueDate).not.toBeNull();
    expect(dueDate!.getDate()).toBe(28); // Feb 2025 has 28 days
  });

  it("should clamp day for February (leap year)", () => {
    const loan: RawLoan = {
      ...baseLoan,
      nextEmiDate: "2024-01-31", // anchor day = 31
    };

    const feb = new Date(2024, 1, 1); // Feb 2024 (leap year)
    const dueDate = getLoanDueDateForMonth(loan, feb);

    expect(dueDate).not.toBeNull();
    expect(dueDate!.getDate()).toBe(29); // Feb 2024 has 29 days
  });

  it("should return null if the due date is before the anchor", () => {
    const loan: RawLoan = {
      ...baseLoan,
      nextEmiDate: "2025-06-15",
    };

    const priorMonth = new Date(2025, 4, 1); // May 2025
    const dueDate = getLoanDueDateForMonth(loan, priorMonth);

    expect(dueDate).toBeNull();
  });
});

describe("buildCalendarData", () => {
  const today = new Date(2025, 5, 10); // June 10, 2025

  const loans: RawLoan[] = [
    {
      id: "1",
      name: "Home Loan",
      emiAmount: 30000,
      nextEmiDate: "2025-06-15",
      startDate: "2024-01-15",
      payments: [],
    },
    {
      id: "2",
      name: "Car Loan",
      emiAmount: 12000,
      nextEmiDate: "2025-06-20",
      startDate: "2024-06-20",
      payments: [
        { amount: 12000, date: "2025-06-18", type: "EMI" },
      ],
    },
  ];

  it("should build entries for the current month", () => {
    const currentMonth = new Date(2025, 5, 1); // June 2025
    const result = buildCalendarData(loans, currentMonth, today);

    // Should have entries for June 15 and June 20
    expect(result.days["2025-06-15"]).toBeDefined();
    expect(result.days["2025-06-20"]).toBeDefined();
  });

  it("should correctly identify paid vs pending status", () => {
    const currentMonth = new Date(2025, 5, 1);
    const result = buildCalendarData(loans, currentMonth, today);

    // Home Loan: no payments → pending (due date June 15 is after today June 10)
    const homeLoanEntry = result.days["2025-06-15"].loans.find((l) => l.loanId === "1");
    expect(homeLoanEntry?.status).toBe("pending");

    // Car Loan: fully paid
    const carLoanEntry = result.days["2025-06-20"].loans.find((l) => l.loanId === "2");
    expect(carLoanEntry?.status).toBe("paid");
    expect(carLoanEntry?.paidAmount).toBe(12000);
  });

  it("should compute dueIn30 correctly", () => {
    const currentMonth = new Date(2025, 5, 1);
    const result = buildCalendarData(loans, currentMonth, today);

    // Both loans have due dates within 30 days of June 10
    expect(result.dueIn30.length).toBeGreaterThanOrEqual(2);
    expect(result.totalDueIn30).toBeGreaterThan(0);
  });

  it("should handle empty loans array", () => {
    const result = buildCalendarData([], new Date(2025, 5, 1), today);

    expect(Object.keys(result.days).length).toBe(0);
    expect(result.dueIn30.length).toBe(0);
    expect(result.totalDueIn30).toBe(0);
  });
});

describe("generateMonthlyRanges", () => {
  it("should generate correct ranges for a single month period", () => {
    const start = new Date(2026, 4, 15); // May 15, 2026
    const end = new Date(2026, 4, 20);   // May 20, 2026
    const ranges = generateMonthlyRanges(start, end);

    expect(ranges.length).toBe(1);
    expect(ranges[0].start.getFullYear()).toBe(2026);
    expect(ranges[0].start.getMonth()).toBe(4); // May
    expect(ranges[0].start.getDate()).toBe(1);
    expect(ranges[0].end.getDate()).toBe(31); // May has 31 days
  });

  it("should generate correct ranges spanning across multiple months and years", () => {
    const start = new Date(2025, 11, 10); // December 10, 2025
    const end = new Date(2026, 1, 5);     // February 5, 2026
    const ranges = generateMonthlyRanges(start, end);

    // Dec 2025, Jan 2026, Feb 2026 -> 3 months
    expect(ranges.length).toBe(3);

    // Dec 2025
    expect(ranges[0].start.getFullYear()).toBe(2025);
    expect(ranges[0].start.getMonth()).toBe(11);
    expect(ranges[0].end.getDate()).toBe(31);

    // Jan 2026
    expect(ranges[1].start.getFullYear()).toBe(2026);
    expect(ranges[1].start.getMonth()).toBe(0);
    expect(ranges[1].end.getDate()).toBe(31);

    // Feb 2026
    expect(ranges[2].start.getFullYear()).toBe(2026);
    expect(ranges[2].start.getMonth()).toBe(1);
    expect(ranges[2].end.getDate()).toBe(28); // Feb 2026 has 28 days
  });
});
