import { getLoan } from "@/app/actions/loan";
import { notFound } from "next/navigation";
import EditLoanForm from "@/components/loans/EditLoanForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const loan = await getLoan(id);

  if (!loan) {
    notFound();
  }

  return (
    <div className="animate-fade-up max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2">
        <Link href={`/loans/${id}`} className="flex items-center gap-2 text-sm text-amortix-slate hover:text-amortix-navy transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Loan Details
        </Link>
      </div>
      <EditLoanForm loanId={loan.id} initialData={loan} />
    </div>
  );
}
