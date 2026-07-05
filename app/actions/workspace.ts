"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/push";

export async function createWorkspace(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  if (!name || name.trim().length === 0) {
    return { error: "Workspace name is required" };
  }

  try {
    // Check owned workspaces limit (max 3)
    const ownedCount = await prisma.workspace.count({
      where: { createdBy: user.id },
    });
    if (ownedCount >= 3) {
      return { error: "You can only create a maximum of 3 workspaces." };
    }

    // Check total joined workspaces limit (max 5)
    const totalCount = await prisma.workspaceMember.count({
      where: { userId: user.id },
    });
    if (totalCount >= 5) {
      return { error: "You can only belong to a maximum of 5 workspaces in total." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: name.trim(),
          createdBy: user.id,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      return workspace;
    });

    revalidatePath("/dashboard");
    revalidatePath("/loans");
    return { success: true, workspace: result };
  } catch (error: any) {
    console.error("Failed to create workspace:", error);
    return { error: error.message || "Failed to create workspace" };
  }
}

export async function getWorkspaces() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized", workspaces: [] };
  }

  try {
    const members = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: true,
      },
    });

    const workspaces = members.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));

    return { success: true, workspaces };
  } catch (error: any) {
    console.error("Failed to get workspaces:", error);
    return { error: error.message || "Failed to get workspaces", workspaces: [] };
  }
}

export async function getWorkspaceLoans(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized", loans: [] };
  }

  try {
    // Verify membership
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!member) {
      return { error: "Access denied", loans: [] };
    }

    const loans = await prisma.loan.findMany({
      where: { workspaceId },
      include: {
        payments: {
          orderBy: { paymentDate: "desc" },
          take: 10,
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, loans };
  } catch (error: any) {
    console.error("Failed to get workspace loans:", error);
    return { error: error.message || "Failed to get workspace loans", loans: [] };
  }
}

export async function inviteToWorkspace(
  workspaceId: string,
  email: string,
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" = "MEMBER"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  if (!email || !email.includes("@")) {
    return { error: "Valid email is required" };
  }

  try {
    // Check sender's authorization (must be OWNER or ADMIN)
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return { error: "Only workspace owners and admins can invite members." };
    }

    // Check if target is already a member
    const targetUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (targetUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: targetUser.id,
          },
        },
      });

      if (existingMember) {
        return { error: "User is already a member of this workspace" };
      }
    }

    // Delete existing pending invites to this email to avoid duplicates
    await prisma.workspaceInvite.deleteMany({
      where: {
        workspaceId,
        email: email.trim().toLowerCase(),
        status: "PENDING",
      },
    });

    // Create invite
    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email: email.trim().toLowerCase(),
        role,
        invitedBy: user.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration
      },
    });

    // If targetUser exists, send an in-app and push notification
    if (targetUser && member?.workspace) {
      try {
        const inviter = await prisma.user.findUnique({
          where: { id: user.id },
          select: { name: true, email: true },
        });
        const inviterName = inviter?.name || inviter?.email || "Someone";
        
        await sendPushNotification(
          targetUser.id,
          "Workspace Invitation",
          `${inviterName} has invited you to join their workspace "${member.workspace.name}".`,
          "workspace_invite",
          `/workspace/join?inviteId=${invite.id}`
        );
      } catch (err) {
        console.error("Failed to send invite push notification:", err);
      }
    }

    revalidatePath(`/workspace/${workspaceId}/settings`);
    return { success: true, invite };
  } catch (error: any) {
    console.error("Failed to create invite:", error);
    return { error: error.message || "Failed to create invite" };
  }
}

export async function acceptInvite(inviteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    return { error: "Unauthorized. Please log in first." };
  }

  try {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return { error: "Invitation not found." };
    }

    if (invite.status !== "PENDING") {
      return { error: `This invitation has already been ${invite.status.toLowerCase()}.` };
    }

    if (invite.expiresAt < new Date()) {
      await prisma.workspaceInvite.update({
        where: { id: inviteId },
        data: { status: "EXPIRED" },
      });
      return { error: "This invitation has expired." };
    }

    // Verify email matches (strict check based on user instruction or email matching)
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return { error: `This invitation was sent to ${invite.email}, but you are logged in as ${user.email}.` };
    }

    // Check total joined workspaces limit (max 5)
    const totalCount = await prisma.workspaceMember.count({
      where: { userId: user.id },
    });
    if (totalCount >= 5) {
      return { error: "You can only belong to a maximum of 5 workspaces in total." };
    }

    // Accept invite in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.workspaceInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED" },
      });

      // Ensure user exists in prisma user table first (sync user)
      const dbUser = await tx.user.findUnique({
        where: { id: user.id },
      });

      if (!dbUser) {
        await tx.user.create({
          data: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split("@")[0],
          },
        });
      }

      await tx.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: user.id,
          role: invite.role,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/loans");
    return { success: true, workspaceId: invite.workspaceId };
  } catch (error: any) {
    console.error("Failed to accept invite:", error);
    return { error: error.message || "Failed to accept invite" };
  }
}

export async function declineInvite(inviteId: string) {
  try {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return { error: "Invitation not found" };
    }

    await prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: { status: "DECLINED" },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to decline invite:", error);
    return { error: error.message || "Failed to decline invite" };
  }
}

export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized", members: [] };
  }

  try {
    // Verify user is a member
    const memberCheck = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!memberCheck) {
      return { error: "Access denied", members: [] };
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return { success: true, members };
  } catch (error: any) {
    console.error("Failed to get workspace members:", error);
    return { error: error.message || "Failed to get workspace members", members: [] };
  }
}

export async function getPendingInvites(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized", invites: [] };
  }

  try {
    const memberCheck = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!memberCheck || (memberCheck.role !== "OWNER" && memberCheck.role !== "ADMIN")) {
      return { error: "Access denied", invites: [] };
    }

    const invites = await prisma.workspaceInvite.findMany({
      where: {
        workspaceId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, invites };
  } catch (error: any) {
    console.error("Failed to get pending invites:", error);
    return { error: error.message || "Failed to get pending invites", invites: [] };
  }
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  userIdToUpdate: string,
  newRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const callerMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!callerMember || callerMember.role !== "OWNER") {
      return { error: "Only the workspace owner can manage member roles." };
    }

    if (user.id === userIdToUpdate) {
      return { error: "You cannot change your own role." };
    }

    await prisma.$transaction(async (tx) => {
      // If setting someone else to OWNER, downgrade current owner to ADMIN
      if (newRole === "OWNER") {
        await tx.workspaceMember.update({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: user.id,
            },
          },
          data: { role: "ADMIN" },
        });
      }

      await tx.workspaceMember.update({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: userIdToUpdate,
          },
        },
        data: { role: newRole },
      });
    });

    revalidatePath(`/workspace/${workspaceId}/settings`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update role:", error);
    return { error: error.message || "Failed to update role" };
  }
}

export async function removeFromWorkspace(workspaceId: string, userIdToRemove: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const callerMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!callerMember) {
      return { error: "Access denied" };
    }

    const targetMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userIdToRemove,
        },
      },
    });

    if (!targetMember) {
      return { error: "Member not found" };
    }

    // Rules:
    // 1. User can always remove themselves (leave workspace) unless they are OWNER and there are other members (owner must transfer first)
    // 2. OWNER can remove anyone
    // 3. ADMIN can remove MEMBERS and VIEWERS
    const isSelfRemove = user.id === userIdToRemove;
    const isOwner = callerMember.role === "OWNER";
    const isAdmin = callerMember.role === "ADMIN";

    if (targetMember.role === "OWNER" && !isSelfRemove) {
      return { error: "Workspace owner cannot be removed" };
    }

    if (isSelfRemove && targetMember.role === "OWNER") {
      const otherMembers = await prisma.workspaceMember.count({
        where: { workspaceId, userId: { not: user.id } },
      });
      if (otherMembers > 0) {
        return { error: "Please transfer ownership to another member before leaving the workspace." };
      }
    }

    if (!isSelfRemove && !isOwner) {
      if (!isAdmin || targetMember.role === "ADMIN" || targetMember.role === "OWNER") {
        return { error: "Permission denied to remove this member" };
      }
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userIdToRemove,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/loans");
    revalidatePath(`/workspace/${workspaceId}/settings`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to remove member:", error);
    return { error: error.message || "Failed to remove member" };
  }
}

export async function addLoanToWorkspace(loanId: string, workspaceId: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: user.id },
    });

    if (!loan) {
      return { error: "Loan not found" };
    }

    if (workspaceId) {
      // Check caller's workspace access
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      });

      if (!member || member.role === "VIEWER") {
        return { error: "You don't have write access to this workspace." };
      }
    }

    await prisma.loan.update({
      where: { id: loanId },
      data: { workspaceId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/loans");
    revalidatePath(`/loans/${loanId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to assign loan to workspace:", error);
    return { error: error.message || "Failed to assign loan to workspace" };
  }
}

export async function renameWorkspace(workspaceId: string, newName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  if (!newName || newName.trim().length === 0) {
    return { error: "Workspace name is required" };
  }

  try {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return { error: "Only workspace owners and admins can rename the workspace." };
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: newName.trim() },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    revalidatePath(`/workspace/${workspaceId}/settings`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to rename workspace:", error);
    return { error: error.message || "Failed to rename workspace" };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Check sender's authorization (must be OWNER)
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!member || member.role !== "OWNER") {
      return { error: "Only the workspace owner can delete the workspace." };
    }

    // Delete the workspace. Cascadings (members, invites) and SetNull (loans) are handled by prisma/db setup
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete workspace:", error);
    return { error: error.message || "Failed to delete workspace" };
  }
}
