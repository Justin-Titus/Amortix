"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loanSchema, type LoanInput } from "@/lib/validations/loan.schema";
import { createLoan } from "@/app/actions/loan";
import { calculateEMI, getCurrencyConfig } from "@/lib/calculations";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

const loanFormSchema = loanSchema
  .omit({ startDate: true, nextEmiDate: true })
  .extend({
    startDate: z.string().nonempty("Start date is required"),
    nextEmiDate: z.string().optional().nullable(),
  });

type LoanFormValues = z.infer<typeof loanFormSchema>;

export default function AddLoanForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema) as any,
    defaultValues: {
      loanType: "PERSONAL",
      rateType: "FIXED",
      startDate: new Date().toISOString().split("T")[0],
      currency: "INR",
    },
  });

  const principal = watch("principal");
  const interestRate = watch("interestRate");
  const tenureMonths = watch("tenureMonths");
  const currency = watch("currency") || "INR";
  const currencySymbol = getCurrencyConfig(currency).symbol;

  useEffect(() => {
    if (principal > 0 && interestRate > 0 && tenureMonths > 0) {
      const calculatedEmi = calculateEMI(principal, interestRate, tenureMonths);
      setValue("emiAmount", Math.round(calculatedEmi));
    }
  }, [principal, interestRate, tenureMonths, setValue]);

  const parseLocalDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const onSubmit: SubmitHandler<LoanFormValues> = async (data) => {
    setIsSubmitting(true);
    setError(null);

    const loanInput: LoanInput = {
      ...data,
      startDate: parseLocalDate(data.startDate),
      nextEmiDate: data.nextEmiDate ? parseLocalDate(data.nextEmiDate) : undefined,
    };

    const result = await createLoan(loanInput);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      reset();
      router.refresh();
      if (onSuccess) onSuccess();
      router.push("/loans");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-[var(--radius-button)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="glass-panel p-6">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-amortix-slate">Loan setup</p>
          <h2 className="mt-2 text-xl font-heading font-medium text-amortix-navy">Add a new loan</h2>
          <p className="mt-1 text-sm text-amortix-slate">Capture the essentials once so strategy models and AI guidance can use accurate numbers.</p>
        </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Loan Name
          </label>
          <input
            {...register("name")}
            placeholder="e.g. HDFC Home Loan"
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          {errors.name && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Loan Type
          </label>
          <CustomSelect
            value={watch("loanType")}
            options={[
              { value: "HOME", label: "Home Loan" },
              { value: "EDUCATION", label: "Education Loan" },
              { value: "PERSONAL", label: "Personal Loan" },
              { value: "VEHICLE", label: "Vehicle Loan" },
              { value: "BUSINESS", label: "Business Loan" },
              { value: "GOLD", label: "Gold Loan" },
              { value: "OTHER", label: "Other" },
            ]}
            onChange={(value) => setValue("loanType", value, { shouldValidate: true, shouldDirty: true })}
          />
          {errors.loanType && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.loanType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Currency
          </label>
          <CustomSelect
            value={watch("currency") || "INR"}
            options={[
              { value: "INR", label: "Indian Rupee (₹)" },
              { value: "USD", label: "US Dollar ($)" },
              { value: "EUR", label: "Euro (€)" },
              { value: "GBP", label: "British Pound (£)" },
              { value: "AED", label: "UAE Dirham (د.إ)" },
              { value: "SGD", label: "Singapore Dollar (S$)" },
              { value: "CAD", label: "Canadian Dollar (C$)" },
              { value: "AUD", label: "Australian Dollar (A$)" },
            ]}
            onChange={(value) => setValue("currency", value, { shouldValidate: true, shouldDirty: true })}
          />
          {errors.currency && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.currency.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Original Principal ({currencySymbol})
          </label>
          <input
            type="number"
            {...register("principal", { valueAsNumber: true })}
            placeholder="10,00,000"
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] font-currency transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          {errors.principal && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.principal.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Current Outstanding Balance ({currencySymbol})
          </label>
          <input
            type="number"
            {...register("outstandingBalance", { valueAsNumber: true })}
            placeholder="9,50,000"
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] font-currency transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          {errors.outstandingBalance && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.outstandingBalance.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            {...register("interestRate", { valueAsNumber: true })}
            placeholder="8.5"
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          {errors.interestRate && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.interestRate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Rate Type
          </label>
          <div className="grid min-h-11 grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-[16px] border border-white/70 bg-white/75 px-4 py-3 text-sm shadow-sm">
              <input type="radio" value="FIXED" {...register("rateType")} className="accent-[var(--color-emerald)]" />
              <span className="text-sm">Fixed</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-[16px] border border-white/70 bg-white/75 px-4 py-3 text-sm shadow-sm">
              <input type="radio" value="FLOATING" {...register("rateType")} className="accent-[var(--color-emerald)]" />
              <span className="text-sm">Floating</span>
            </label>
          </div>
          {errors.rateType && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.rateType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Total Tenure (Months)
          </label>
          <input
            type="number"
            {...register("tenureMonths", { valueAsNumber: true })}
            placeholder="120"
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          {errors.tenureMonths && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.tenureMonths.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Monthly EMI ({currencySymbol})
          </label>
          <input
            type="number"
            {...register("emiAmount", { valueAsNumber: true })}
            placeholder="12,500"
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] font-currency transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          {errors.emiAmount && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.emiAmount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            {...register("startDate")}
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          {errors.startDate && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            Lender Name (Optional)
          </label>
          <input
            {...register("lender")}
            placeholder="SBI, ICICI, etc."
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          {errors.lender && (
            <p className="text-[var(--color-danger)] text-xs mt-1">{errors.lender.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
          Notes (Optional)
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Any additional details..."
          className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out resize-none hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20 min-h-28"
        />
        {errors.notes && (
          <p className="text-[var(--color-danger)] text-xs mt-1">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => reset()}
          className="btn-secondary"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-8 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Loan"
          )}
        </button>
      </div>
      </div>
    </form>
  );
}
