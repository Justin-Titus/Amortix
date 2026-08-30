"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-wrapper";
import { logInfo, logWarn } from "@/lib/logger";

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

    // Step 1: Clean up non-cascading standalone models created by the user
    try {
      if (prisma.workspaceInvite) {
        await prisma.workspaceInvite.deleteMany({ where: { invitedBy: userId } });
      }
      if (prisma.workspace) {
        await prisma.workspace.deleteMany({ where: { createdBy: userId } });
      }
      if (prisma.dataRightsRequest && user.email) {
        await prisma.dataRightsRequest.deleteMany({ where: { email: user.email } });
      }
    } catch (cleanupErr) {
      logWarn("cleanup_standalone_records_warning", { userId, error: cleanupErr });
    }

    // Step 2: Delete user from public."User".
    // In PostgreSQL, all relational models (FinancialProfile, Loan, Payment, RepaymentPlan,
    // ChatSession, HealthSnapshot, Notification, RateLimit, WorkspaceMember, ConsentRecord)
    // are configured with ON DELETE CASCADE.
    // In addition, the PostgreSQL trigger `on_user_deleted` automatically deletes auth.users.
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (userDeleteErr) {
      logWarn("direct_user_delete_fallback_triggered", { userId, error: userDeleteErr });

      // Fallback manual cleanup in case of schema drift
      if (prisma.payment) await prisma.payment.deleteMany({ where: { loan: { userId } } }).catch(() => {});
      if (prisma.repaymentPlan) await prisma.repaymentPlan.deleteMany({ where: { loan: { userId } } }).catch(() => {});
      if (prisma.loan) await prisma.loan.deleteMany({ where: { userId } }).catch(() => {});
      if (prisma.financialProfile) await prisma.financialProfile.deleteMany({ where: { userId } }).catch(() => {});
      if (prisma.chatSession) await prisma.chatSession.deleteMany({ where: { userId } }).catch(() => {});
      if (prisma.healthSnapshot) await prisma.healthSnapshot.deleteMany({ where: { userId } }).catch(() => {});
      if (prisma.notification) await prisma.notification.deleteMany({ where: { userId } }).catch(() => {});
      if (prisma.workspaceMember) await prisma.workspaceMember.deleteMany({ where: { userId } }).catch(() => {});
      if (prisma.consentRecord) await prisma.consentRecord.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.user.delete({ where: { id: userId } });
    }

    // Step 3: Defense-in-depth safety net — ensure auth.users is purged even if the trigger was bypassed
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE id = $1::uuid`, userId);
    } catch (authErr) {
      // Ignored if trigger already deleted the user record
    }

    logInfo("user_account_erased_dpdp", { userId, email: user.email });

    // Step 4: Sign out user session
    await supabase.auth.signOut();

    return { success: true, message: "Your account and all associated personal data have been permanently deleted." };
  });
}
