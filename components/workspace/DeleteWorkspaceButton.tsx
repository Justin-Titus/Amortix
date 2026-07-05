"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteWorkspace } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteWorkspaceButtonProps {
  workspaceId: string;
  workspaceName: string;
}

export default function DeleteWorkspaceButton({
  workspaceId,
  workspaceName,
}: DeleteWorkspaceButtonProps) {
  const [confirmName, setConfirmName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirmName.trim() !== workspaceName) {
      toast.error("Workspace name does not match.");
      return;
    }

    startTransition(async () => {
      const res = await deleteWorkspace(workspaceId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Workspace deleted successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2.5 text-xs font-semibold hover:bg-red-700 transition-all shrink-0 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Delete Workspace
        </button>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-800">
            <AlertTriangle className="h-4 w-4 text-red-650" />
            <span>Confirm Deletion</span>
          </div>
          <p className="text-[11px] text-red-700/80 leading-relaxed">
            This action is permanent and cannot be undone. All member records will be deleted, and shared loans will revert to personal loans. 
            Please type <strong className="text-red-900 font-bold">"{workspaceName}"</strong> to confirm.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Type workspace name"
              className="flex-1 rounded-xl border border-red-350 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              disabled={isPending}
            />
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isPending || confirmName.trim() !== workspaceName}
                className="flex-1 sm:flex-none rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold disabled:opacity-40 transition-all shrink-0 cursor-pointer"
              >
                {isPending ? "Deleting..." : "Delete permanently"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmName("");
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
