"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { ChartContainer } from "@/components/ui/ChartContainer";

interface Loan {
  id: string;
  name: string;
  outstandingBalance: number;
}

const COLORS = ["#0D1F3C", "#059669", "#F59E0B", "#DC2626", "#64748B", "#1A3258", "#10B981"];

function formatTooltipValue(value: string | number | readonly (string | number)[] | undefined) {
  const normalized = Array.isArray(value) ? value[0] : value;
  return `₹${Number(normalized ?? 0).toLocaleString("en-IN")}`;
}

export default function DebtDistributionChart({ loans }: { loans: Loan[] }) {
  const data = loans.map((loan) => ({
    name: loan.name,
    value: loan.outstandingBalance,
  }));

  if (loans.length === 0) return null;

  return (
    <ChartContainer height={300}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] || COLORS[0]} stroke="none" />
            ))}
          </Pie>
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
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
