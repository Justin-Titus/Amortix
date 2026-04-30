export interface LoanState {
  id: string;
  name: string;
  outstanding: number;
  annualRate: number;
  emi: number;
}

export interface OptimizedAllocation {
  loanId: string;
  loanName: string;
  baseEMI: number;
  extraAllocation: number;
  totalPayment: number;
  marginalInterestSaved: number;
  reasoning: string;
}

export interface OptimizationResult {
  allocations: OptimizedAllocation[];
  totalInterestSaved: number;
  monthsSaved: number;
  optimizedPayoffDate: Date;
  vsAvalanche: { interestDifference: number; monthsDifference: number };
  confidenceScore: number;
}

interface SimulationResult {
  totalInterest: number;
  monthsToPayoff: number;
}

const MIN_ALLOCATION_STEP = 500;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function monthRate(annualRate: number): number {
  return annualRate / 12 / 100;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function getMarginalSaving(loan: LoanState, totalOutstanding: number): number {
  if (loan.outstanding <= 0 || totalOutstanding <= 0) {
    return 0;
  }
  return monthRate(loan.annualRate) * (loan.outstanding / totalOutstanding);
}

function simulatePayoff(loans: LoanState[], extraAllocations: Map<string, number>, projectionMonths: number): SimulationResult {
  const outstanding = new Map<string, number>(loans.map((loan) => [loan.id, loan.outstanding]));
  const currentExtra = new Map<string, number>(extraAllocations);
  const activeLoanIds = new Set(loans.filter((loan) => loan.outstanding > 0).map((loan) => loan.id));

  let totalInterest = 0;
  let months = 0;

  while (activeLoanIds.size > 0 && months < projectionMonths) {
    months += 1;

    const orderedActive = loans
      .filter((loan) => activeLoanIds.has(loan.id))
      .sort((a, b) => b.annualRate - a.annualRate);

    for (const loan of orderedActive) {
      const remaining = outstanding.get(loan.id) ?? 0;
      if (remaining <= 0) {
        activeLoanIds.delete(loan.id);
        continue;
      }

      const interest = remaining * monthRate(loan.annualRate);
      totalInterest += interest;

      const extra = currentExtra.get(loan.id) ?? 0;
      const payment = loan.emi + extra;
      const principalPaid = clamp(payment - interest, 0, remaining);
      const nextOutstanding = remaining - principalPaid;

      outstanding.set(loan.id, nextOutstanding);

      if (nextOutstanding <= 0.5) {
        activeLoanIds.delete(loan.id);

        // Cascade freed payment to current highest-rate active loan.
        const destination = orderedActive.find((candidate) => activeLoanIds.has(candidate.id));
        if (destination) {
          const destinationExtra = currentExtra.get(destination.id) ?? 0;
          currentExtra.set(destination.id, destinationExtra + loan.emi + extra);
        }
      }
    }
  }

  return {
    totalInterest: Math.round(totalInterest),
    monthsToPayoff: months,
  };
}

export function optimizeEMIAllocation(
  loans: LoanState[],
  extraBudget: number,
  projectionMonths: number = 240
): OptimizationResult {
  if (loans.length === 0) {
    return {
      allocations: [],
      totalInterestSaved: 0,
      monthsSaved: 0,
      optimizedPayoffDate: new Date(),
      vsAvalanche: { interestDifference: 0, monthsDifference: 0 },
      confidenceScore: 0,
    };
  }

  const safeExtraBudget = Math.max(0, Math.round(extraBudget));
  const allocations = new Map<string, number>(loans.map((loan) => [loan.id, 0]));
  const mutableLoans = loans.map((loan) => ({ ...loan }));

  let budgetLeft = safeExtraBudget;

  while (budgetLeft >= MIN_ALLOCATION_STEP) {
    const totalOutstanding = mutableLoans.reduce((sum, loan) => sum + Math.max(loan.outstanding, 0), 0);

    const ranked = mutableLoans
      .map((loan) => ({ loan, marginal: getMarginalSaving(loan, totalOutstanding) }))
      .sort((a, b) => b.marginal - a.marginal);

    const target = ranked[0];
    if (!target || target.marginal <= 0) {
      break;
    }

    const step = Math.min(MIN_ALLOCATION_STEP, budgetLeft);
    allocations.set(target.loan.id, (allocations.get(target.loan.id) ?? 0) + step);
    budgetLeft -= step;

    // Approximate immediate balance drop from this month's extra allocation.
    target.loan.outstanding = Math.max(0, target.loan.outstanding - step);
  }

  const baselineSimulation = simulatePayoff(loans, new Map(loans.map((loan) => [loan.id, 0])), projectionMonths);
  const optimizedSimulation = simulatePayoff(loans, allocations, projectionMonths);

  const highestRateLoan = [...loans].sort((a, b) => b.annualRate - a.annualRate)[0];
  const avalancheAllocations = new Map<string, number>(
    loans.map((loan) => [loan.id, loan.id === highestRateLoan.id ? safeExtraBudget : 0])
  );
  const avalancheSimulation = simulatePayoff(loans, avalancheAllocations, projectionMonths);

  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding, 0);
  const rateValues = loans.map((loan) => loan.annualRate);
  const maxRate = Math.max(...rateValues);
  const minRate = Math.min(...rateValues);
  const rateSpread = maxRate - minRate;

  const outstandingValues = loans.map((loan) => loan.outstanding);
  const maxOutstanding = Math.max(...outstandingValues);
  const minOutstanding = Math.min(...outstandingValues);
  const outstandingSpread = totalOutstanding > 0 ? (maxOutstanding - minOutstanding) / totalOutstanding : 0;

  const confidenceScore = Math.round(sigmoid(rateSpread * Math.max(outstandingSpread, 0) * 10) * 100);

  const resultAllocations: OptimizedAllocation[] = loans.map((loan) => {
    const extraAllocation = allocations.get(loan.id) ?? 0;
    const marginalInterestSaved = getMarginalSaving(loan, totalOutstanding);
    const reasoning =
      extraAllocation > 0
        ? `Allocated toward ${loan.annualRate.toFixed(2)}% rate with Rs ${Math.round(loan.outstanding).toLocaleString("en-IN")} outstanding.`
        : "Lower current marginal impact than other loans this month.";

    return {
      loanId: loan.id,
      loanName: loan.name,
      baseEMI: loan.emi,
      extraAllocation,
      totalPayment: loan.emi + extraAllocation,
      marginalInterestSaved,
      reasoning,
    };
  });

  const optimizedPayoffDate = new Date();
  optimizedPayoffDate.setMonth(optimizedPayoffDate.getMonth() + optimizedSimulation.monthsToPayoff);

  return {
    allocations: resultAllocations,
    totalInterestSaved: Math.max(0, baselineSimulation.totalInterest - optimizedSimulation.totalInterest),
    monthsSaved: Math.max(0, baselineSimulation.monthsToPayoff - optimizedSimulation.monthsToPayoff),
    optimizedPayoffDate,
    vsAvalanche: {
      interestDifference: avalancheSimulation.totalInterest - optimizedSimulation.totalInterest,
      monthsDifference: avalancheSimulation.monthsToPayoff - optimizedSimulation.monthsToPayoff,
    },
    confidenceScore,
  };
}
