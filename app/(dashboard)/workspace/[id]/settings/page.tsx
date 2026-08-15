import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceMembers, getPendingInvites } from "@/app/actions/workspace";
import { getLoans } from "@/app/actions/loan";
import { ArrowLeft, Settings, Users, Shield, Briefcase, FileText } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import MemberList from "@/components/workspace/MemberList";
import WorkspaceRenameForm from "@/components/workspace/WorkspaceRenameForm";
import LoanAssignmentList from "@/components/workspace/LoanAssignmentList";
import DeleteWorkspaceButton from "@/components/workspace/DeleteWorkspaceButton";
import { slugifyWorkspaceName } from "@/lib/workspace/url";

export default async function WorkspaceSettingsPage({
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
    redirect(`/workspace/${slug}/settings`);
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

  const currentUserRole = workspace.members[0].role;
  const isOwner = currentUserRole === "OWNER";
  const isAdmin = currentUserRole === "ADMIN";
  const canManage = isOwner || isAdmin;

  // Fetch members, pending invites, and user's loans
  const membersRes = await getWorkspaceMembers(workspace.id);
  const invitesRes = canManage ? await getPendingInvites(workspace.id) : { invites: [] };
  const userLoans = await getLoans();

  const members = membersRes.members || [];
  const invites = invitesRes.invites || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/workspace/${slugifyWorkspaceName(workspace.name)}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace Dashboard
        </Link>
      </div>

      <PageHero
        badge={{ icon: Settings, label: "Workspace Settings" }}
        title="Settings"
        description="Rename workspace, manage shared/personal loans, and assign privileges to members."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left/Middle Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rename Workspace */}
          {canManage && (
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-semibold text-amortix-navy">Workspace Name</CardTitle>
                <CardDescription className="text-xs">
                  Change the name of the collaborative workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <WorkspaceRenameForm workspaceId={workspace.id} currentName={workspace.name} />
              </CardContent>
            </Card>
          )}

          {/* Manage Shared Loans */}
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-semibold text-amortix-navy">Shared Loans Management</CardTitle>
              <CardDescription className="text-xs">
                Select which of your loans are shared with this workspace, or make them personal.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LoanAssignmentList
                userLoans={userLoans}
                workspaceId={workspace.id}
                canManage={currentUserRole !== "VIEWER"}
              />
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isOwner && (
            <Card className="p-6 border-red-100 bg-red-50/10">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-semibold text-red-800">Danger Zone</CardTitle>
                <CardDescription className="text-xs">
                  Permanently delete this workspace and revoke all members' access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DeleteWorkspaceButton
                  workspaceId={workspace.id}
                  workspaceName={workspace.name}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Members */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-semibold text-amortix-navy">Members ({members.length})</CardTitle>
              <CardDescription className="text-xs">
                View or manage member privileges.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MemberList
                members={members}
                currentUserRole={currentUserRole}
                currentUserId={user.id}
                workspaceId={workspace.id}
              />
            </CardContent>
          </Card>

          {/* Pending Invites */}
          {canManage && invites.length > 0 && (
            <Card className="p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-semibold text-amortix-navy">Pending Invitations</CardTitle>
                <CardDescription className="text-xs">
                  Sent invitation links waiting for acceptance.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  {invites.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{inv.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Role: {inv.role}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider scale-90 border border-amber-100 shrink-0">
                        PENDING
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
