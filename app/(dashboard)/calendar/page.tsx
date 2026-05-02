import LoanCalendar from "@/components/loans/LoanCalendar";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

import { redirect } from "next/navigation";


export const metadata = {
  title: "EMI Calendar ",
  description: "Track upcoming EMI due dates and monthly cashflow obligations.",
};

export default async function CalendarPage() {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const loans = await prisma.loan.findMany({
    where: { userId: user.id },
    include: {
      payments: true,
    },
  });


  if (loans.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-white">
        <EmptyState
          icon={<CalendarDays className="h-5 w-5 text-slate-400" />}
          title="No loan schedule yet"
          description="Add at least one loan to see upcoming EMI due dates and monthly payment timelines."
          action={{ label: "Add your first loan", href: "/loans/add" }}
        />
      </div>
    );
  }

  const serializableLoans = loans.map((loan: {
    id: string;
    name: string;
    emiAmount: number;
    nextEmiDate: Date | null;
    startDate: Date;
    payments: Array<{
      amount: number;
      paymentDate: Date;
      type: string;
    }>;
  }) => ({
    id: loan.id,
    name: loan.name,
    emiAmount: loan.emiAmount,
    nextEmiDate: loan.nextEmiDate ? loan.nextEmiDate.toISOString().slice(0,10) : null,
    startDate: loan.startDate.toISOString().slice(0,10),
    payments: loan.payments.map((p: { amount: number; paymentDate: Date; type: string }) => ({
      amount: p.amount,
      date: p.paymentDate.toISOString().slice(0,10),
      type: p.type
    }))
  }));

  return <LoanCalendar loans={serializableLoans} initialMonth={new Date().toISOString().slice(0, 7)} />;
}
