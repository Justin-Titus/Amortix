"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronDown, Plus, Shield, Users, Briefcase } from "lucide-react";
import { getWorkspaces, createWorkspace } from "@/app/actions/workspace";
import { useTransition } from "react";
import { slugifyWorkspaceName } from "@/lib/workspace/url";

export default function WorkspaceSwitcher() {
  const router = useRouter();
  const params = useParams();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const activeWorkspaceId = params.id as string | undefined;

  useEffect(() => {
    async function load() {
      const res = await getWorkspaces();
      if (res.success && res.workspaces) {
        setWorkspaces(res.workspaces);
      }
    }
    load();
  }, [activeWorkspaceId]);

  const activeWorkspace = workspaces.find(
    (w) => w.id === activeWorkspaceId || slugifyWorkspaceName(w.name) === activeWorkspaceId
  );

  const handleSelect = (workspaceId: string | null, workspaceName?: string) => {
    setIsOpen(false);
    if (workspaceId) {
      const slug = workspaceName ? slugifyWorkspaceName(workspaceName) : workspaceId;
      router.push(`/workspace/${slug}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await createWorkspace(newWorkspaceName);
      if (res.error) {
        setError(res.error);
      } else if (res.workspace) {
        setNewWorkspaceName("");
        setShowCreateModal(false);
        // Refresh list
        const listRes = await getWorkspaces();
        if (listRes.success && listRes.workspaces) {
          setWorkspaces(listRes.workspaces);
        }
        const slug = slugifyWorkspaceName(res.workspace.name);
        router.push(`/workspace/${slug}`);
      }
    });
  };

  return (
    <div className="relative w-full px-2 my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition-all hover:bg-white/10"
      >
        <span className="flex items-center gap-2 truncate">
          <Briefcase className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="truncate">
            {activeWorkspace ? activeWorkspace.name : "Personal Space"}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#162a45] p-1.5 shadow-xl">
            <button
              onClick={() => handleSelect(null)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all ${
                !activeWorkspaceId
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>Personal Space</span>
            </button>

            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => handleSelect(w.id, w.name)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all ${
                  activeWorkspaceId === w.id || activeWorkspaceId === slugifyWorkspaceName(w.name)
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="truncate">{w.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider scale-90">
                  {w.role}
                </span>
              </button>
            ))}

            <div className="my-1 border-t border-white/5" />

            <button
              onClick={() => {
                setIsOpen(false);
                setShowCreateModal(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Workspace
            </button>
          </div>
        </>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#162a45] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-slate-100 mb-2">Create Workspace</h3>
            <p className="text-xs text-slate-400 mb-4">
              Invite household members or partners to tackle debt collaboratively.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Household Debt"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                  required
                />
              </div>

              {error && <p className="text-[10px] text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
