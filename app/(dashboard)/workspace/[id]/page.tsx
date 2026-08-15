import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatCompactCurrency } from "@/lib/calculations";
import { getWorkspaceLoans, getWorkspaceMembers } from "@/app/actions/workspace";
import { ArrowRight, Settings, Users, Sparkles, Building2, Calendar, Receipt, Percent } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import MemberList from "@/components/workspace/MemberList";
import InviteForm from "@/components/workspace/InviteForm";
import LoanProgressBar from "@/components/dashboard/LoanProgressBar";
import { slugifyWorkspaceName } from "@/lib/workspace/url";

const loanColors = ["#17314f", "#118c76", "#f59f3a", "#378ADD", "#d14d5b", "#64748b"];

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const workspaceId = resolvedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/login");
  }

  // Fetch workspace details & verify membership
  let workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        where: { userId: user.id },
      },
    },
  });

  if (workspace && workspace.members.length > 0) {
    const slug = slugifyWorkspaceName(workspace.name);
    redirect(`/workspace/${slug}`);
  }

  if (!workspace) {
    const userWorkspaceMembers = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });
    workspace = userWorkspaceMembers.find(
      (m) => slugifyWorkspaceName(m.workspace.name) === workspaceId
    )?.workspace ?? null;
  }

  if (!workspace || workspace.members.length === 0) {
    notFound();
  }

  const userRole = workspace.members[0].role;

  // Fetch loans and members
  const loansRes = await getWorkspaceLoans(workspace.id);
  const membersRes = await getWorkspaceMembers(workspace.id);

  const loans = loansRes.loans || [];
  const members = membersRes.members || [];

  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const totalEMI = loans.reduce((sum, loan) => sum + loan.emiAmount, 0);
  const avgRate =
    totalOutstanding > 0
      ? loans.reduce((sum, loan) => sum + loan.interestRate * loan.outstandingBalance, 0) / totalOutstanding
      : 0;

  const activeLoans = loans.filter((l) => l.outstandingBalance > 0);
  const currencyCode = loans[0]?.currency ?? "INR";

  const heroStats = [
    { label: "Shared loans", value: String(activeLoans.length), muted: activeLoans.length === 0 },
    { label: "Total debt", value: formatCompactCurrency(totalOutstanding, currencyCode), muted: totalOutstanding === 0 },
    { label: "Monthly EMI", value: formatCompactCurrency(totalEMI, currencyCode), muted: totalEMI === 0 },
    { label: "Members", value: String(members.length), muted: false },
  ];

  return (
    <div className="space-y-6">
      <PageHero
        badge={{ icon: Users, label: `Workspace · ${userRole}` }}
        title={workspace.name}
        description={`Collaborative space for household debt management. Invite family members to view and track progress together.`}
        stats={heroStats}
        actions={
          <>
            <Link href={`/workspace/${slugifyWorkspaceName(workspace.name)}/settings`} className="btn-secondary flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage Workspace
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <MetricCard
          label="Total outstanding"
          value={formatCurrency(totalOutstanding, currencyCode)}
          description="Shared household balance"
          valueColor={totalOutstanding > 0 ? "default" : "muted"}
          isEmpty={loans.length === 0}
        />
        <MetricCard
          label="Monthly EMI"
          value={formatCurrency(totalEMI, currencyCode)}
          description="Combined recurring outflow"
          valueColor={totalEMI > 0 ? "default" : "muted"}
          isEmpty={loans.length === 0}
        />
        <MetricCard
          label="Avg Interest Rate"
          value={`${avgRate.toFixed(2)}%`}
          description="Weighted by outstanding amount"
          valueColor={avgRate > 0 ? "default" : "muted"}
          isEmpty={loans.length === 0}
        />
        <MetricCard
          label="My Workspace Role"
          value={userRole}
          description="Authorized privileges"
          valueColor="emerald"
        />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">
        {/* Main Column */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-amortix-navy">Shared Loans</CardTitle>
                <CardDescription className="text-xs text-amortix-slate">
                  Loans assigned to this collaborative workspace.
                </CardDescription>
              </div>
              {(userRole === "OWNER" || userRole === "ADMIN" || userRole === "MEMBER") && (
                <Link href={`/loans/add?workspaceId=${workspace.id}`} className="text-xs font-semibold text-amortix-emerald hover:underline">
                  + Add Workspace Loan
                </Link>
              )}
            </div>

            {loans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">No shared loans in this workspace yet</p>
                <p className="text-xs text-slate-400 mb-4 max-w-sm">
                  Add a new loan to this workspace, or assign your existing personal loans to it in settings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan, index) => {
                  const paidAmount = loan.principal - loan.outstandingBalance;
                  const paidPercent = Math.max(0, Math.min(100, (paidAmount / Math.max(loan.principal, 1)) * 100));
                  const color = loanColors[index % loanColors.length];

                  return (
                    <div key={loan.id} className="rounded-2xl border border-amortix-border-light bg-slate-50/50 p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <Link href={`/loans/${loan.id}`} className="font-semibold text-sm text-amortix-navy hover:text-amortix-emerald hover:underline">
                            {loan.name}
                          </Link>
                          {loan.lender && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{loan.lender}</p>
                          )}
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {loan.loanType}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 my-2">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Outstanding</p>
                          <p className="font-mono text-xs font-bold text-slate-700">{formatCurrency(loan.outstandingBalance, currencyCode)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">EMI Outflow</p>
                          <p className="font-mono text-xs font-bold text-slate-700">{formatCurrency(loan.emiAmount, currencyCode)}/mo</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Interest Rate</p>
                          <p className="font-mono text-xs font-bold text-slate-700">{loan.interestRate}%</p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Paid: {formatCurrency(paidAmount, currencyCode)}</span>
                          <span>{paidPercent.toFixed(1)}%</span>
                        </div>
                        <LoanProgressBar value={paidPercent} color={color} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="p-5">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-semibold text-amortix-navy">Members ({members.length})</CardTitle>
              <CardDescription className="text-xs">
                Household members sharing this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MemberList members={members} />
            </CardContent>
          </Card>

          {(userRole === "OWNER" || userRole === "ADMIN") && (
            <Card className="p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-semibold text-amortix-navy">Invite Partner</CardTitle>
                <CardDescription className="text-xs">
                  Send email invitation link to join.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <InviteForm workspaceId={workspace.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
