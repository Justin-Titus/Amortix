/**
 * EMI Calculation Engine
 * Standard reducing balance EMI formula
 */

/** Calculate monthly EMI using the standard reducing balance formula */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (
    principal <= 0 ||
    tenureMonths <= 0 ||
    annualRate < 0 ||
    !Number.isFinite(principal) ||
    !Number.isFinite(tenureMonths) ||
    !Number.isFinite(annualRate)
  ) {
    throw new Error(
      "Invalid input: principal must be >0, tenureMonths must be >0, annualRate must be >=0"
    );
  }

  const r = annualRate / 12 / 100;
  const n = tenureMonths;

  if (annualRate === 0) {
    return principal / tenureMonths;
  }

  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Calculate total interest paid over the loan tenure */
export function totalInterest(
  emi: number,
  tenureMonths: number,
  principal: number
): number {
  return emi * tenureMonths - principal;
}

/** Calculate total amount paid (principal + interest) */
export function totalAmount(emi: number, tenureMonths: number): number {
  return emi * tenureMonths;
}

type CurrencyFormatOptions = {
  compact?: boolean;
};

/** Format a number as Indian Rupee currency */
export function formatCurrency(amount: number, options: CurrencyFormatOptions = {}): string {
  const compact = options.compact ?? false;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (compact) {
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
    if (abs >= 100000) return `${sign}₹${Math.round(abs / 100000)}L`;
    if (abs >= 1000) return `${sign}₹${Math.round(abs / 1000)}K`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs).replace("₹", `${sign}₹`);
}

/** Backward-compatible alias for compact INR formatting */
export function formatINR(amount: number, compact = false): string {
  return formatCurrency(amount, { compact });
}

/** Format a number with commas (Indian number system) */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(num));
}
