"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Loader2 } from "lucide-react";
import { updateUserSettings } from "@/app/actions/settings";
import { CustomSelect } from "@/components/ui/CustomSelect";

type EmploymentType = "SALARIED" | "SELF_EMPLOYED" | "BUSINESS_OWNER" | "STUDENT" | "OTHER";

type FinancialProfileFormValues = {
  monthlyIncome: string;
  monthlyExpenses: string;
  creditScoreRange: string;
  employmentType: EmploymentType;
  hasEmergencyFund: boolean;
  emergencyFundMonths: string;
};

const employmentOptions: { value: EmploymentType; label: string }[] = [
  { value: "SALARIED", label: "Salaried" },
  { value: "SELF_EMPLOYED", label: "Self employed" },
  { value: "BUSINESS_OWNER", label: "Business owner" },
  { value: "STUDENT", label: "Student" },
  { value: "OTHER", label: "Other" },
];

const creditOptions = [
  { value: "300-579", label: "300 - 579 (Poor)" },
  { value: "580-669", label: "580 - 669 (Fair)" },
  { value: "670-739", label: "670 - 739 (Good)" },
  { value: "740-799", label: "740 - 799 (Very good)" },
  { value: "800-850", label: "800 - 850 (Exceptional)" },
];

export function FinancialProfileForm({ defaultValues }: { defaultValues: FinancialProfileFormValues }) {
  const { register, handleSubmit, watch, setValue } = useForm<FinancialProfileFormValues>({ defaultValues });
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasEmergencyFund = watch("hasEmergencyFund");

  const onSubmit = async (data: FinancialProfileFormValues) => {
    setIsSaving(true);
    setErrorMsg(null);
    setIsSuccess(false);

    try {
      await updateUserSettings({
        monthlyIncome: data.monthlyIncome ? parseFloat(data.monthlyIncome) : undefined,
        monthlyExpenses: data.monthlyExpenses ? parseFloat(data.monthlyExpenses) : undefined,
        creditScoreRange: data.creditScoreRange,
        employmentType: data.employmentType,
        hasEmergencyFund: data.hasEmergencyFund,
        emergencyFundMonths:
          data.hasEmergencyFund && data.emergencyFundMonths
            ? parseInt(data.emergencyFundMonths, 10)
            : undefined,
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Unable to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errorMsg ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="monthlyIncome" className="text-sm font-medium text-[#0D1F3C]">Monthly income (₹)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
            <input
              id="monthlyIncome"
              type="number"
              {...register("monthlyIncome")}
              className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 pl-10 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="monthlyExpenses" className="text-sm font-medium text-[#0D1F3C]">Monthly expenses (₹)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
            <input
              id="monthlyExpenses"
              type="number"
              {...register("monthlyExpenses")}
              min="0"
              className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 pl-10 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="employmentTypeSelect" className="text-sm font-medium text-[#0D1F3C]">Employment type</label>
          <CustomSelect
            id="employmentTypeSelect"
            value={watch("employmentType")}
            options={employmentOptions}
            onChange={(value) => {
              setValue("employmentType", value, { shouldValidate: true, shouldDirty: true });
            }}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="creditScoreRangeSelect" className="text-sm font-medium text-[#0D1F3C]">Credit score range</label>
          <CustomSelect
            id="creditScoreRangeSelect"
            value={watch("creditScoreRange")}
            options={creditOptions}
            placeholder="Select credit range"
            onChange={(value) => {
              setValue("creditScoreRange", value, { shouldValidate: true, shouldDirty: true });
            }}
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-slate-50 px-4 py-4">
        <input
          id="hasEmergencyFund"
          type="checkbox"
          {...register("hasEmergencyFund")}
          className="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-600"
        />
        <label htmlFor="hasEmergencyFund" className="cursor-pointer">
          <p className="text-sm font-medium text-[#0D1F3C]">I have an emergency fund</p>
          <p className="text-[12px] text-slate-500">Used to model your resilience and risk score.</p>
        </label>
      </div>

      {hasEmergencyFund && (
        <div className="space-y-2">
          <label htmlFor="emergencyFundMonths" className="text-sm font-medium text-[#0D1F3C]">Emergency fund coverage (months)</label>
          <input
            id="emergencyFundMonths"
            type="number"
            min="1"
            {...register("emergencyFundMonths")}
            className="w-full rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-sm text-[#0D1F3C] transition-colors duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
            placeholder="E.g., 3 or 6"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving
          </>
        ) : (
          "Save profile"
        )}
      </button>

      {isSuccess && (
        <p className="text-sm text-emerald-600">Profile saved successfully.</p>
      )}
    </form>
  );
}
