"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { inviteToWorkspace } from "@/app/actions/workspace";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

const roleOptions: { value: "ADMIN" | "MEMBER" | "VIEWER"; label: string }[] = [
  { value: "MEMBER", label: "MEMBER (Can log payments & view)" },
  { value: "ADMIN", label: "ADMIN (Can add/delete loans & invite)" },
  { value: "VIEWER", label: "VIEWER (View-only workspace access)" },
];

interface InviteFormProps {
  workspaceId: string;
}

export default function InviteForm({ workspaceId }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [isPending, startTransition] = useTransition();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      const res = await inviteToWorkspace(workspaceId, email, role);
      if (res.error) {
        toast.error(res.error);
      } else if (res.invite) {
        toast.success(`Invitation created for ${email}`);
        
        // Generate the join workspace link
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const link = `${baseUrl}/workspace/join?inviteId=${res.invite.id}`;
        setInviteLink(link);
        setEmail("");
      }
    });
  };

  const copyToClipboard = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invitation link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {inviteLink ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <LinkIcon className="h-4 w-4 text-emerald-600" />
            <span>Invitation Link Generated!</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 leading-relaxed">
            Share this link with your partner so they can join the workspace.
          </p>
          <div className="flex gap-1.5">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="w-full rounded-lg border border-emerald-250 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 transition-colors"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={() => setInviteLink(null)}
            className="text-[10px] text-slate-500 hover:text-slate-700 underline font-medium block pt-1"
          >
            Create Another Invitation
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="invite-email" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              placeholder="partner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-amortix-border-light bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amortix-emerald"
              required
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Privilege Role
            </label>
            <CustomSelect
              id="invite-role"
              value={role}
              options={roleOptions}
              onChange={(val) => setRole(val)}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-amortix-navy text-white text-xs font-semibold py-2.5 hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {isPending ? "Generating invite..." : "Invite Partner"}
          </button>
        </form>
      )}
    </div>
  );
}
