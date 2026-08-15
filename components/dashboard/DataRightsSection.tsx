"use client";

import { useState, useTransition } from "react";
import { Download, Trash2, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { exportUserData, deleteAccountAndData } from "@/app/actions/user-data";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function DataRightsSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportUserData();

      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }

      if ("exportData" in res && res.exportData) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(res.exportData, null, 2)
        )}`;
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `amortix-personal-data-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success("Personal data exported successfully!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirmInput.trim() !== "DELETE") {
      toast.error("Please type DELETE to confirm account erasure.");
      return;
    }

    startTransition(async () => {
      const res = await deleteAccountAndData();
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("Account and data permanently deleted.");
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[13px] font-medium text-[#0D1F3C] flex items-center gap-1.5">
            <Download className="h-4 w-4 text-emerald-600" />
            Export My Personal Data (DPDP §11)
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Download a machine-readable JSON copy of your profile, loans, payments, and consent logs.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 shrink-0"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Export JSON Data
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[13px] font-medium text-[#0D1F3C] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Statutory Data Rights Form
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Submit formal correction, grievance, or consent withdrawal requests to our Data Protection Officer.
          </p>
        </div>
        <Link
          href="/data-rights"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          Open Request Form
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <p className="text-[13px] font-medium text-red-600 flex items-center gap-1.5">
            <Trash2 className="h-4 w-4 text-red-600" />
            Delete Account & Personal Data (DPDP §12)
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Permanently erase all loans, payment records, workspace memberships, and login identity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Account & Data
        </button>
      </div>

      {showDeleteModal && (
        <div className="rounded-xl border border-red-300 bg-red-50/60 p-4 space-y-3 mt-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>Confirm Permanent Account & Data Erasure</span>
          </div>
          <p className="text-[11px] text-red-700/90 leading-relaxed">
            This action is irreversible under Section 12 of India&apos;s DPDP Act, 2023. All your loans, payment logs, workspace data, and account profile will be permanently destroyed.
            Please type <strong className="font-bold text-red-900">"DELETE"</strong> to confirm.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder='Type "DELETE"'
              className="flex-1 rounded-xl border border-red-300 bg-white px-3 py-2 text-xs text-slate-800 input-danger-focus"
              disabled={isPending}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isPending || confirmInput.trim() !== "DELETE"}
                className="flex-1 sm:flex-none rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold disabled:opacity-40 transition-all shrink-0 cursor-pointer"
              >
                {isPending ? "Erasing Data..." : "Erase All My Data"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmInput("");
                }}
                disabled={isPending}
                className="flex-1 sm:flex-none rounded-xl bg-slate-200 text-slate-700 px-4 py-2 text-xs font-semibold hover:bg-slate-300 transition-all shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
