"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveRepaymentPlan(
  loanId: string,
  strategy: "AVALANCHE" | "SNOWBALL" | "HYBRID" | "CUSTOM",
  extraPayment: number,
  totalInterest: number,
  payoffDate: Date,
  monthlySaved: number,
  schedule: any
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: user.id }
    });

    if (!loan) {
      return { error: "Loan not found" };
    }

    const plan = await prisma.repaymentPlan.create({
      data: {
        loanId,
        strategy,
        extraPayment,
        totalInterest,
        payoffDate,
        monthlySaved,
        schedule,
      }
    });

    revalidatePath(`/loans/${loanId}`);
    return { success: true, plan };
  } catch (error: any) {
    console.error("Failed to save repayment plan:", error);
    return { error: error.message };
  }
}

export async function getRepaymentPlans(loanId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const plans = await prisma.repaymentPlan.findMany({
      where: { loanId, loan: { userId: user.id } },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, plans };
  } catch (error: any) {
    console.error("Failed to fetch repayment plans:", error);
    return { error: error.message };
  }
}
