"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { withServerAction } from "@/lib/server-action-wrapper";

const DATABASE_UNAVAILABLE_TEXT = "DatabaseUnavailable";

function isDatabaseConnectivityError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("enotfound") ||
    message.includes("getaddrinfo") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("can't reach database server") ||
    message.includes("prismaclientinitializationerror")
  );
}

function normalizeSettingsError(error: unknown): Error {
  if (isDatabaseConnectivityError(error)) {
    return new Error(
      `${DATABASE_UNAVAILABLE_TEXT}: Unable to connect to the database. Check DATABASE_URL, SSL settings, and network/DNS access.`
    );
  }

  return error instanceof Error ? error : new Error("Unexpected settings error");
}

async function withSettingsDbGuard<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    throw normalizeSettingsError(error);
  }
}

export async function getUserSettings() {
  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId && !userEmail) {
    throw new Error("Unauthorized: no active session");
  }

  const user = await withSettingsDbGuard(() => prisma.user.findUnique({
    where: userId ? { id: userId } : { email: userEmail! },
    include: { financialProfile: true },
  }));

  if (!user) {
    throw new Error("Unauthorized: user not found");
  }

  return user;
}

const settingsSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  monthlyIncome: z.number().min(0).max(100000000).optional(),
  monthlyExpenses: z.number().min(0).max(100000000).optional(),
  creditScoreRange: z.string().max(20).optional(),
  employmentType: z.enum(["SALARIED", "SELF_EMPLOYED", "STUDENT", "BUSINESS_OWNER", "OTHER"]).optional(),
  hasEmergencyFund: z.boolean().optional(),
  emergencyFundMonths: z.number().min(0).max(120).optional(),
});

type ExistingFinancialProfile = {
  monthlyIncome: number;
  monthlyExpenses: number;
  creditScoreRange: string;
  employmentType: "SALARIED" | "SELF_EMPLOYED" | "STUDENT" | "BUSINESS_OWNER" | "OTHER";
  hasEmergencyFund: boolean;
  emergencyFundMonths: number;
} | null;

export async function updateUserSettings(data: z.infer<typeof settingsSchema>) {
  return await withServerAction("updateUserSettings", async () => {
    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      throw new Error("Unauthorized");
    }

    const rl = await import("@/lib/with-rate-limit").then((m) => m.enforceRateLimit(userId ?? userEmail!, "update-settings"));
    if (!rl.allowed) return { error: "Too many requests. Please try again later." };

    const validated = settingsSchema.safeParse(data);
    if (!validated.success) {
      throw new Error("Invalid request data: " + validated.error.issues[0].message);
    }
    const validData = validated.data;

    const user = (await withSettingsDbGuard(() => prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail! },
    }))) as { id: string } | null;

    if (!user) throw new Error("User not found");

    const existingProfile = (await withSettingsDbGuard(() => prisma.financialProfile.findUnique({
      where: { userId: user.id },
    }))) as ExistingFinancialProfile;

    // Update user name
    if (validData.name !== undefined) {
      await withSettingsDbGuard(() => prisma.user.update({
        where: { id: user.id },
        data: { name: validData.name },
      }));
    }

    const hasFinancialUpdates =
      validData.monthlyIncome !== undefined ||
      validData.monthlyExpenses !== undefined ||
      validData.creditScoreRange !== undefined ||
      validData.employmentType !== undefined ||
      validData.hasEmergencyFund !== undefined ||
      validData.emergencyFundMonths !== undefined;

    // Update financial profile whenever any financial field is submitted.
    if (hasFinancialUpdates || existingProfile) {
      await withSettingsDbGuard(() => prisma.financialProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          monthlyIncome: validData.monthlyIncome ?? existingProfile?.monthlyIncome ?? 0,
          monthlyExpenses: validData.monthlyExpenses ?? existingProfile?.monthlyExpenses ?? 0,
          creditScoreRange: validData.creditScoreRange ?? existingProfile?.creditScoreRange ?? "700-749",
          employmentType: validData.employmentType ?? existingProfile?.employmentType ?? "SALARIED",
          hasEmergencyFund: validData.hasEmergencyFund ?? existingProfile?.hasEmergencyFund ?? false,
          emergencyFundMonths: validData.emergencyFundMonths ?? existingProfile?.emergencyFundMonths ?? 0,
        },
        update: {
          monthlyIncome: validData.monthlyIncome ?? existingProfile?.monthlyIncome,
          monthlyExpenses: validData.monthlyExpenses ?? existingProfile?.monthlyExpenses,
          creditScoreRange: validData.creditScoreRange ?? existingProfile?.creditScoreRange,
          employmentType: validData.employmentType ?? existingProfile?.employmentType,
          hasEmergencyFund: validData.hasEmergencyFund ?? existingProfile?.hasEmergencyFund,
          emergencyFundMonths: validData.emergencyFundMonths ?? existingProfile?.emergencyFundMonths,
        },
      }));
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true };
  });
}

export async function updateOnboardingProgress(step: number) {
  return await withServerAction("updateOnboardingProgress", async () => {
    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      throw new Error("Unauthorized");
    }

    const rl = await import("@/lib/with-rate-limit").then((m) => m.enforceRateLimit(userId ?? userEmail!, "update-onboarding"));
    if (!rl.allowed) return { error: "Too many requests. Please try again later." };

    const currentUser = (await withSettingsDbGuard(() => prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail! },
      select: { id: true },
    }))) as { id: string } | null;

    if (!currentUser) {
      throw new Error("User not found");
    }

    const parsedStep = Number(step);
    const safeStep = Number.isFinite(parsedStep)
      ? Math.max(0, Math.min(4, Math.floor(parsedStep)))
      : 0;

    await withSettingsDbGuard(() => prisma.user.update({
      where: { id: currentUser.id },
      data: {
        onboardingStep: safeStep,
        onboardingCompleted: safeStep >= 4,
      },
    }));

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, onboardingStep: safeStep, onboardingCompleted: safeStep >= 4 };
  });
}
