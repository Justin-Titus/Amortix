"use client";

import { useState, useMemo } from "react";
import {
  compareAllStrategies,
  formatCurrency,
  formatCompactCurrency,
  getCurrencyConfig,
  type StrategyLoanInput,
} from "@/lib/calculations";
import { Info, Calculator, Target, Zap, Snowflake, BarChart2 } from "lucide-react";
import { 
  BarChart, 
  Bar,
  Cell,
  XAxis,
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ChartContainer } from "@/components/ui/ChartContainer";
import AmortizationTable from "./AmortizationTable";
import EMIOptimizerPanel from "@/components/ml/EMIOptimizerPanel";
import SliderField from "@/components/ui/SliderField";
import { StrategyOptionButton } from "./StrategyOptionButton";

function formatTooltipValue(value: string | number | readonly (string | number)[] | undefined, currencyCode: string = "INR") {
  const normalized = Array.isArray(value) ? value[0] : value;
  return formatCurrency(Number(normalized ?? 0), currencyCode);
}

export default function StrategyComparison({
  loans,
  currencyCode = "INR",
}: {
  loans: StrategyLoanInput[];
  currencyCode?: string;
}) {
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [oneTimePayment, setOneTimePayment] = useState<number>(0);
  const [selectedStrategy, setSelectedStrategy] = useState<"avalanche" | "snowball" | "hybrid">("avalanche");

  const results = useMemo(() => {
    return compareAllStrategies(loans, extraPayment, oneTimePayment);
  }, [loans, extraPayment, oneTimePayment]);

  if (loans.length === 0) {
    return (
      <div className="section-block py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amortix-frost">
          <Info className="h-8 w-8 text-amortix-slate" />
        </div>
        <h2 className="mb-2 text-xl font-heading font-medium text-amortix-navy">No loans to optimize</h2>
        <p className="mx-auto mb-6 max-w-sm text-sm text-amortix-slate">
          Add some loans to see how much you can save with advanced repayment strategies.
        </p>
      </div>
    );
  }

  const { avalanche, snowball, hybrid, baseline } = results;

  const strategies = [
    {
      id: "avalanche",
      name: "Avalanche",
      icon: Zap,
      desc: "Mathematical optimal. Pay highest interest rate first.",
      data: avalanche,
      color: "var(--color-emerald)",
    },
    {
      id: "snowball",
      name: "Snowball",
      icon: Snowflake,
      desc: "Psychological boost. Pay smallest balance first.",
      data: snowball,
      color: "#3B82F6",
    },
    {
      id: "hybrid",
      name: "Hybrid",
      icon: Target,
      desc: "Quick win first, then switch to highest interest.",
      data: hybrid,
      color: "var(--color-amber)",
    },
  ] as const;

  const chartData = [
    {
      name: "Minimum Only",
      Interest: baseline.totalInterest,
    },
    {
      name: "Avalanche",
      Interest: avalanche.totalInterestPaid,
    },
    {
      name: "Snowball",
      Interest: snowball.totalInterestPaid,
    },
    {
      name: "Hybrid",
      Interest: hybrid.totalInterestPaid,
    },
  ];

  const activeStrObj = strategies.find(s => s.id === selectedStrategy)!;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:gap-8 xl:grid-cols-[360px_minmax(0,1.25fr)]">
        <div className="space-y-6">
          <EMIOptimizerPanel
            loans={loans.map((loan) => ({
              id: loan.id,
              name: loan.name,
              outstanding: loan.outstanding,
              annualRate: loan.annualRate,
              emi: loan.emi,
            }))}
            extraBudget={extraPayment}
            onExtraBudgetChange={setExtraPayment}
            oneTimePayment={oneTimePayment}
            onOneTimePaymentChange={setOneTimePayment}
            currencyCode={currencyCode}
          />

          <div className="section-block">
            <h2 className="mb-4 text-base font-heading font-medium text-amortix-navy">
              Select Strategy
            </h2>
            <div className="space-y-3">
              {strategies.map((strat) => (
                <StrategyOptionButton
                  key={strat.id}
                  id={strat.id}
                  name={strat.name}
                  desc={strat.desc}
                  icon={strat.icon}
                  isActive={selectedStrategy === strat.id}
                  onClick={() => setSelectedStrategy(strat.id)}
                />
              ))}
            </div>
            {/* Identical strategy results explanation moved below interest chart */}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4">
            <div className="section-block p-5 border-l-4" style={{ borderLeftColor: activeStrObj.color }}>
              <p className="mb-2 text-xs tracking-[0.03em] text-slate-400">Total interest saved</p>
              <p className={`text-3xl font-currency font-medium ${activeStrObj.data.totalSavedVsMinimum > 0 ? "text-emerald-600" : "text-amortix-navy"}`}>
                {formatCurrency(activeStrObj.data.totalSavedVsMinimum, currencyCode)}
              </p>
              <p className="mt-2 text-xs text-amortix-slate">vs minimum payments</p>
            </div>
            
            <div className="section-block border-l-4 p-5" style={{ borderLeftColor: activeStrObj.color }}>
              <p className="mb-2 text-xs tracking-[0.03em] text-slate-400">Months shaved off</p>
              <p className="text-3xl font-medium text-amortix-navy">
                {baseline.months - activeStrObj.data.monthsToPayoff} <span className="text-base font-normal text-(--color-slate)">mo</span>
              </p>
              <p className="mt-2 text-xs text-amortix-slate">
                New payoff: {activeStrObj.data.payoffDate.toLocaleDateString(getCurrencyConfig(currencyCode).locale, { month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="section-block border-l-4 p-5" style={{ borderLeftColor: activeStrObj.color }}>
              <p className="mb-2 text-xs tracking-[0.03em] text-slate-400">Total interest paid</p>
              <p className="text-3xl font-currency font-medium text-(--color-navy)">
                {formatCurrency(activeStrObj.data.totalInterestPaid, currencyCode)}
              </p>
              <p className="mt-2 text-xs text-amortix-slate">
                Down from {formatCurrency(baseline.totalInterest, currencyCode)}
              </p>
            </div>
          </div>

          {loans.length >= 2 && (
            <div className="rounded-xl bg-emerald-50/80 p-4 border border-emerald-100 flex items-start gap-3 mt-2">
              <div className="bg-emerald-100 p-1.5 rounded-full shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-emerald-900">The "Rollover" Magic</h4>
                <p className="mt-1 text-xs text-emerald-800/90 leading-relaxed">
                  How are you saving so much without adding extra budget? When one loan finishes, its monthly payment is automatically <strong>rolled over</strong> into your next loan. You keep paying the exact same total amount out-of-pocket every month, but you crush your debt years earlier!
                </p>
              </div>
            </div>
          )}

          <div className="section-block flex flex-col p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-heading font-medium text-amortix-navy">
                <BarChart2 className="h-5 w-5" />
                Interest Comparison
              </h2>
            </div>
            <ChartContainer height={320}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => formatCompactCurrency(val, currencyCode)} 
                    tick={{ fontSize: 12, fill: "#64748B" }}
                  />
                  <Tooltip 
                    formatter={(val) => formatTooltipValue(val, currencyCode)}
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="Interest" fill="var(--color-navy)" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === activeStrObj.name ? activeStrObj.color : (index === 0 ? '#94A3B8' : 'var(--color-navy)')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            {avalanche.totalInterestPaid === snowball.totalInterestPaid && avalanche.totalInterestPaid === hybrid.totalInterestPaid && (
              <div className="mt-6 rounded-xl bg-blue-50 p-4 border border-blue-100 flex items-start gap-3 animate-fade-in">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Why are the results identical?</h4>
                  <p className="mt-1 text-xs text-blue-700 leading-relaxed">
                    Your smallest balance loan also has the highest interest rate! Because of this, both Avalanche and Snowball target the exact same loan first, producing identical payoff paths.
                  </p>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
      
      <AmortizationTable schedule={activeStrObj.data.schedule} />
    </div>
  );
}
