"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/calculations/emi";
import { ChartContainer } from "@/components/ui/ChartContainer";

interface DebtDataPoint {
  month: string;
  balance: number;
}

function formatTooltipValue(value: string | number | readonly (string | number)[] | undefined) {
  const normalized = Array.isArray(value) ? value[0] : value;
  return formatCurrency(Number(normalized ?? 0));
}

export default function DebtProgressionChart({ data }: { data: DebtDataPoint[] }) {
  if (data.length === 0) return null;

  return (
    <ChartContainer height={300}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D1F3C" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#0D1F3C" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "#64748B" }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "#64748B" }}
            tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          />
          <Tooltip 
            formatter={formatTooltipValue}
            contentStyle={{ 
              backgroundColor: "white", 
              borderRadius: "8px", 
              border: "1px solid #E2E8F0",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#0D1F3C"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBalance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
