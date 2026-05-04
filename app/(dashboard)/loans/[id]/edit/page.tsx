import { getLoan } from "@/app/actions/loan";
import { notFound } from "next/navigation";
import EditLoanForm from "@/components/loans/EditLoanForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LoanInput } from "@/lib/validations/loan.schema";
import { buildLoanPath, slugifyLoanName } from "@/lib/loans/url";
import { getLoans } from "@/app/actions/loan";

export default async function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const rawParam = decodeURIComponent(resolvedParams.id);
  let loan = await getLoan(rawParam);
  if (!loan) {
    const loans = await getLoans();
    loan = loans.find((item) => slugifyLoanName(item.name) === rawParam) ?? null;
  }

  if (!loan) {
    notFound();
  }

  // Ensure the loan object matches the shape expected by EditLoanForm
  const isValidLoanType = (v: unknown): v is LoanInput["loanType"] =>
    typeof v === "string" && ["HOME", "EDUCATION", "PERSONAL", "VEHICLE", "BUSINESS", "GOLD", "OTHER"].includes(v);

  const initialData = {
    name: loan.name,
    loanType: isValidLoanType(loan.loanType) ? loan.loanType : ("OTHER" as LoanInput["loanType"]),
    principal: loan.principal,
    outstandingBalance: loan.outstandingBalance,
    interestRate: loan.interestRate,
    rateType: loan.rateType,
    tenureMonths: loan.tenureMonths,
    emiAmount: loan.emiAmount,
    startDate: loan.startDate,
    lender: loan.lender,
    notes: loan.notes,
  };

  return (
    <div className="animate-fade-up max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2">
        <Link href={buildLoanPath(loan.name, loan.id)} className="flex items-center gap-2 text-sm text-amortix-slate hover:text-amortix-navy transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Loan Details
        </Link>
      </div>
      <EditLoanForm loanId={loan.id} initialData={initialData} />
    </div>
  );
}
