"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { addLoanToWorkspace } from "@/app/actions/workspace";
import { formatCurrency } from "@/lib/calculations";
import { Check, Plus, Minus } from "lucide-react";

interface LoanAssignmentListProps {
  userLoans: any[];
  workspaceId: string;
  canManage: boolean;
}

export default function LoanAssignmentList({
  userLoans,
  workspaceId,
  canManage,
}: LoanAssignmentListProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (loanId: string, currentWorkspaceId: string | null) => {
    if (!canManage) return;

    const targetWorkspaceId = currentWorkspaceId === workspaceId ? null : workspaceId;

    startTransition(async () => {
      const res = await addLoanToWorkspace(loanId, targetWorkspaceId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          targetWorkspaceId
            ? "Loan successfully shared with this workspace."
            : "Loan removed from this workspace (now personal)."
        );
        window.location.reload();
      }
    });
  };

  if (userLoans.length === 0) {
    return (
      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <p className="text-xs text-slate-500 font-medium">You don't have any loans yet.</p>
        <p className="text-[10px] text-slate-400 mt-1">Create a loan first to share it with this workspace.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-white">
      {userLoans.map((loan) => {
        const isShared = loan.workspaceId === workspaceId;
        const currencyCode = loan.currency || "INR";

        return (
          <div
            key={loan.id}
            className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50/50 transition-colors"
          >
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-800 truncate">
                {loan.name}
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                <span>{formatCurrency(loan.outstandingBalance, currencyCode)} left</span>
                <span>•</span>
                <span>{loan.interestRate}%</span>
                <span>•</span>
                <span>{loan.loanType}</span>
                {loan.workspaceId && !isShared && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 font-medium">Shared in another workspace</span>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {canManage ? (
                <button
                  onClick={() => handleToggle(loan.id, loan.workspaceId)}
                  disabled={isPending || (loan.workspaceId && !isShared)}
                  className={`flex h-7 px-3 items-center gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                    isShared
                      ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                  }`}
                >
                  {isShared ? (
                    <>
                      <Minus className="h-3 w-3" />
                      Unshare
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      Share
                    </>
                  )}
                </button>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    isShared ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isShared ? "Shared" : "Personal"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
