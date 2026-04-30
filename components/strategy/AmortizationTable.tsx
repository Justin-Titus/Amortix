import type { MonthlyAllocation } from "@/lib/calculations/strategies";
import { formatCurrency } from "@/lib/calculations/emi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AmortizationTableProps {
  schedule: MonthlyAllocation[];
}

const ZERO_EPSILON = 1e-6;

export default function AmortizationTable({ schedule }: AmortizationTableProps) {
  const handleExportCSV = () => {
    // Generate CSV data from schedule
    const headers = ["Month", "Total Remaining", ...schedule[0]?.allocations.flatMap(a => [
      `${a.loanName} Payment`,
      `${a.loanName} Principal`,
      `${a.loanName} Interest`,
      `${a.loanName} Balance`,
    ]) || []];

    const rows = schedule.map(month => {
      const rowData = [
        month.month.toString(),
        month.totalDebtRemaining.toString(),
      ];

      // Assuming same order of loans across months, which is true because we iterate over activeLoans
      month.allocations.forEach(a => {
        rowData.push(a.payment.toString());
        rowData.push(a.principal.toString());
        rowData.push(a.interest.toString());
        rowData.push(a.remainingBalance.toString());
      });

      return rowData.join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amortization_schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Amortization Schedule", 14, 15);
    
    const headers = ["Month", "Total Remaining", ...schedule[0]?.allocations.map(a => a.loanName) || []];
    
    const rows = schedule.map(month => {
      const rowData = [
        month.month.toString(),
        formatCurrency(month.totalDebtRemaining),
      ];

      month.allocations.forEach(a => {
        rowData.push(`Pay: ${formatCurrency(a.payment)}\nPrin: ${formatCurrency(a.principal)}\nInt: ${formatCurrency(a.interest)}\nBal: ${formatCurrency(a.remainingBalance)}`);
      });

      return rowData;
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 31, 60] },
    });

    doc.save("amortization_schedule.pdf");
  };

  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="card mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-heading font-medium text-[var(--color-navy)]">
            Amortization Schedule
          </h2>
          <p className="text-xs text-[var(--color-slate)] mt-1">Detailed month-by-month breakdown</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-secondary px-4 py-2 text-xs"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-primary px-4 py-2 text-xs"
          >
            Export PDF
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)]">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 z-20 bg-white">
            <tr className="bg-[var(--color-frost)] text-[var(--color-slate)] text-[10px] tracking-wider font-semibold border-b border-[var(--color-border)]">
              <th rowSpan={2} className="px-4 py-3 border-r border-[var(--color-border)]">Month</th>
              <th rowSpan={2} className="px-4 py-3 border-r border-[var(--color-border)] min-w-[120px]">Total Debt</th>
              {schedule[0]?.allocations.map((a) => (
                <th key={a.loanId} colSpan={4} className="px-4 py-3 border-r border-[var(--color-border)] min-w-[250px]">
                  <div className="font-semibold text-[var(--color-navy)]">{a.loanName}</div>
                </th>
              ))}
            </tr>
            <tr className="bg-[var(--color-frost)] text-[var(--color-slate)] text-[10px] tracking-wider font-semibold border-b border-[var(--color-border)]">
              {schedule[0]?.allocations.flatMap((a) => [
                <th key={`${a.loanId}-pay`} className="px-4 py-3 border-r border-[var(--color-border)] min-w-[100px]">Pay</th>,
                <th key={`${a.loanId}-prin`} className="px-4 py-3 border-r border-[var(--color-border)] min-w-[100px]">Prin</th>,
                <th key={`${a.loanId}-int`} className="px-4 py-3 border-r border-[var(--color-border)] min-w-[100px]">Int</th>,
                <th key={`${a.loanId}-bal`} className="px-4 py-3 border-r border-[var(--color-border)] min-w-[100px]">Bal</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {schedule.map((row) => (
              <tr key={row.month} className={`border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-frost)] transition-colors ${Math.abs(row.totalDebtRemaining) < ZERO_EPSILON ? "bg-emerald-50/50 border-l-4 border-l-emerald-500" : ""}`}>
                <td className="px-4 py-3 border-r border-[var(--color-border)] font-medium text-[var(--color-navy)]">
                  {row.month}
                </td>
                <td className="px-4 py-3 border-r border-[var(--color-border)] font-currency font-medium text-[var(--color-navy)]">
                  {formatCurrency(row.totalDebtRemaining)}
                </td>
                {row.allocations.flatMap((a) => [
                  <td key={`${row.month}-${a.loanId}-pay`} className="px-4 py-3 border-r border-[var(--color-border)] font-currency text-[var(--color-navy)]">
                    {formatCurrency(a.payment)}
                  </td>,
                  <td key={`${row.month}-${a.loanId}-prin`} className="px-4 py-3 border-r border-[var(--color-border)] font-currency text-[var(--color-emerald)]">
                    {formatCurrency(a.principal)}
                  </td>,
                  <td key={`${row.month}-${a.loanId}-int`} className="px-4 py-3 border-r border-[var(--color-border)] font-currency text-[var(--color-amber)]">
                    {formatCurrency(a.interest)}
                  </td>,
                  <td key={`${row.month}-${a.loanId}-bal`} className="px-4 py-3 border-r border-[var(--color-border)] font-currency text-[var(--color-slate)]">
                    {formatCurrency(a.remainingBalance)}
                  </td>,
                ])}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
