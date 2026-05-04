"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-wrapper";
import { loanSchema, type LoanInput } from "@/lib/validations/loan.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { buildLoanPath } from "@/lib/loans/url";

export type LoanRecord = {
  id: string;
  userId: string;
  name: string;
  loanType: string;
  principal: number;
  outstandingBalance: number;
  interestRate: number;
  rateType: "FIXED" | "FLOATING";
  tenureMonths: number;
  emiAmount: number;
  startDate: Date;
  nextEmiDate: Date | null;
  lender: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.coerce.date(),
  type: z.enum(["EMI", "PREPAYMENT"]),
  notes: z.string().trim().optional(),
});

function addOneMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const targetMonth = (month + 1) % 12;
  const targetYear = month === 11 ? year + 1 : year;
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
  return new Date(targetYear, targetMonth, Math.min(day, lastDay));
}

export async function createLoan(data: LoanInput) {
  return await withServerAction("createLoan", async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id;
    if (!userId) {
      return { error: "You must be logged in to add a loan." };
    }

    const rl = await import("@/lib/with-rate-limit").then((m) => m.enforceRateLimit(userId, "create-loan"));
    if (!rl.allowed) return { error: "Too many requests. Please try again later." };

    const validated = loanSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const {
      name,
      loanType,
      principal,
      outstandingBalance,
      interestRate,
      rateType,
      tenureMonths,
      emiAmount,
      startDate,
      lender,
      notes,
    } = validated.data;

    await prisma.loan.create({
      data: {
        userId,
        name,
        loanType,
        principal,
        outstandingBalance,
        interestRate,
        rateType,
        tenureMonths,
        emiAmount,
        startDate: new Date(startDate),
        lender,
        notes,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/loans");

    return { success: true };
  });
}

export async function getLoans(): Promise<LoanRecord[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return [];
  }

  try {
    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return loans as LoanRecord[];
  } catch (error) {
    console.error("Failed to fetch loans:", error);
    return [];
  }
}

export async function getLoan(id: string): Promise<LoanRecord | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return null;
  }

  try {
    const loan = await prisma.loan.findFirst({
      where: { id, userId },
    });
    return loan as LoanRecord | null;
  } catch (error) {
    console.error("Failed to fetch loan:", error);
    return null;
  }
}

export async function updateLoan(id: string, data: LoanInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return { error: "You must be logged in to update a loan." };
  }

  const validated = loanSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const existingLoan = await prisma.loan.findFirst({
      where: { id, userId },
    });

    if (!existingLoan) {
      return { error: "Loan not found" };
    }

    const updateData = {
      ...validated.data,
      startDate: validated.data.startDate ? new Date(validated.data.startDate) : undefined,
    } as const;

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: updateData,
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/loans");
    revalidatePath(`/loans/${id}`);
    revalidatePath(buildLoanPath(updatedLoan.name, updatedLoan.id));

    return { success: true, loan: updatedLoan };
  } catch (error) {
    console.error("Failed to update loan:", error);
    return { error: "Failed to update loan" };
  }
}

export async function deleteLoan(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return { error: "You must be logged in to delete a loan." };
  }

  try {
    const existingLoan = await prisma.loan.findFirst({
      where: { id, userId },
    });

    if (!existingLoan) {
      return { error: "Loan not found" };
    }

    await prisma.loan.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/loans");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete loan:", error);
    return { error: "Failed to delete loan" };
  }
}

export async function recordPayment(loanId: string, data: z.input<typeof paymentSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return { error: "You must be logged in to record a payment." };
  }

  const validatedPayment = paymentSchema.safeParse(data);
  if (!validatedPayment.success) {
    return { error: validatedPayment.error.issues[0]?.message ?? "Invalid payment details." };
  }

  const parsedPayment = validatedPayment.data;

  try {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId, userId },
    });

    if (!loan) {
      return { error: "Loan not found." };
    }

    const newBalance = Math.max(0, loan.outstandingBalance - parsedPayment.amount);

    // Update loan balance and create payment record in a transaction
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          loanId: loanId,
          amount: parsedPayment.amount,
          paymentDate: parsedPayment.paymentDate,
          type: parsedPayment.type,
          notes: parsedPayment.notes || undefined,
        },
      }),
      prisma.loan.update({
        where: { id: loanId },
        data: {
          outstandingBalance: newBalance,
          // If it's an EMI payment, we might want to advance the nextEmiDate
          ...(parsedPayment.type === "EMI" && loan.nextEmiDate ? {
            nextEmiDate: addOneMonth(loan.nextEmiDate)
          } : {})
        },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/loans");
    revalidatePath(`/loans/${loanId}`);
    revalidatePath(buildLoanPath(loan.name, loan.id));
    revalidatePath("/calendar");

    return { success: true };
  } catch (error) {
    console.error("Failed to record payment:", error);
    return { error: "Failed to record payment." };
  }
}
