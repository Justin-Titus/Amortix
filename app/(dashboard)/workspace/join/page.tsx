import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Users, CheckCircle, XCircle } from "lucide-react";
import AcceptDeclineButtons from "@/components/workspace/AcceptDeclineButtons";

interface JoinWorkspacePageProps {
  searchParams: Promise<{ inviteId?: string }>;
}

export default async function JoinWorkspacePage({ searchParams }: JoinWorkspacePageProps) {
  const resolvedSearchParams = await searchParams;
  const inviteId = resolvedSearchParams.inviteId;

  if (!inviteId) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login but save the current url so they return here after signing in
    redirect(`/login?redirectTo=/workspace/join?inviteId=${inviteId}`);
  }

  // Fetch invite details
  const invite = await prisma.workspaceInvite.findUnique({
    where: { id: inviteId },
    include: {
      workspace: true,
    },
  });

  if (!invite) {
    return (
      <div className="mx-auto max-w-md mt-16 p-8 rounded-2xl border border-red-100 bg-red-50 text-center space-y-4">
        <XCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-red-800">Invalid Invitation</h2>
        <p className="text-xs text-red-750">
          This invitation does not exist or has been deleted. Ask your partner to send a new link.
        </p>
      </div>
    );
  }

  // Check if email matches logged-in user email
  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    return (
      <div className="mx-auto max-w-md mt-16 p-8 rounded-2xl border border-amber-100 bg-amber-50/50 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-amber-800">Email Mismatch</h2>
        <p className="text-xs text-amber-750">
          This invitation was sent to <strong className="text-amber-900">{invite.email}</strong>, but you are logged in as <strong className="text-amber-900">{user.email}</strong>.
        </p>
        <p className="text-[11px] text-slate-500">
          Please log out and log in with the correct account to accept this invitation.
        </p>
      </div>
    );
  }

  if (invite.status === "ACCEPTED") {
    redirect(`/workspace/${invite.workspaceId}`);
  }

  if (invite.status === "EXPIRED" || invite.expiresAt < new Date()) {
    return (
      <div className="mx-auto max-w-md mt-16 p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-4">
        <XCircle className="h-12 w-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-700">Invitation Expired</h2>
        <p className="text-xs text-slate-600">
          This invitation expired on {new Date(invite.expiresAt).toLocaleDateString()}. Ask your partner to send a new invite link.
        </p>
      </div>
    );
  }

  // Fetch inviter's details to show who invited them
  const inviter = await prisma.user.findUnique({
    where: { id: invite.invitedBy },
    select: { name: true, email: true },
  });

  const inviterName = inviter?.name || inviter?.email || "someone";

  return (
    <div className="mx-auto max-w-md mt-16 card p-6 md:p-8 space-y-6 text-center shadow-xl border border-slate-100">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Users className="h-6 w-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-heading font-semibold text-amortix-navy">Join Workspace</h1>
        <p className="text-xs text-amortix-slate leading-relaxed">
          <strong className="text-slate-800">{inviterName}</strong> has invited you to join the collaborative workspace <strong className="text-slate-800">"{invite.workspace.name}"</strong> as a <strong className="text-emerald-600 uppercase text-[10px] tracking-wider font-bold">{invite.role}</strong>.
        </p>
      </div>

      <p className="text-[11px] text-amortix-slate leading-relaxed bg-slate-50 p-3 rounded-xl">
        By joining this workspace, you will share access to view, track, and collaboratively pay down outstanding balances and EMIs.
      </p>

      <AcceptDeclineButtons inviteId={inviteId} />
    </div>
  );
}

// Simple placeholder fallback for error boundary
function ShieldAlert({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
    </svg>
  );
}
