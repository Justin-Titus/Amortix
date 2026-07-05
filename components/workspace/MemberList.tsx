"use client";

import { useTransition, useState } from "react";
import { UserMinus, ShieldAlert, Check } from "lucide-react";
import { removeFromWorkspace, updateWorkspaceMemberRole } from "@/app/actions/workspace";
import { toast } from "sonner";

interface MemberListProps {
  members: any[];
  currentUserRole?: string;
  currentUserId?: string;
  workspaceId?: string;
}

export default function MemberList({
  members,
  currentUserRole,
  currentUserId,
  workspaceId,
}: MemberListProps) {
  const [isPending, startTransition] = useTransition();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const handleRemove = (memberId: string, memberName: string) => {
    if (!workspaceId) return;

    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    startTransition(async () => {
      const res = await removeFromWorkspace(workspaceId, memberId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${memberName} has been removed.`);
        window.location.reload(); // Quick refresh for server state sync
      }
    });
  };

  const handleUpdateRole = (memberId: string, memberName: string) => {
    if (!workspaceId) return;

    startTransition(async () => {
      const res = await updateWorkspaceMemberRole(workspaceId, memberId, newRole as any);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${memberName}'s role updated to ${newRole}.`);
        setEditingUserId(null);
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-4">
      {members.map((m) => {
        const u = m.user;
        if (!u) return null;

        const isSelf = currentUserId === u.id;
        const canManage =
          currentUserRole === "OWNER" && !isSelf && m.role !== "OWNER";

        return (
          <div
            key={m.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 uppercase">
                {u.name ? u.name[0] : u.email[0]}
              </div>
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-800">
                  {u.name || "Invite Pending"} {isSelf ? "(You)" : ""}
                </span>
                <span className="block truncate text-[10px] text-slate-500">
                  {u.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {editingUserId === u.id ? (
                <div className="flex items-center gap-1">
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="rounded-lg border border-slate-350 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MEMBER">MEMBER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                  <button
                    onClick={() => handleUpdateRole(u.id, u.name || u.email)}
                    disabled={isPending}
                    className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setEditingUserId(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 px-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span
                    onClick={() => {
                      if (canManage) {
                        setNewRole(m.role);
                        setEditingUserId(u.id);
                      }
                    }}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      m.role === "OWNER"
                        ? "bg-purple-50 text-purple-700 border border-purple-100"
                        : m.role === "ADMIN"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : m.role === "MEMBER"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-slate-100 text-slate-600"
                    } ${canManage ? "cursor-pointer hover:opacity-85" : ""}`}
                  >
                    {m.role}
                  </span>

                  {canManage && (
                    <button
                      onClick={() => handleRemove(u.id, u.name || u.email)}
                      disabled={isPending}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
                      title="Remove Member"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
