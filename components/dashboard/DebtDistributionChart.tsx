"use client";

import React, { useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useInView } from "framer-motion";

type DebtDistributionProps = {
  loans: Array<{
    name: string;
    balance: number;
    color: string;
  }>;
};

export default function DebtDistributionChart({ loans }: DebtDistributionProps) {
  const total = loans.reduce((sum, loan) => sum + loan.balance, 0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  if (total === 0) return null;

  return (
    <div ref={ref} className="flex flex-row items-center gap-5 mt-6 min-h-[170px]">
      <div className="relative w-44 h-44 flex-shrink-0 z-10">
        {isInView && (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={loans}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={84}
              paddingAngle={0}
              dataKey="balance"
              stroke="none"
              animationDuration={800}
            >
              {loans.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              wrapperStyle={{ zIndex: 20, outline: "none" }}
              formatter={(value: any) => [`₹${Number(value || 0).toLocaleString("en-IN")}`, "Balance"]}
              contentStyle={{ 
                borderRadius: 12, 
                border: "none", 
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                boxShadow: "0 12px 32px rgba(13, 27, 47, 0.15)",
                padding: "8px 12px",
                zIndex: 20
              }}
              itemStyle={{ fontSize: "11px", fontWeight: 600, color: "#17314f" }}
              labelStyle={{ display: "none" }}
            />
          </PieChart>
        </ResponsiveContainer>
        )}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-0.5 z-0">
          <p className="text-[10px] font-medium text-amortix-slate uppercase tracking-wider leading-none mb-1.5">Total</p>
          <p className="num text-[20px] font-medium text-amortix-navy leading-none">
            ₹{(total / 100000).toFixed(1)}L
          </p>
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-4">
        {loans.map((loan, index) => (
          <div key={index} className="flex items-start gap-3.5 group">
            <span 
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full mt-1 transition-transform group-hover:scale-125 shadow-sm" 
              style={{ backgroundColor: loan.color }} 
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-amortix-navy leading-tight mb-1 transition-colors group-hover:text-amortix-emerald">{loan.name}</p>
              <div className="flex items-center gap-2">
                <p className="num text-[11px] font-bold text-amortix-slate leading-none">
                  {Math.round((loan.balance / total) * 100)}%
                </p>
                <p className="text-[9px] text-amortix-slate/50 font-medium uppercase tracking-widest">weight</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
