export interface DefaultRiskInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  employmentType:
    | "SALARIED"
    | "SELF_EMPLOYED"
    | "STUDENT"
    | "BUSINESS_OWNER"
    | "OTHER";
  hasEmergencyFund: boolean;
  emergencyFundMonths: number;
  creditScoreRange: string;

  loanType: string;
  interestRate: number;
  rateType: "FIXED" | "FLOATING";
  tenureMonths: number;
  outstandingBalance: number;
  emiAmount: number;
  monthsActive: number;

  totalMonthlyEMI: number;
  numberOfActiveLoans: number;
  debtToIncomeRatio: number;
}

export interface RiskFactor {
  name: string;
  impact: "positive" | "negative";
  weight: number;
  description: string;
}

export interface DefaultRiskResult {
  probability: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  topFactors: RiskFactor[];
  recommendation: string;
}

const WEIGHTS = [0.28, 0.22, 0.18, 0.12, 0.08, 0.07, 0.15, 0.06, 0.09, 0.1] as const;
const BIAS = -2.4;

function clamp01(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function normalizeCreditScoreRange(range: string): string {
  return range
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, "");
}

function normalizeFeatures(input: DefaultRiskInput): number[] {
  const disposableIncome = Math.max(input.monthlyIncome - input.monthlyExpenses, 1);

  const employmentRisk: Record<DefaultRiskInput["employmentType"], number> = {
    SALARIED: 0,
    STUDENT: 0.4,
    SELF_EMPLOYED: 0.35,
    BUSINESS_OWNER: 0.3,
    OTHER: 0.5,
  };

  const creditRisk: Record<string, number> = {
    "below-650": 1,
    "650-700": 0.7,
    "700-750": 0.4,
    "750-800": 0.15,
    "800+": 0,
  };

  return [
    clamp01(input.debtToIncomeRatio / 0.6),
    clamp01(input.emiAmount / disposableIncome),
    clamp01(input.outstandingBalance / Math.max(input.monthlyIncome * 12, 1)),
    input.hasEmergencyFund ? clamp01(1 - input.emergencyFundMonths / 6) : 1,
    input.rateType === "FLOATING" && input.tenureMonths > 120 ? 0.8 : 0,
    employmentRisk[input.employmentType] ?? 0.4,
    creditRisk[normalizeCreditScoreRange(input.creditScoreRange)] ?? 0.5,
    clamp01((input.numberOfActiveLoans - 1) / 4),
    clamp01(1 - input.monthsActive / Math.max(input.tenureMonths, 1)),
    clamp01((input.interestRate - 7) / 10),
  ];
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function predictDefaultRisk(input: DefaultRiskInput): DefaultRiskResult {
  const features = normalizeFeatures(input);

  const logit = features.reduce((sum, feature, index) => sum + feature * WEIGHTS[index], BIAS);
  const probability = sigmoid(logit);
  const riskScore = Math.round(probability * 100);

  const riskLevel =
    probability < 0.15
      ? "low"
      : probability < 0.35
        ? "medium"
        : probability < 0.6
          ? "high"
          : "critical";

  const factorContributions = [
    {
      name: "Debt-to-income ratio",
      impact: features[0],
      weight: WEIGHTS[0],
      description: `Your DTI is ${Math.round(input.debtToIncomeRatio * 100)}%`,
    },
    {
      name: "EMI vs disposable income",
      impact: features[1],
      weight: WEIGHTS[1],
      description: `EMI takes ${Math.round(features[1] * 100)}% of your disposable income`,
    },
    {
      name: "Outstanding balance",
      impact: features[2],
      weight: WEIGHTS[2],
      description: `Balance is ${(input.outstandingBalance / Math.max(input.monthlyIncome, 1)).toFixed(1)}x your monthly income`,
    },
    {
      name: "Emergency fund",
      impact: features[3],
      weight: WEIGHTS[3],
      description: input.hasEmergencyFund
        ? `${input.emergencyFundMonths} months of cover`
        : "No emergency fund",
    },
    {
      name: "Rate type risk",
      impact: features[4],
      weight: WEIGHTS[4],
      description: "Floating rate on long tenure",
    },
    {
      name: "Employment stability",
      impact: features[5],
      weight: WEIGHTS[5],
      description: input.employmentType.toLowerCase().replace("_", " "),
    },
    {
      name: "Credit score",
      impact: features[6],
      weight: WEIGHTS[6],
      description: `Score range: ${input.creditScoreRange}`,
    },
    {
      name: "Loan count",
      impact: features[7],
      weight: WEIGHTS[7],
      description: `${input.numberOfActiveLoans} active loans`,
    },
    {
      name: "Loan maturity",
      impact: features[8],
      weight: WEIGHTS[8],
      description: `${input.monthsActive} of ${input.tenureMonths} months completed`,
    },
    {
      name: "Interest rate",
      impact: features[9],
      weight: WEIGHTS[9],
      description: `${input.interestRate}% annual rate`,
    },
  ];

  const topFactors = factorContributions
    .map((factor) => ({ ...factor, score: factor.impact * factor.weight }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((factor) => ({
      name: factor.name,
      impact: factor.impact > 0.3 ? ("negative" as const) : ("positive" as const),
      weight: factor.weight,
      description: factor.description,
    }));

  const recommendationByLevel: Record<DefaultRiskResult["riskLevel"], string> = {
    low: "Your repayment risk is low. Maintain your emergency fund and continue your current strategy.",
    medium: "Consider building your emergency fund to at least 3 months of EMI payments.",
    high: "Reduce this loan's risk by prepaying Rs 5,000-10,000 now or consolidating with a lower-rate loan.",
    critical:
      "Immediate action needed - contact your lender about restructuring before missing an EMI.",
  };

  return {
    probability,
    riskLevel,
    riskScore,
    topFactors,
    recommendation: recommendationByLevel[riskLevel],
  };
}
