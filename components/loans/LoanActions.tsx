"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLoan } from "@/app/actions/loan";
import { Trash2, Edit2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { buildLoanEditPath } from "@/lib/loans/url";

export default function LoanActions({ loanId, loanName }: { loanId: string; loanName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteLoan(loanId);
    if (res?.success) {
      router.push("/loans");
    } else {
      setIsDeleting(false);
      setShowConfirm(false);
      alert(res?.error || "Failed to delete loan");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={buildLoanEditPath(loanName, loanId)} className="btn-secondary min-h-10 px-4 py-2 text-sm">
        <Edit2 className="h-4 w-4" />
        Edit
      </Link>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="btn-secondary min-h-10 border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      ) : (
        <div className="animate-fade-in flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-1 pl-3">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-xs font-medium text-red-700">Are you sure?</span>
          <button
            onClick={() => setShowConfirm(false)}
            className="rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-white"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Confirm"}
          </button>
        </div>
      )}
    </div>
  );
}
