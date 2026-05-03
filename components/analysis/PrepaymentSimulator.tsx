"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartContainer } from "@/components/ui/ChartContainer";
import {
  generateAmortizationSchedule,
  getScheduleSummary,
} from "@/lib/calculations/amortization";


function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function estimateRemainingMonths(outstanding: number, annualRate: number, emi: number, fallback: number): number {
  if (outstanding <= 0 || emi <= 0) {
    return Math.max(1, fallback);
  }

  if (annualRate <= 0) {
    return Math.max(1, Math.ceil(outstanding / emi));
  }

  const r = annualRate / 12 / 100;
  const denominator = emi - outstanding * r;
  if (denominator <= 0) {
    return Math.max(1, fallback);
  }

  const months = Math.log(emi / denominator) / Math.log(1 + r);
  if (!Number.isFinite(months) || months <= 0) {
    return Math.max(1, fallback);
  }

  return Math.max(1, Math.ceil(months));
}

type TabKey = "lump" | "monthly" | "hybrid";

export default function PrepaymentSimulator({
  outstandingBalance,
  interestRate,
  tenureMonths,
  emiAmount,
}: {
  outstandingBalance: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
}) {
  const [tab, setTab] = useState<TabKey>("lump");
  const [lumpSum, setLumpSum] = useState(10000);
  const [monthlyExtra, setMonthlyExtra] = useState(2000);
  const [hybridLump, setHybridLump] = useState(10000);
  const [hybridMonthly, setHybridMonthly] = useState(1000);

  const remainingMonths = useMemo(
    () => estimateRemainingMonths(outstandingBalance, interestRate, emiAmount, tenureMonths),
    [outstandingBalance, interestRate, emiAmount, tenureMonths]
  );

  const baselineSchedule = useMemo(
    () => generateAmortizationSchedule(outstandingBalance, interestRate, remainingMonths, 0),
    [outstandingBalance, interestRate, remainingMonths]
  );

  const baselineSummary = useMemo(() => getScheduleSummary(baselineSchedule), [baselineSchedule]);

  const scenario = useMemo(() => {
    const lump = tab === "lump" ? lumpSum : tab === "hybrid" ? hybridLump : 0;
    const extra = tab === "monthly" ? monthlyExtra : tab === "hybrid" ? hybridMonthly : 0;

    const adjustedOutstanding = Math.max(0, outstandingBalance - lump);
    const schedule = generateAmortizationSchedule(adjustedOutstanding, interestRate, remainingMonths, extra);
    const summary = getScheduleSummary(schedule);

    return { lump, extra, schedule, summary };
  }, [tab, lumpSum, monthlyExtra, hybridLump, hybridMonthly, outstandingBalance, interestRate, remainingMonths]);

  const monthsSaved = Math.max(0, baselineSummary.months - scenario.summary.months);
  const interestSaved = Math.max(0, baselineSummary.totalInterest - scenario.summary.totalInterest);

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + scenario.summary.months);

  const chartData = useMemo(() => {
    const maxMonths = Math.max(baselineSchedule.length, scenario.schedule.length);
    return Array.from({ length: maxMonths }, (_, index) => ({
      month: index + 1,
      original: baselineSchedule[index]?.outstandingBalance ?? 0,
      scenario: scenario.schedule[index]?.outstandingBalance ?? 0,
    }));
  }, [baselineSchedule, scenario.schedule]);

  const fdRate = 0.07;
  const months = scenario.summary.months;
  const monthlyRate = fdRate / 12;
  const scenarioCapital = scenario.lump + scenario.extra * months;
  const futureValueLump = scenario.lump * Math.pow(1 + monthlyRate, months);
  const futureValueMonthly = scenario.extra > 0
    ? scenario.extra * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : 0;
  const fdReturn = Math.round((futureValueLump + futureValueMonthly) * 100) / 100;
  const netAdvantage = interestSaved - fdReturn;

  return (
    <div className="section-block space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "lump", label: "Lump sum" },
          { key: "monthly", label: "Monthly extra" },
          { key: "hybrid", label: "Hybrid" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key as TabKey)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              tab === item.key ? "bg-amortix-navy text-white" : "bg-amortix-frost text-amortix-slate"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "lump" ? (
        <div>
          <label htmlFor="lumpSumInput" className="text-xs text-amortix-slate">
            Lump sum amount
          </label>
          <input
            id="lumpSumInput"
            type="number"
            className="input mt-1"
            value={lumpSum}
            min={0}
            step={1000}
            onChange={(event) => setLumpSum(Number(event.target.value) || 0)}
          />
        </div>
      ) : null}

      {tab === "monthly" ? (
        <div>
          <label htmlFor="monthlyExtraInput" className="text-xs text-amortix-slate">
            Monthly extra
          </label>
          <input
            id="monthlyExtraInput"
            type="number"
            className="input mt-1"
            value={monthlyExtra}
            min={0}
            step={500}
            onChange={(event) => setMonthlyExtra(Number(event.target.value) || 0)}
          />
        </div>
      ) : null}

      {tab === "hybrid" ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="hybridLumpInput" className="text-xs text-amortix-slate">
              Lump sum today
            </label>
            <input
              id="hybridLumpInput"
              type="number"
              className="input mt-1"
              value={hybridLump}
              min={0}
              step={1000}
              onChange={(event) => setHybridLump(Number(event.target.value) || 0)}
            />
          </div>
          <div>
            <label htmlFor="hybridMonthlyInput" className="text-xs text-amortix-slate">
              Recurring monthly extra
            </label>
            <input
              id="hybridMonthlyInput"
              type="number"
              className="input mt-1"
              value={hybridMonthly}
              min={0}
              step={500}
              onChange={(event) => setHybridMonthly(Number(event.target.value) || 0)}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="metric-card">
          <p className="mb-1 text-[11px] tracking-[0.03em] text-slate-400">Months saved</p>
          <p className="num mt-1 text-xl text-amortix-emerald">{monthsSaved}</p>
        </div>
        <div className="metric-card">
          <p className="mb-1 text-[11px] tracking-[0.03em] text-slate-400">Interest saved</p>
          <p className="num mt-1 text-xl text-amortix-emerald">{formatCurrency(interestSaved)}</p>
        </div>
        <div className="metric-card">
          <p className="mb-1 text-[11px] tracking-[0.03em] text-slate-400">New payoff date</p>
          <p className="mt-1 text-sm text-amortix-navy">{payoffDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
        </div>
        <div className="metric-card">
          <p className="mb-1 text-[11px] tracking-[0.03em] text-slate-400">Reduced tenure</p>
          <p className="mt-1 text-sm text-amortix-navy">{scenario.summary.months} months</p>
        </div>
      </div>

      <ChartContainer height={120}>
        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748B" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#64748B" }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Outstanding"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0" }}
            />
            <Line type="monotone" dataKey="original" stroke="#94A3B8" strokeDasharray="5 4" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="scenario" stroke="#059669" dot={false} strokeWidth={2.2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>


      <p className="text-xs text-amortix-slate">
        If you invested {formatCurrency(scenarioCapital)} in a fixed deposit at 7%, you&apos;d earn {formatCurrency(fdReturn)}.
        Prepaying saves {formatCurrency(interestSaved)} in interest, net advantage: {formatCurrency(netAdvantage)}.
      </p>
    </div>
  );
}
