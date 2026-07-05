"use client";

import { useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartContainer } from "@/components/ui/ChartContainer";


type RangeKey = "3M" | "6M" | "1Y";

export type HealthSnapshotPoint = {
  id: string;
  capturedAt: string;
  affordabilityScore: number;
  dtiRatio: number;
  totalOutstanding: number;
};

function formatMonthLabel(dateText: string): string {
  return new Date(dateText).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

function monthsForRange(range: RangeKey): number {
  if (range === "3M") return 3;
  if (range === "6M") return 6;
  return 12;
}

function projectPoints(points: HealthSnapshotPoint[]): HealthSnapshotPoint[] {
  if (points.length < 2) {
    return [];
  }

  const last = points[points.length - 1];
  const previous = points[points.length - 2];
  const delta = last.affordabilityScore - previous.affordabilityScore;

  const futureDate = new Date(last.capturedAt);
  futureDate.setMonth(futureDate.getMonth() + 1);

  return [
    {
      id: `${last.id}-projection`,
      capturedAt: futureDate.toISOString(),
      affordabilityScore: Math.max(0, Math.min(100, Math.round(last.affordabilityScore + delta))),
      dtiRatio: Math.max(0, last.dtiRatio),
      totalOutstanding: Math.max(0, last.totalOutstanding - Math.max(0, last.totalOutstanding * 0.03)),
    },
  ];
}

export function getTrendInsight(snapshots: HealthSnapshotPoint[]): string {
  if (snapshots.length < 2) {
    return "Keep using Amortix monthly to build your health trend.";
  }

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const deltaScore = last.affordabilityScore - first.affordabilityScore;
  const deltaDTI = (last.dtiRatio - first.dtiRatio) * 100;

  if (deltaScore > 5) {
    return `Your financial health improved by ${deltaScore.toFixed(0)} points. You're building solid momentum.`;
  }

  if (deltaScore < -5) {
    return `Your health score dropped ${Math.abs(deltaScore).toFixed(0)} points. Consider identifying avoidable interest costs.`;
  }

  if (deltaDTI < -5) {
    return "Your health score is stable, but your Debt-to-Income ratio is improving. Good progress!";
  }

  return "Your financial health has stayed stable. A consistent trend is a good sign for lenders.";
}

export default function HealthTrendChart({ snapshots }: { snapshots: HealthSnapshotPoint[] }) {
  const [range, setRange] = useState<RangeKey>("6M");

  const processedSnapshots = useMemo(() => {
    // 1. Sort by date
    const sorted = [...snapshots].sort(
      (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    );

    // 2. Group by month-year to ensure one point per month
    const monthlyData: Record<string, HealthSnapshotPoint> = {};
    sorted.forEach((s) => {
      const key = new Date(s.capturedAt).toLocaleDateString("en-US", { month: "2-digit", year: "numeric" });
      monthlyData[key] = s; // Keep the latest for that month
    });

    const months = Object.values(monthlyData);
    const count = monthsForRange(range);
    
    return months.slice(-count);
  }, [range, snapshots]);

  const projected = useMemo(() => projectPoints(processedSnapshots), [processedSnapshots]);

  const chartData = useMemo(() => {
    const hasProjection = projected.length > 0;
    const data = processedSnapshots.map((snapshot, index) => ({
      month: formatMonthLabel(snapshot.capturedAt),
      affordabilityScore: snapshot.affordabilityScore,
      projectedScore: hasProjection && index === processedSnapshots.length - 1 ? snapshot.affordabilityScore : null,
      dtiRatioPercent: Math.round(snapshot.dtiRatio * 100),
      totalOutstanding: snapshot.totalOutstanding,
    }));

    if (data.length > 0 && projected.length > 0) {
      const lastPoint = data[data.length - 1];
      const projectionRows = projected.map((snapshot) => ({
        month: formatMonthLabel(snapshot.capturedAt),
        affordabilityScore: null,
        projectedScore: snapshot.affordabilityScore,
        dtiRatioPercent: Math.round(snapshot.dtiRatio * 100),
        totalOutstanding: snapshot.totalOutstanding,
        // Helper for dot connection
        lastActualScore: lastPoint.affordabilityScore,
      }));
      return [...data, ...projectionRows];
    }

    return data;
  }, [processedSnapshots, projected]);

  const trendInsight = useMemo(() => getTrendInsight(processedSnapshots), [processedSnapshots]);

  const commonXAxis = (
    <XAxis 
      dataKey="month" 
      tickLine={false} 
      axisLine={false} 
      tick={{ fontSize: 10, fill: "#64748B" }} 
      dy={10}
    />
  );

  if (processedSnapshots.length < 2) {
    return (
      <div className="card transition-all duration-300">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-amortix-navy">Financial health over time</h2>
            <p className="text-[11px] text-amortix-slate">History builds as you use Amortix</p>
          </div>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-amortix-frost">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-amortix-emerald" />
          </div>
        </div>
        <div className="flex h-[288px] items-center justify-center rounded-2xl border border-dashed border-amortix-border-light bg-amortix-frost/30">
          <p className="text-xs text-amortix-slate">Need at least 2 monthly snapshots to show trend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card transition-all duration-300">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-amortix-navy">Financial health over time</h2>
          <p className="text-[11px] text-amortix-slate">Affordability score and DTI trend</p>
        </div>

        <div className="inline-flex items-center rounded-xl bg-amortix-frost p-1">
          {(["3M", "6M", "1Y"] as RangeKey[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-lg px-4 py-1.5 text-[10px] font-semibold transition-all ${
                range === option 
                  ? "bg-white text-amortix-navy shadow-sm" 
                  : "text-amortix-slate hover:text-amortix-navy"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-amortix-border-light pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#10B981]" />
          <span className="text-[10px] font-medium text-amortix-slate">Health Score (Affordability)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 border-t-2 border-dashed border-[#10B981]" />
          <span className="text-[10px] font-medium text-amortix-slate">Projected Health Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
          <span className="text-[10px] font-medium text-amortix-slate">Debt-to-Income (DTI) Ratio</span>
        </div>
      </div>

      <ChartContainer height={288}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>

          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            {commonXAxis}
            <YAxis 
              yAxisId="left" 
              domain={[0, 100]} 
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: "#64748B" }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 100]} 
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: "#64748B" }} 
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-amortix-border-light bg-white p-3 shadow-xl">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amortix-slate">{label}</p>
                      <div className="space-y-1.5">
                        {payload.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-[11px] text-amortix-slate">
                                {item.name === "affordabilityScore" ? "Health Score" : 
                                 item.name === "projectedScore" ? "Projected" : "DTI Ratio"}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-amortix-navy">
                              {item.name === "dtiRatioPercent" ? `${Number(item.value).toFixed(1)}%` : item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine yAxisId="left" y={75} stroke="#10B981" strokeDasharray="3 3" />
            <ReferenceLine yAxisId="left" y={50} stroke="#F59E0B" strokeDasharray="3 3" />

            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="affordabilityScore" 
              stroke="#10B981" 
              fill="url(#colorHealth)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="affordabilityScore"
            />
            
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="projectedScore" 
              stroke="#10B981" 
              strokeDasharray="5 5" 
              strokeWidth={2} 
              dot={false}
              connectNulls
              name="projectedScore"
            />

            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="dtiRatioPercent" 
              stroke="#F59E0B" 
              strokeDasharray="5 5" 
              dot={{ r: 3, fill: "#F59E0B", strokeWidth: 1, stroke: "#fff" }}
              strokeWidth={2} 
              name="dtiRatioPercent"
            />

            <defs>
              <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>


      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-amortix-emerald">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-[11px] leading-relaxed text-amortix-slate">{trendInsight}</p>
      </div>
    </div>
  );
}
