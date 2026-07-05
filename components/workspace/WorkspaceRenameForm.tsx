"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { renameWorkspace } from "@/app/actions/workspace";

interface WorkspaceRenameFormProps {
  workspaceId: string;
  currentName: string;
}

export default function WorkspaceRenameForm({
  workspaceId,
  currentName,
}: WorkspaceRenameFormProps) {
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const res = await renameWorkspace(workspaceId, name);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Workspace name updated successfully!");
        window.location.reload();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <div className="flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workspace Name"
          className="w-full rounded-xl border border-amortix-border-light bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amortix-emerald"
          required
          disabled={isPending}
        />
      </div>
      <button
        type="submit"
        disabled={isPending || name.trim() === currentName}
        className="rounded-xl bg-amortix-navy text-white px-4 py-2.5 text-xs font-semibold hover:bg-opacity-90 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
