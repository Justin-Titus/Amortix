"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Calculator,
  Flame,
  Snowflake,
  ShieldAlert,
  Target,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { compareAllStrategies, type LoanInput } from "@/lib/calculations/strategies";

import { calculateAffordabilityScore } from "@/lib/calculations/affordability";
import { formatCurrency } from "@/lib/calculations/emi";
import { fadeUpVariants, pageTransition, staggerContainer } from "@/lib/animations";
import AffordabilityGauge from "@/components/dashboard/AffordabilityGauge";

type FinancialProfile = {
  monthlyIncome?: number | null;
  monthlyExpenses?: number | null;
  creditScoreRange?: string | null;
  hasEmergencyFund?: boolean | null;
  emergencyFundMonths?: number | null;
  employmentType?: string | null;
} | null;

type LiveStrategyModelerProps = {
  loans: Array<{
    id: string;
    name: string;
    outstandingBalance: number;
    interestRate: number;
    emiAmount: number;
    principal: number;
    loanType: string;
    rateType: string;
    tenureMonths: number;
  }>;
  profile: FinancialProfile;
  userName: string;
};

type StrategyKey = "avalanche" | "snowball" | "hybrid";

const presets = [
  { label: "Minimum", extraMonthly: 0, oneTime: 0, strategy: "avalanche" as StrategyKey },
  { label: "Balanced", extraMonthly: 5000, oneTime: 0, strategy: "avalanche" as StrategyKey },
  { label: "Aggressive", extraMonthly: 15000, oneTime: 50000, strategy: "hybrid" as StrategyKey },
];

const strategyPalette: Record<StrategyKey, { name: string; icon: typeof Zap; accent: string; fill: string }> = {
  avalanche: { name: "Avalanche", icon: Zap, accent: "var(--color-emerald)", fill: "#059669" },
  snowball: { name: "Snowball", icon: Snowflake, accent: "var(--color-navy)", fill: "#0D1F3C" },
  hybrid: { name: "Hybrid", icon: Target, accent: "var(--color-amber)", fill: "#F59E0B" },
};

function getRiskLabel(score: number) {
  if (score >= 75) return "Healthy";
  if (score >= 50) return "Watch";
  return "High risk";
}

function buildSummary(input: {
  selectedStrategy: StrategyKey;
  monthsSaved: number;
  savedInterest: number;
  extraMonthlyPayment: number;
  oneTimePayment: number;
  affordabilityScore: number | null;
  affordabilityZone: string | null;
  hasProfile: boolean;
  bestStrategyLabel: string;
  totalEMI: number;
  totalOutstanding: number;
}) {
  const parts: string[] = [];

  if (input.savedInterest > 0) {
    parts.push(
      `${strategyPalette[input.selectedStrategy].name} is currently saving ${formatCurrency(input.savedInterest)} versus minimum payments.`
    );
  }

  if (input.monthsSaved > 0) {
    parts.push(`It shortens the payoff horizon by ${input.monthsSaved} month${input.monthsSaved === 1 ? "" : "s"}.`);
  }

  if (input.extraMonthlyPayment > 0 || input.oneTimePayment > 0) {
    parts.push(
      `Your scenario includes ${formatCurrency(input.extraMonthlyPayment)} extra per month${input.oneTimePayment > 0 ? ` and a one-time ${formatCurrency(input.oneTimePayment)} prepayment` : ""}.`
    );
  }

  if (!input.hasProfile) {
    parts.push("Add income, expense, and credit data in Profile to unlock a more accurate affordability score.");
  } else {
    parts.push(
      `Affordability is currently in the ${input.affordabilityZone ?? "unknown"} zone with a score of ${input.affordabilityScore ?? 0}/100.`
    );
  }

  if (input.bestStrategyLabel !== strategyPalette[input.selectedStrategy].name) {
    parts.push(`${input.bestStrategyLabel} is the strongest option on pure savings for this setup.`);
  }

  if (input.totalOutstanding > 0) {
    parts.push(
      `You are managing ${formatCurrency(input.totalOutstanding)} across ${formatCurrency(input.totalEMI)} in monthly EMIs.`
    );
  }

  return parts.join(" ");
}

function formatShortMonth(index: number) {
  return `M${index}`;
}

function formatTooltipValue(value: string | number | readonly (string | number)[] | undefined) {
  const normalized = Array.isArray(value) ? value[0] : value;
  return formatCurrency(Number(normalized ?? 0));
}

export default function LiveStrategyModeler({ loans, profile, userName }: LiveStrategyModelerProps) {
  const reduce = useReducedMotion();
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(0);
  const [oneTimePayment, setOneTimePayment] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>("avalanche");
  const firstName = userName.trim().split(" ")[0] || "there";

  const loanInputs = useMemo<LoanInput[]>(
    () =>
      loans.map((loan) => ({
        id: loan.id,
        name: loan.name,
        outstanding: loan.outstandingBalance,
        annualRate: loan.interestRate,
        emi: loan.emiAmount,
      })),
    [loans]
  );

  const totalOutstanding = useMemo(
    () => loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0),
    [loans]
  );
  const totalEMI = useMemo(() => loans.reduce((sum, loan) => sum + loan.emiAmount, 0), [loans]);

  const results = useMemo(() => compareAllStrategies(loanInputs, extraMonthlyPayment, oneTimePayment), [loanInputs, extraMonthlyPayment, oneTimePayment]);
  const selectedResult = results[selectedStrategy];
  const selectedMeta = strategyPalette[selectedStrategy];

  const affordability = useMemo(() => {
    if (!profile?.monthlyIncome || profile.monthlyIncome <= 0) return null;

    return calculateAffordabilityScore({
      monthlyIncome: profile.monthlyIncome,
      monthlyExpenses: profile.monthlyExpenses ?? 0,
      totalMonthlyEMI: totalEMI,
      creditScoreRange: profile.creditScoreRange ?? "Not provided",
      hasEmergencyFund: Boolean(profile.hasEmergencyFund),
      emergencyFundMonths: profile.emergencyFundMonths ?? 0,
      loans: loans.map((loan) => ({
        annualRate: loan.interestRate,
        tenureMonths: loan.tenureMonths,
        rateType: loan.rateType,
      })),
    });
  }, [loans, profile, totalEMI]);

  const comparisonData = useMemo(
    () => [
      { name: "Minimum", value: results.baseline.totalInterest, fill: "#94A3B8" },
      { name: "Avalanche", value: results.avalanche.totalInterestPaid, fill: strategyPalette.avalanche.fill },
      { name: "Snowball", value: results.snowball.totalInterestPaid, fill: strategyPalette.snowball.fill },
      { name: "Hybrid", value: results.hybrid.totalInterestPaid, fill: strategyPalette.hybrid.fill },
    ],
    [results]
  );


  const bestStrategy = useMemo(() => {
    const entries = [results.avalanche, results.snowball, results.hybrid];
    return entries.reduce((best, candidate) => (candidate.totalSavedVsMinimum > best.totalSavedVsMinimum ? candidate : best), entries[0]);
  }, [results]);

  const summary = useMemo(
    () =>
      buildSummary({
        selectedStrategy,
        monthsSaved: Math.max(0, results.baseline.months - selectedResult.monthsToPayoff),
        savedInterest: Math.max(0, selectedResult.totalSavedVsMinimum),
        extraMonthlyPayment,
        oneTimePayment,
        affordabilityScore: affordability?.score ?? null,
        affordabilityZone: affordability?.zone ?? null,
        hasProfile: Boolean(affordability),
        bestStrategyLabel: strategyPalette[bestStrategy.strategy].name,
        totalEMI,
        totalOutstanding,
      }),
    [affordability, bestStrategy.strategy, extraMonthlyPayment, oneTimePayment, results.baseline.months, selectedResult.monthsToPayoff, selectedResult.totalSavedVsMinimum, selectedStrategy, totalEMI, totalOutstanding]
  );

  if (loans.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amortix-emerald-bg text-amortix-emerald">
          <Activity className="h-6 w-6" />
        </div>
        <h2 className="font-heading text-xl font-medium text-amortix-navy">No loans to analyze yet</h2>
        <p className="mt-2 max-w-lg text-sm text-amortix-slate">
          {`${firstName}, add at least one loan to compare strategies, model extra payments, and generate a live payoff plan.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/loans/add" className="btn-primary inline-flex items-center gap-2">
            Add loan
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/profile" className="btn-secondary">
            Update profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={pageTransition} initial={reduce ? false : "hidden"} animate="visible" className="space-y-6">  

      <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <motion.div variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible" className="space-y-4">
          <motion.div variants={fadeUpVariants} custom={0} className="card space-y-5">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-amortix-emerald" />
              <h2 className="text-[13px] font-medium text-amortix-navy">Scenario controls</h2>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setExtraMonthlyPayment(preset.extraMonthly);
                    setOneTimePayment(preset.oneTime);
                    setSelectedStrategy(preset.strategy);
                  }}
                  className={`flex items-center justify-between rounded-(--radius-button) border px-3 py-2 text-left text-sm transition-all ${
                    extraMonthlyPayment === preset.extraMonthly && oneTimePayment === preset.oneTime && selectedStrategy === preset.strategy
                      ? "border-amortix-emerald bg-amortix-emerald-bg text-amortix-navy"
                      : "border-amortix-border-light bg-white text-amortix-slate hover:border-amortix-border-mid"
                  }`}
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-[11px]">{formatCurrency(preset.extraMonthly)}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-amortix-navy">
                <span>Extra monthly payment</span>
                <span className="num text-amortix-emerald">{formatCurrency(extraMonthlyPayment)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={50000}
                step={500}
                value={extraMonthlyPayment}
                onChange={(event) => setExtraMonthlyPayment(Number(event.target.value))}
                className="w-full accent-amortix-emerald"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-amortix-text-muted">
                <span>₹0</span>
                <span>₹50k</span>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-amortix-navy">
                <span>One-time prepayment</span>
                <span className="num text-amortix-amber">{formatCurrency(oneTimePayment)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={250000}
                step={5000}
                value={oneTimePayment}
                onChange={(event) => setOneTimePayment(Number(event.target.value))}
                className="w-full accent-amortix-amber"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-amortix-text-muted">
                <span>₹0</span>
                <span>₹2.5L</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUpVariants} custom={1} className="card">
            <h2 className="mb-3 text-[13px] font-medium text-amortix-navy">Strategy focus</h2>
            <div className="space-y-2">
              {(Object.keys(strategyPalette) as StrategyKey[]).map((key) => {
                const meta = strategyPalette[key];
                const active = selectedStrategy === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedStrategy(key)}
                    className={`flex w-full items-start gap-3 rounded-(--radius-button) border px-3 py-3 text-left transition-all ${
                      active ? "border-amortix-emerald bg-amortix-emerald-bg/60" : "border-amortix-border-light bg-white hover:border-amortix-border-mid"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${active ? "bg-amortix-emerald text-white" : "bg-amortix-frost text-amortix-slate"}`}>
                      <meta.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-amortix-navy">{meta.name}</span>
                        {key === bestStrategy.strategy ? <span className="badge-green">Best</span> : null}
                      </div>
                      <p className="mt-1 text-xs text-amortix-slate">
                        {key === "avalanche" && "Highest-interest balance gets the most attention."}
                        {key === "snowball" && "Fastest emotional wins from smallest balance first."}
                        {key === "hybrid" && "Snowball momentum first, then interest efficiency."}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible" className="space-y-4">
          <motion.div variants={fadeUpVariants} custom={0} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="metric-card border-l-4 border-l-amortix-emerald min-h-20">
              <p className="text-xs text-amortix-slate">Selected interest saved</p>
              <p className={`num mt-1 text-[20px] font-medium ${selectedResult.totalSavedVsMinimum > 0 ? "text-amortix-navy" : "text-slate-400"}`}>
                {formatCurrency(Math.max(0, selectedResult.totalSavedVsMinimum))}
              </p>
            </div>
            <div className="metric-card border-l-4 border-l-amortix-amber min-h-20">
              <p className="text-xs text-amortix-slate">Months shaved</p>
              <p className={`num mt-1 text-[20px] font-medium ${selectedResult.totalSavedVsMinimum > 0 ? "text-amortix-navy" : "text-slate-400"}`}>
                {Math.max(0, results.baseline.months - selectedResult.monthsToPayoff)}
              </p>
            </div>
            <div className="metric-card border-l-4 border-l-amortix-navy-mid min-h-20">
              <p className="text-xs text-amortix-slate">Payoff date</p>
              <p className="num mt-1 text-[20px] font-medium text-amortix-navy">
                {selectedResult.payoffDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUpVariants} custom={1} className="grid grid-cols-1 gap-4">
            <div className="card min-h-90">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[13px] font-medium text-amortix-navy">Interest comparison</h2>
                  <p className="text-[11px] text-amortix-slate">Minimum payments vs strategy options</p>
                </div>
                <span className="badge-slate">Live</span>
              </div>
              <ChartContainer height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                    <Tooltip
                      formatter={formatTooltipValue}
                      contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Interest paid" radius={[6, 6, 0, 0]}>
                      {comparisonData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

            </div>

          </motion.div>

          <motion.div variants={fadeUpVariants} custom={2} className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="card">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amortix-amber" />
                <h2 className="text-[13px] font-medium text-amortix-navy">Affordability</h2>
              </div>

              {affordability ? (
                <>
                  <AffordabilityGauge score={affordability.score} />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-amortix-frost px-3 py-2 text-xs">
                      <span className="text-amortix-slate">Risk zone</span>
                      <span className="num text-amortix-navy">{getRiskLabel(affordability.score)}</span>
                    </div>
                    {affordability.breakdown.slice(0, 4).map((item) => (
                      <div key={item.factor} className="rounded-lg border border-amortix-border-light px-3 py-2">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-medium text-amortix-navy">{item.factor}</span>
                          <span className={`num ${item.impact < 0 ? "text-amortix-red" : item.impact > 0 ? "text-amortix-emerald" : "text-amortix-slate"}`}>
                            {item.value}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-amortix-slate">{item.advice}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-amortix-border-mid bg-amortix-frost px-4 py-8 text-center">
                  <p className="text-sm font-medium text-amortix-navy">Add profile data</p>
                  <p className="mt-2 text-xs text-amortix-slate">
                    Income and expense details unlock the affordability score and risk breakdown.
                  </p>
                  <Link href="/profile" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-amortix-emerald hover:text-emerald-700">
                    Open profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="card space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amortix-emerald" />
                <h2 className="text-[13px] font-medium text-amortix-navy">Live insight</h2>
              </div>

              <div className="rounded-xl bg-amortix-navy p-4 text-white">
                <p className="text-[11px] tracking-[0.18em] text-slate-400 font-medium">What the model says</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-amortix-border-light px-3 py-3">
                  <p className="text-[10px] tracking-wider text-amortix-slate font-medium">Monthly cash after EMIs</p>
                  <p className={`num mt-2 text-lg font-medium ${(profile?.monthlyIncome && (profile.monthlyIncome - (profile.monthlyExpenses ?? 0) - totalEMI - extraMonthlyPayment) <= 0) ? "text-red-500" : "text-amortix-navy"}`}>
                    {profile?.monthlyIncome ? formatCurrency(Math.max(0, (profile.monthlyIncome ?? 0) - (profile.monthlyExpenses ?? 0) - totalEMI - extraMonthlyPayment)) : "Set profile"}
                  </p>
                </div>
                <div className="rounded-xl border border-amortix-border-light px-3 py-3">
                  <p className="text-[10px] tracking-wider text-amortix-slate font-medium">Best strategy</p>
                  <p className="mt-2 text-lg font-medium text-amortix-navy">{strategyPalette[bestStrategy.strategy].name}</p>
                </div>
              </div>

              <div className="rounded-xl border border-amortix-border-light bg-amortix-frost px-3 py-3 text-xs text-amortix-slate">
                <span className="font-medium text-amortix-navy">Scenario focus:</span> {selectedMeta.name} with {formatCurrency(extraMonthlyPayment)} extra monthly and {formatCurrency(oneTimePayment)} one-time prepayment.
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>
    </motion.div>
  );
}
