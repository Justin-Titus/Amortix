"use client";

import { useState, useCallback, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { recordPayment } from "@/app/actions/loan";
import { Card } from "@/components/ui/Card";
import { ConfettiCelebration } from "@/components/ui/ConfettiCelebration";
import { getCurrencyConfig } from "@/lib/calculations";
import { checkMilestone, type Milestone } from "@/lib/milestones";
import { pressScale, errorShake, successFlash } from "@/lib/animations-extended";

type LogPaymentFormProps = {
  loanId: string;
  defaultAmount: number;
  loanName?: string;
  currencyCode?: string;
  /** Outstanding balance BEFORE this payment — needed for milestone detection */
  outstandingBalance?: number;
  /** Original principal — needed for milestone detection */
  principal?: number;
};

export default function LogPaymentForm({
  loanId,
  defaultAmount,
  currencyCode = "INR",
  outstandingBalance,
  principal,
}: LogPaymentFormProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"EMI" | "PREPAYMENT">("EMI");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [, startTransition] = useTransition();

  const currencySymbol = getCurrencyConfig(currencyCode).symbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid amount greater than 0.");
      setShakeKey((k) => k + 1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // ─── Optimistic UI update ──────────────────────────────────
    // Show success state immediately without waiting for the server
    setSuccess(true);

    // Detect milestone before the server confirms (we know the numbers locally)
    if (outstandingBalance !== undefined && principal !== undefined) {
      const newBalance = Math.max(0, outstandingBalance - amount);
      const hit = checkMilestone(outstandingBalance, newBalance, principal);
      if (hit) setMilestone(hit);
    }

    // Fire the real server action in background
    startTransition(async () => {
      const result = await recordPayment(loanId, {
        amount,
        paymentDate: new Date(paymentDate),
        type,
        notes: notes || undefined,
      });

      if (result.error) {
        // Revert optimistic state on failure
        setSuccess(false);
        setMilestone(null);
        setError(result.error);
        setShakeKey((k) => k + 1);
      }
      // On success, leave the success state; reset form after delay
      setTimeout(() => {
        setSuccess(false);
        setNotes("");
        setIsSubmitting(false);
      }, 3000);
    });
  };

  const dismissMilestone = useCallback(() => setMilestone(null), []);

  return (
    <>
      {/* Confetti + milestone toast fires above everything */}
      <ConfettiCelebration milestone={milestone} onDismiss={dismissMilestone} />

      <motion.div
        key={shakeKey}
        variants={errorShake}
        animate={error ? "animate" : undefined}
      >
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-amortix-slate">
              Record Payment
            </h3>
            <p className="text-[11px] text-amortix-slate mt-1">
              Found an extra gap in your budget? Log it here.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                className="flex flex-col items-center justify-center py-8 text-center"
                variants={successFlash}
                initial="initial"
                animate="animate"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.05 }}
                >
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
                </motion.div>
                <motion.p
                  className="text-sm font-medium text-amortix-navy"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  Payment Recorded!
                </motion.p>
                <motion.p
                  className="text-xs text-amortix-slate mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  Loan balance has been updated.
                </motion.p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Payment type toggle */}
                <div className="grid grid-cols-2 gap-3">
                  {(["EMI", "PREPAYMENT"] as const).map((t) => (
                    <motion.button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        if (t === "EMI") setAmount(defaultAmount);
                      }}
                      {...pressScale}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        type === t
                          ? t === "EMI"
                            ? "border-amortix-emerald bg-emerald-50 text-amortix-emerald font-medium"
                            : "border-amber-500 bg-amber-50 text-amber-600 font-medium"
                          : "border-amortix-border-light text-amortix-slate hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-xs">{t === "EMI" ? "Regular EMI" : "Prepayment"}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Amount */}
                <div>
                  <label
                    htmlFor="payment-amount"
                    className="block text-[11px] font-medium text-amortix-slate mb-1"
                  >
                    Amount ({currencySymbol})
                  </label>
                  <input
                    id="payment-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      const v = e.currentTarget.valueAsNumber;
                      setAmount(Number.isNaN(v) ? 0 : Math.max(0, v));
                    }}
                    className="w-full rounded-xl border border-amortix-border-light bg-slate-50 px-4 py-2.5 text-sm text-amortix-navy focus:outline-none focus:ring-2 focus:ring-amortix-emerald/20 transition-shadow"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="payment-date"
                    className="block text-[11px] font-medium text-amortix-slate mb-1"
                  >
                    Payment Date
                  </label>
                  <input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-xl border border-amortix-border-light bg-slate-50 px-4 py-2.5 text-sm text-amortix-navy focus:outline-none focus:ring-2 focus:ring-amortix-emerald/20 transition-shadow"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="payment-notes"
                    className="block text-[11px] font-medium text-amortix-slate mb-1"
                  >
                    Notes (Optional)
                  </label>
                  <input
                    id="payment-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Paid from bonus"
                    className="w-full rounded-xl border border-amortix-border-light bg-slate-50 px-4 py-2.5 text-sm text-amortix-navy focus:outline-none focus:ring-2 focus:ring-amortix-emerald/20 transition-shadow"
                  />
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  {...pressScale}
                  className="w-full py-3 rounded-xl bg-amortix-navy text-white text-sm font-medium transition-all hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {type === "EMI" ? "Log EMI Payment" : "Log Prepayment"}
                </motion.button>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-red-500 text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </>
  );
}
