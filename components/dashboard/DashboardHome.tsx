"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, MessageSquarePlus, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  formatCurrency,
  calculateAffordabilityScore,
  getProjectedPayoffDate,
} from "@/lib/calculations";
import { fadeUpVariants, pageTransition, staggerContainer } from "@/lib/animations";
import AffordabilityGauge from "@/components/dashboard/AffordabilityGauge";
import LoanProgressBar from "@/components/dashboard/LoanProgressBar";
import AIInsightCard from "@/components/dashboard/AIInsightCard";
import HealthTrendChart, { type HealthSnapshotPoint } from "@/components/analysis/HealthTrendChart";
import DebtDistributionChart from "@/components/dashboard/DebtDistributionChart";

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
  profile: {
    monthlyIncome?: number | null;
    monthlyExpenses?: number | null;
    creditScoreRange?: string | null;
    hasEmergencyFund?: boolean | null;
    emergencyFundMonths?: number | null;
    currency?: string | null;
  } | null;
  snapshots: HealthSnapshotPoint[];
};

const loanColors = ["#17314f", "#118c76", "#f59f3a", "#378ADD", "#d14d5b", "#64748b"];

export default function DashboardHome({ loans, userName, profile, snapshots }: DashboardHomeProps) {
  const reduce = useReducedMotion();
  const currencyCode = profile?.currency ?? "INR";

  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const totalEMI = loans.reduce((sum, loan) => sum + loan.emiAmount, 0);
  const avgRate =
    totalOutstanding > 0
      ? loans.reduce((sum, loan) => sum + loan.interestRate * loan.outstandingBalance, 0) / totalOutstanding
      : 0;

  const activeLoans = useMemo(() => loans.filter((l) => l.outstandingBalance > 0.01), [loans]);
  const hasLoans = activeLoans.length > 0;

  const priorityLoans = useMemo(() => {
    return [...activeLoans].sort((a, b) => b.interestRate - a.interestRate).slice(0, 3);
  }, [activeLoans]);

  const affordability = useMemo(() => {
    if (
      !profile?.monthlyIncome ||
      profile.monthlyIncome <= 0 ||
      profile.monthlyExpenses === undefined ||
      profile.monthlyExpenses === null
    ) {
      return null;
    }

    return calculateAffordabilityScore({
      monthlyIncome: profile.monthlyIncome,
      monthlyExpenses: profile.monthlyExpenses,
      totalMonthlyEMI: totalEMI,
      creditScoreRange: profile.creditScoreRange ?? "Not provided",
      hasEmergencyFund: Boolean(profile.hasEmergencyFund),
      emergencyFundMonths: profile.emergencyFundMonths ?? 0,
      loans: activeLoans.map((loan) => ({
        annualRate: loan.interestRate,
        tenureMonths: loan.tenureMonths,
        rateType: loan.rateType,
      })),
    });
  }, [activeLoans, profile, totalEMI]);

  const affordabilityScore = affordability?.score ?? null;
  const hasAffordability = affordabilityScore !== null;

  const debtFreeDate = hasLoans ? getProjectedPayoffDate(activeLoans) : null;
  const projectedMonths = debtFreeDate ? Math.max(0, (debtFreeDate.getFullYear() - new Date().getFullYear()) * 12 + debtFreeDate.getMonth() - new Date().getMonth()) : 0;

  const distributionData = useMemo(() => {
    return loans
      .filter((l) => l.outstandingBalance > 0)
      .map((l, i) => ({
        name: l.name,
        balance: l.outstandingBalance,
        color: loanColors[i % loanColors.length],
      }));
  }, [loans]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = userName.trim().split(" ")[0] || userName;

  const validSnapshots = useMemo(() => {
    return snapshots.filter(
      (snapshot) =>
        snapshot.totalOutstanding > 0 ||
        snapshot.dtiRatio > 0 ||
        (hasLoans && snapshot.affordabilityScore > 0)
    );
  }, [snapshots, hasLoans]);

  const emiToIncomeRatio = profile?.monthlyIncome ? Math.round((totalEMI / profile.monthlyIncome) * 100) : 0;
  const monthlySurplus = profile?.monthlyIncome ? Math.max(0, profile.monthlyIncome - (profile.monthlyExpenses ?? 0) - totalEMI) : null;

  const insightText = useMemo(() => {
    if (!hasLoans) {
      return "Add your first loan to begin tracking repayment momentum, run comparisons, and access personalized AI insights.";
    }

    const highest = activeLoans.reduce((best, candidate) => 
      candidate.interestRate > best.interestRate ? candidate : best, activeLoans[0]
    );

    if (emiToIncomeRatio > 40) {
      return `Warning: Your current monthly EMI obligations consume ${emiToIncomeRatio}% of your reported income. This is above the recommended 40% threshold. Focus on paying down high-cost balances.`;
    }

    if (highest && highest.interestRate > 12) {
      return `Targeting your payoff strategy around the "${highest.name}" loan at ${highest.interestRate}% could save you thousands in interest over the lifetime of the debt.`;
    }

    if (activeLoans.length > 1) {
      return `You have ${activeLoans.length} active loans. Repaying the highest-rate balance first using the Avalanche strategy will mathematically save you the most interest and shorten your payoff.`;
    }

    return `By allocating an additional ₹5,000 toward your outstanding debt, you can shorten your payoff horizon and clear the balance much faster.`;
  }, [hasLoans, activeLoans, emiToIncomeRatio]);

  // Clean, meaningful portfolio stats
  const heroStats = [
    { label: "Active loans", value: String(activeLoans.length), muted: !hasLoans },
    { label: "Debt-free by", value: debtFreeDate ? debtFreeDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "-", muted: !hasLoans },
    { label: "Average rate", value: hasLoans ? `${avgRate.toFixed(1)}%` : "-", muted: !hasLoans },
  ];

  return (
    <motion.div variants={pageTransition} initial={reduce ? false : "hidden"} animate="visible" className="space-y-6">
      <PageHero
        badge={{ icon: Sparkles, label: "Portfolio overview" }}
        title="Dashboard"
        description={`${greeting}, ${firstName}. Your workspace is optimized with smart tools for efficient loan payoff and debt reduction.`}
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
        {emiToIncomeRatio > 100 && (
          <div className="flex items-center gap-3 rounded-full border border-red-500/20 bg-red-50 px-4 py-2 mt-4 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-xs font-semibold text-red-700">Critical: Your EMI obligations exceed your monthly income.</p>
          </div>
        )}
      </PageHero>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <MetricCard
          label="Total outstanding"
          value={formatCurrency(totalOutstanding, currencyCode)}
          description="Across every active balance"
          valueColor={totalOutstanding > 0 ? "default" : "muted"}
          isEmpty={!hasLoans}
        />
        <MetricCard
          label="Monthly EMI"
          value={formatCurrency(totalEMI, currencyCode)}
          description="Your current recurring outflow"
          valueColor={totalEMI > 0 ? "default" : "muted"}
          isEmpty={!hasLoans}
        />
        <MetricCard
          label="Debt-to-Income"
          value={profile?.monthlyIncome ? `${emiToIncomeRatio}%` : "—"}
          description={
            profile?.monthlyIncome
              ? emiToIncomeRatio > 40
                ? "Above 40% safe threshold"
                : "Within 40% safe threshold"
              : "Add income in profile"
          }
          valueColor={
            !profile?.monthlyIncome
              ? "muted"
              : emiToIncomeRatio > 40
              ? "red"
              : emiToIncomeRatio > 30
              ? "amber"
              : "emerald"
          }
          isEmpty={!profile?.monthlyIncome}
        />
        <MetricCard
          label="Debt-free by"
          value={debtFreeDate ? debtFreeDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "-"}
          description={debtFreeDate ? "Baseline strategy" : "Add loans to see this"}
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
              <HealthTrendChart snapshots={validSnapshots} />
            </motion.div>

            {/* Priority Balances Preview — limited to top 3 to avoid duplicating the full loans page */}
            <motion.div variants={fadeUpVariants} custom={1} className="card space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[13px] font-medium text-amortix-navy">Priority loans</h2>
                  <p className="text-[11px] text-amortix-slate">Highest-interest balances to prioritize for payoff.</p>
                </div>
                <Link href="/loans" className="text-xs font-medium text-amortix-emerald hover:text-emerald-700 transition-colors">
                  View all ({activeLoans.length})
                </Link>
              </div>

              <div className="space-y-3">
                {priorityLoans.map((loan, index) => {
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
                        <span>{formatCurrency(loan.outstandingBalance, currencyCode)} left</span>
                        <span>{formatCurrency(loan.emiAmount, currencyCode)}/mo</span>
                      </div>
                      <LoanProgressBar value={paidPercentForLoan} color={color} />
                    </div>
                  );
                })}
              </div>

              {activeLoans.length > 3 && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Showing top 3 of {activeLoans.length} active loans
                  </span>
                  <Link href="/loans" className="inline-flex items-center gap-1 text-xs font-semibold text-amortix-emerald hover:text-emerald-700 transition-colors">
                    Manage all loans
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUpVariants} custom={2}>
              <AIInsightCard insight={insightText} />
            </motion.div>

          </motion.div>

          <motion.div variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible" className="space-y-4">
            <motion.div variants={fadeUpVariants} custom={0} className="card space-y-4">
              <div className="mb-1">
                <h2 className="text-[13px] font-medium text-amortix-navy">Affordability score</h2>
                <p className="text-[11px] text-amortix-slate">A quick read on repayment sustainability.</p>
              </div>
              {hasAffordability && affordabilityScore !== null ? (
                <AffordabilityGauge score={affordabilityScore} />
              ) : (
                <div className="rounded-xl border border-dashed border-amortix-border-mid bg-amortix-frost px-4 py-8 text-center text-xs text-amortix-slate">
                  Add profile data to calculate an affordability score.
                </div>
              )}

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
                  <span className="text-[11px] text-amortix-slate">Monthly net surplus</span>
                  <span className="num text-[11px] text-slate-600 font-medium">{monthlySurplus !== null ? formatCurrency(monthlySurplus, currencyCode) : "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] text-amortix-slate">Estimated payoff horizon</span>
                  <span className="num text-[11px] text-emerald-600 font-medium">{projectedMonths || 0} months</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] text-amortix-slate">Risk signal</span>
                  <span className={`num text-[11px] font-medium ${hasAffordability && affordabilityScore !== null && affordabilityScore >= 70 ? "text-amortix-emerald" : "text-amortix-red"}`}>{hasAffordability && affordabilityScore !== null && affordabilityScore >= 70 ? "Stable" : "Monitor"}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUpVariants} custom={1} className="card space-y-4">
              <div>
                <h2 className="text-[13px] font-medium text-amortix-navy">Debt distribution</h2>
                <p className="text-[11px] text-amortix-slate">Percentage breakdown of your portfolio</p>
              </div>

              <DebtDistributionChart loans={distributionData} />
            </motion.div>
          </motion.div>
        </section>
      )}
    </motion.div>
  );
}
