"use client";

import { ChangeEvent, useId } from "react";
import { formatCurrency } from "@/lib/calculations";

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
  currencyCode?: string;
};

export default function SliderField({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
  currencyCode = "INR",
}: SliderFieldProps) {
  const id = useId();
  const progress = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between text-sm">
        <label htmlFor={id} className="text-sm font-medium text-amortix-navy">{label}</label>
        <span className="text-sm font-medium text-amortix-navy">{displayValue}</span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-amortix-border-light"
        style={{
          accentColor: "var(--color-emerald)",
          backgroundImage: `linear-gradient(to right, var(--color-emerald) 0%, var(--color-emerald-dark) ${progress}%, var(--color-border) ${progress}%, var(--color-border) 100%)`,
        }}
      />

      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span>{min >= 1000 ? formatCurrency(min, currencyCode) : min}</span>
        <span>{max >= 1000 ? formatCurrency(max, currencyCode) : max}</span>
      </div>
    </div>
  );
}
