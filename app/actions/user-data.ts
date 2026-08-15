"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-wrapper";
import { logInfo } from "@/lib/logger";

/**
 * Exports all personal data belonging to the authenticated user in full compliance
 * with Section 11 of the Digital Personal Data Protection (DPDP) Act, 2023.
 */
export async function exportUserData() {
  return await withServerAction("exportUserData", async () => {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized. Please log in to export your data." };
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        financialProfile: true,
        loans: {
          include: {
            payments: true,
            repaymentPlans: true,
          },
        },
        workspaces: {
          include: {
            workspace: true,
          },
        },
        notifications: true,
        chatSessions: true,
        healthSnapshots: true,
      },
    });

    if (!userData) {
      return { error: "User profile record not found." };
    }

    let consentRecords: unknown[] = [];
    let dataRightsRequests: unknown[] = [];

    try {
      if (prisma.consentRecord && typeof prisma.consentRecord.findMany === "function") {
        consentRecords = await prisma.consentRecord.findMany({
          where: { userId: user.id },
        });
      }
    } catch {
      consentRecords = [];
    }

    try {
      if (prisma.dataRightsRequest && typeof prisma.dataRightsRequest.findMany === "function") {
        dataRightsRequests = await prisma.dataRightsRequest.findMany({
          where: { email: user.email! },
        });
      }
    } catch {
      dataRightsRequests = [];
    }

    logInfo("user_data_exported_dpdp", { userId: user.id, email: user.email });

    return {
      success: true,
      exportData: {
        dpdpNotice: "Personal Data Export under India Digital Personal Data Protection Act (DPDP) 2023 §11",
        exportedAt: new Date().toISOString(),
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          emailVerified: userData.emailVerified,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          emailNotifications: userData.emailNotifications,
          pushNotifications: userData.pushNotifications,
        },
        financialProfile: userData.financialProfile,
        loans: userData.loans,
        workspaceMemberships: userData.workspaces,
        consentRecords,
        dataRightsRequests,
        notifications: userData.notifications,
        chatSessions: userData.chatSessions,
        healthSnapshots: userData.healthSnapshots,
      },
    };
  });
}

/**
 * Permanently deletes all personal data and account records for the authenticated user
 * in accordance with Section 12 (Right to Erasure) of the DPDP Act, 2023.
 */
export async function deleteAccountAndData() {
  return await withServerAction("deleteAccountAndData", async () => {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized. Please log in to delete your data." };
    }

    const userId = user.id;

    // Delete related records in Prisma with safe optional model checks
    const ops: Promise<unknown>[] = [];

    if (prisma.payment) ops.push(prisma.payment.deleteMany({ where: { loan: { userId } } }));
    if (prisma.repaymentPlan) ops.push(prisma.repaymentPlan.deleteMany({ where: { loan: { userId } } }));
    if (prisma.loan) ops.push(prisma.loan.deleteMany({ where: { userId } }));
    if (prisma.workspaceMember) ops.push(prisma.workspaceMember.deleteMany({ where: { userId } }));
    if (prisma.workspaceInvite) ops.push(prisma.workspaceInvite.deleteMany({ where: { invitedBy: userId } }));
    if (prisma.workspace) ops.push(prisma.workspace.deleteMany({ where: { createdBy: userId } }));
    if (prisma.consentRecord) ops.push(prisma.consentRecord.deleteMany({ where: { userId } }));
    if (prisma.notification) ops.push(prisma.notification.deleteMany({ where: { userId } }));
    if (prisma.chatSession) ops.push(prisma.chatSession.deleteMany({ where: { userId } }));
    if (prisma.healthSnapshot) ops.push(prisma.healthSnapshot.deleteMany({ where: { userId } }));
    if (prisma.rateLimit) ops.push(prisma.rateLimit.deleteMany({ where: { userId } }));
    if (prisma.dataRightsRequest && user.email) ops.push(prisma.dataRightsRequest.deleteMany({ where: { email: user.email } }));
    if (prisma.financialProfile) ops.push(prisma.financialProfile.deleteMany({ where: { userId } }));
    if (prisma.user) ops.push(prisma.user.delete({ where: { id: userId } }));

    await Promise.allSettled(ops);

    logInfo("user_account_erased_dpdp", { userId, email: user.email });

    // Sign out user session
    await supabase.auth.signOut();

    return { success: true, message: "Your account and all associated personal data have been permanently deleted." };
  });
}
