"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { recordPayment } from "@/app/actions/loan";
import { Card } from "@/components/ui/Card";

type LogPaymentFormProps = {
  loanId: string;
  defaultAmount: number;
  loanName?: string;
};

export default function LogPaymentForm({ loanId, defaultAmount }: LogPaymentFormProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"EMI" | "PREPAYMENT">("EMI");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await recordPayment(loanId, {
      amount,
      paymentDate: new Date(paymentDate),
      type,
      notes: notes || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNotes("");
        setIsSubmitting(false);
      }, 3000);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-amortix-slate">Record Payment</h3>
        <p className="text-[11px] text-amortix-slate mt-1">Found an extra gap in your budget? Log it here.</p>
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
          <p className="text-sm font-medium text-amortix-navy">Payment Recorded!</p>
          <p className="text-xs text-amortix-slate mt-1">Loan balance has been updated.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType("EMI");
                setAmount(defaultAmount);
              }}
              className={`rounded-xl border p-3 text-center transition-all ${
                type === "EMI"
                  ? "border-amortix-emerald bg-emerald-50 text-amortix-emerald font-medium"
                  : "border-amortix-border-light text-amortix-slate hover:bg-slate-50"
              }`}
            >
              <p className="text-xs">Regular EMI</p>
            </button>
            <button
              type="button"
              onClick={() => setType("PREPAYMENT")}
              className={`rounded-xl border p-3 text-center transition-all ${
                type === "PREPAYMENT"
                  ? "border-amber-500 bg-amber-50 text-amber-600 font-medium"
                  : "border-amortix-border-light text-amortix-slate hover:bg-slate-50"
              }`}
            >
              <p className="text-xs">Prepayment</p>
            </button>
          </div>

          <div>
            <label htmlFor="payment-amount" className="block text-[11px] font-medium text-amortix-slate mb-1">Amount (₹)</label>
            <input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => {
                const nextValue = e.currentTarget.valueAsNumber;
                if (Number.isNaN(nextValue)) {
                  setAmount(0);
                  return;
                }
                setAmount(Math.max(0, nextValue));
              }}
              className="w-full rounded-xl border border-amortix-border-light bg-slate-50 px-4 py-2.5 text-sm text-amortix-navy focus:outline-none focus:ring-2 focus:ring-amortix-emerald/20"
              required
            />
          </div>

          <div>
            <label htmlFor="payment-date" className="block text-[11px] font-medium text-amortix-slate mb-1">Payment Date</label>
            <input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-xl border border-amortix-border-light bg-slate-50 px-4 py-2.5 text-sm text-amortix-navy focus:outline-none focus:ring-2 focus:ring-amortix-emerald/20"
              required
            />
          </div>

          <div>
            <label htmlFor="payment-notes" className="block text-[11px] font-medium text-amortix-slate mb-1">Notes (Optional)</label>
            <input
              id="payment-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid from bonus"
              className="w-full rounded-xl border border-amortix-border-light bg-slate-50 px-4 py-2.5 text-sm text-amortix-navy focus:outline-none focus:ring-2 focus:ring-amortix-emerald/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-amortix-navy text-white text-sm font-medium transition-all hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {type === "EMI" ? "Log EMI Payment" : "Log Prepayment"}
          </button>

          {error && <p className="text-[10px] text-red-500 text-center">{error}</p>}
        </form>
      )}
    </Card>
  );
}
