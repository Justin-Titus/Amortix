"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, MessageSquarePlus, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { motion, useReducedMotion } from "framer-motion";
import { formatCurrency } from "@/lib/calculations/emi";
import { fadeUpVariants, pageTransition, staggerContainer } from "@/lib/animations";
import AffordabilityGauge from "@/components/dashboard/AffordabilityGauge";
import LoanProgressBar from "@/components/dashboard/LoanProgressBar";
import AIInsightCard from "@/components/dashboard/AIInsightCard";
import HealthTrendChart, { type HealthSnapshotPoint } from "@/components/analysis/HealthTrendChart";
import InterestLeakDetector from "@/components/analysis/InterestLeakDetector";
import type { FinancialProfileInput } from "@/lib/analysis/interest-leak";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";

type Loan = {
  id: string;
  name: string;
  loanType: string;
  principal: number;
  outstandingBalance: number;
  interestRate: number;
  rateType: "FIXED" | "FLOATING";
  tenureMonths: number;
  emiAmount: number;
};

type DashboardHomeProps = {
  loans: Loan[];
  userName: string;
  profile: FinancialProfileInput | null;
  snapshots: HealthSnapshotPoint[];
};

const loanColors = ["#1E3A5F", "#059669", "#F59E0B", "#378ADD", "#DC2626", "#34D399"];

function formatCompactCurrency(amount: number): string {
  if (amount === 0) return "₹0";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${Math.round(amount / 100000)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function scoreColor(score: number): "default" | "emerald" | "amber" | "red" {
  if (score >= 75) return "emerald";
  if (score >= 50) return "amber";
  return "red";
}

function scoreZoneLabel(score: number): string {
  if (score >= 75) return "Healthy repayment zone";
  if (score >= 50) return "Watch your monthly load";
  return "Action needed this cycle";
}

function getMonthYear(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function DashboardHome({ loans, userName, profile, snapshots }: DashboardHomeProps) {
  const reduce = useReducedMotion();

  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const totalEMI = loans.reduce((sum, loan) => sum + loan.emiAmount, 0);
  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
  const avgRate =
    totalOutstanding > 0
      ? loans.reduce((sum, loan) => sum + loan.interestRate * loan.outstandingBalance, 0) / totalOutstanding
      : 0;

  const paidPercent = totalPrincipal > 0 ? ((totalPrincipal - totalOutstanding) / totalPrincipal) * 100 : 0;
  const rateScore = Math.max(0, 100 - avgRate * 4);
  const computedHealthScore = loans.length > 0 ? Math.round(rateScore * 0.7 + paidPercent * 0.3) : 100;
  const healthScore = Math.max(0, Math.min(100, computedHealthScore));
  const hasLoans = loans.length > 0;

  const projectedMonths = totalEMI > 0 ? Math.max(1, Math.ceil(totalOutstanding / totalEMI)) : 0;
  const debtFreeDate =
    projectedMonths > 0 ? new Date(new Date().setMonth(new Date().getMonth() + projectedMonths)) : null;

  const chartData = useMemo(() => {
    const today = new Date();
    const base = totalOutstanding;

    return Array.from({ length: 12 }, (_, index) => {
      const month = new Date(today.getFullYear(), today.getMonth() + index, 1);
      const balance = Math.max(0, base - index * totalEMI * 0.9);

      return {
        index,
        month: month.toLocaleDateString("en-IN", { month: "short" }),
        balance,
      };
    });
  }, [totalOutstanding, totalEMI]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = userName.trim().split(" ")[0] || userName;
  const snapshotCount = useMemo(() => {
    const uniqueMonths = new Set(
      snapshots.map((snapshot) =>
        new Date(snapshot.capturedAt).toLocaleDateString("en-US", {
          month: "2-digit",
          year: "numeric",
        })
      )
    );
    return uniqueMonths.size;
  }, [snapshots]);

  const emiToIncomeRatio = profile?.monthlyIncome ? Math.round((totalEMI / profile.monthlyIncome) * 100) : 0;

  const getDynamicInsight = (): string => {
    if (!hasLoans) return "Add your first loan to begin tracking repayment momentum.";

    const highest = loans.reduce((best, candidate) => (best.interestRate > candidate.interestRate ? best : candidate));

    if (emiToIncomeRatio > 45) {
      return `Your EMI load is at ${emiToIncomeRatio}% of income, which is above the 40% comfort zone.`;
    }

    return `Your highest-cost loan is at ${highest.interestRate}% - prioritize it in your strategy.`;
  };

  const insightText = useMemo(() => {
    if (!hasLoans) {
      return "Add your first loan to begin tracking repayment momentum, run comparisons, and access personalized AI insights.";
    }

    const highest = loans.reduce((best, candidate) => 
      candidate.interestRate > best.interestRate ? candidate : best, loans[0]
    );

    if (emiToIncomeRatio > 40) {
      return `Warning: Your current monthly EMI obligations consume ${emiToIncomeRatio}% of your reported income. This is above the recommended 40% threshold. Focus on paying down high-cost balances.`;
    }

    if (highest && highest.interestRate > 12) {
      return `Targeting your payoff strategy around the "${highest.name}" loan at ${highest.interestRate}% could save you thousands in interest over the lifetime of the debt.`;
    }

    if (loans.length > 1) {
      return `You have ${loans.length} active loans. Repaying the highest-rate balance first using the Avalanche strategy will mathematically save you the most interest and shorten your payoff.`;
    }

    return `By allocating an additional ₹5,000 toward your outstanding debt, you can shorten your payoff horizon and clear the balance much faster.`;
  }, [hasLoans, loans, emiToIncomeRatio]);

  const heroStats = [
    { label: "Open loans", value: String(loans.length), muted: !hasLoans },
    { label: "Total outstanding", value: formatCompactCurrency(totalOutstanding), muted: !hasLoans },
    { label: "Health score", value: `${healthScore}/100`, muted: !hasLoans, color: healthScore >= 70 ? "text-emerald-500" : healthScore >= 40 ? "text-amber-500" : "text-red-500" },
    { label: "Monthly snapshots", value: String(snapshotCount), muted: snapshotCount === 0 },
  ];

  return (
    <motion.div variants={pageTransition} initial={reduce ? false : "hidden"} animate="visible" className="space-y-6">
      <PageHero
        badge={{ icon: Sparkles, label: "Portfolio overview" }}
        title="Dashboard"
        description={`${greeting}, ${firstName}. Your workspace is tuned for ${getMonthYear(new Date())} with a consistent card-based layout across the app.`}
        stats={heroStats}
        actions={
          <>
            <Link href="/loans/add" className="btn-primary">
              Add loan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/analysis" className="btn-secondary">
              Open analysis
            </Link>
          </>
        }
      >
        {emiToIncomeRatio > 100 ? (
          <div className="flex items-center gap-3 rounded-full border border-red-500/20 bg-red-50 px-4 py-2 mt-4 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-xs font-semibold text-red-700">Critical: Your EMI obligations exceed your monthly income.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="rounded-full border border-amortix-border-light bg-amortix-frost px-4 py-1.5 transition-all hover:bg-slate-50 cursor-default">
              <div className="flex items-center gap-3">
                <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-medium text-amortix-navy">
                  Dynamic insight: {hasLoans ? getDynamicInsight() : "Add a loan to unlock live repayments, health scoring, and strategy guidance."}
                </p>
              </div>
            </div>
            <Link href="/chat" className="inline-flex items-center gap-1.5 text-xs font-medium text-amortix-emerald hover:text-emerald-700 transition-colors">
              Ask AI advisor
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </PageHero>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <MetricCard
          label="Total outstanding"
          value={formatCurrency(totalOutstanding)}
          description="Across every active balance"
          valueColor={totalOutstanding > 0 ? "default" : "muted"}
          isEmpty={!hasLoans}
        />
        <MetricCard
          label="Monthly EMI"
          value={formatCurrency(totalEMI)}
          description="Your current recurring outflow"
          valueColor={totalEMI > 0 ? "default" : "muted"}
          isEmpty={!hasLoans}
        />
        <MetricCard
          label="Health score"
          value={hasLoans ? `${healthScore}/100` : "-"}
          description={hasLoans ? scoreZoneLabel(healthScore) : "Add loans to see this"}
          valueColor={hasLoans ? scoreColor(healthScore) : "muted"}
          isEmpty={!hasLoans}
        />
        <MetricCard
          label="Debt-free by"
          value={debtFreeDate ? debtFreeDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "-"}
          description={debtFreeDate ? "With current strategy" : "Add loans to see this"}
          valueColor={debtFreeDate ? "amber" : "muted"}
          isEmpty={!hasLoans}
        />
      </section>

      {!hasLoans ? (
        <section className="card">
          <EmptyState
            icon={<MessageSquarePlus className="h-5 w-5 text-amortix-emerald" />}
            title="Your cockpit is ready"
            description="Add your first loan to start tracking repayment progress, compare strategies, and get AI-powered insights."
            action={{ label: "Add your first loan", href: "/loans/add" }}
          />
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:gap-5">
          <motion.div variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible" className="space-y-4">
            <motion.div variants={fadeUpVariants} custom={0}>
              <HealthTrendChart snapshots={snapshots} />
            </motion.div>

            <motion.div variants={fadeUpVariants} custom={1} className="card space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[13px] font-medium text-amortix-navy">Active loans</h2>
                  <p className="text-[11px] text-amortix-slate">See payoff progress and prioritize faster wins.</p>
                </div>
                <Link href="/loans/add" className="text-xs font-medium text-amortix-emerald">
                  Add loan
                </Link>
              </div>

              {loans.length === 0 ? (
                <div className="py-10">
                  <EmptyState
                    variant="compact"
                    title="No loans yet"
                    description="Add your first loan to start tracking repayment progress and unlock personalized AI insights."
                    action={{ label: "Add your first loan", href: "/loans/add" }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.map((loan, index) => {
                    const paidPercentForLoan = Math.max(
                      0,
                      Math.min(100, ((loan.principal - loan.outstandingBalance) / Math.max(loan.principal, 1)) * 100)
                    );
                    const color = loanColors[index % loanColors.length];

                    return (
                      <div key={loan.id} className="rounded-card border border-amortix-border-light bg-white/80 p-3 shadow-[0_12px_28px_rgba(9,17,31,0.05)]">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                            <p className="truncate text-[13px] text-amortix-navy">{loan.name}</p>
                          </div>
                          <span className="badge-slate">{loan.interestRate.toFixed(2)}%</span>
                        </div>
                        <div className="mb-3 flex items-center justify-between text-xs text-amortix-slate">
                          <span>{formatCurrency(loan.outstandingBalance)} left</span>
                          <span>{formatCurrency(loan.emiAmount)}/mo</span>
                        </div>
                        <LoanProgressBar value={paidPercentForLoan} color={color} />
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUpVariants} custom={2}>
              <AIInsightCard insight={insightText} />
            </motion.div>

            <motion.div variants={fadeUpVariants} custom={3} className="card flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm transition-all hover:bg-emerald-100">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[13px] font-medium text-amortix-navy">Live analysis workspace</h2>
                <p className="mt-1 text-[12px] leading-6 text-amortix-slate">
                  Run extra-payment scenarios, compare strategies, and review affordability in real time.
                </p>
                <Link href="/analysis" className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amortix-emerald hover:text-emerald-700">
                  Open analysis
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible" className="space-y-4">
            <motion.div variants={fadeUpVariants} custom={0} className="card space-y-4">
              <div className="mb-1">
                <h2 className="text-[13px] font-medium text-amortix-navy">Affordability score</h2>
                <p className="text-[11px] text-amortix-slate">A quick read on repayment sustainability.</p>
              </div>
              <AffordabilityGauge score={healthScore} />

              <div className="mt-2 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] text-amortix-slate">EMI to debt ratio</span>
                  <span className="num text-[11px] text-slate-600 font-medium">{((totalEMI / Math.max(totalOutstanding, 1)) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] text-amortix-slate">Average interest rate</span>
                  <span className="num text-[11px] text-amber-500 font-medium">{avgRate.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] text-amortix-slate">Current monthly burn</span>
                  <span className="num text-[11px] text-slate-600 font-medium">{formatCurrency(totalEMI)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] text-amortix-slate">Estimated payoff horizon</span>
                  <span className="num text-[11px] text-emerald-600 font-medium">{projectedMonths || 0} months</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] text-amortix-slate">Risk signal</span>
                  <span className={`num text-[11px] font-medium ${healthScore >= 70 ? "text-amortix-emerald" : "text-amortix-red"}`}>{healthScore >= 70 ? "Stable" : "Monitor"}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUpVariants} custom={1}>
              <InterestLeakDetector
                loans={loans.map((loan) => ({
                  id: loan.id,
                  name: loan.name,
                  loanType: loan.loanType,
                  interestRate: loan.interestRate,
                  rateType: loan.rateType,
                  tenureMonths: loan.tenureMonths,
                  outstandingBalance: loan.outstandingBalance,
                  emiAmount: loan.emiAmount,
                }))}
                profile={profile}
              />
            </motion.div>

            <motion.div variants={fadeUpVariants} custom={2} className="card space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[13px] font-medium text-amortix-navy">Repayment momentum</h2>
                  <p className="text-[11px] text-amortix-slate">Balance trajectory for the next 12 months</p>
                </div>
                <span className="badge-green">Avalanche</span>
              </div>

              <ChartContainer height={176}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>

                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                    <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94A3B8" }} />
                    <Bar
                      dataKey="balance"
                      radius={[4, 4, 0, 0]}
                      animationDuration={reduce ? 0 : 800}
                      animationBegin={reduce ? 0 : 50}
                      animationEasing="ease-out"
                    >
                      {chartData.map((entry, index) => {
                        const color = index < 3 ? "rgba(17,140,118,0.25)" : index > 8 ? "#4de0b3" : "#118c76";
                        return <Cell key={`${entry.month}-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </motion.div>
          </motion.div>
        </section>
      )}
    </motion.div>
  );
}
