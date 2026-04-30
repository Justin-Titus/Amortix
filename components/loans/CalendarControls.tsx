"use client";

import { useState } from "react";

function padMonth(value: number) {
  return String(value).padStart(2, "0");
}

function parseInitialMonth(initialMonth: string): Date {
  const monthPattern = /^\d{4}-\d{2}$/;
  if (!monthPattern.test(initialMonth)) {
    return new Date();
  }

  const [yearString, monthString] = initialMonth.split("-");
  const year = Number(yearString);
  const month = Number(monthString);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return new Date();
  }

  const maybeDate = new Date(year, month - 1, 1);
  return Number.isNaN(maybeDate.getTime()) ? new Date() : maybeDate;
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${padMonth(date.getMonth() + 1)}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function addMonthsClamped(date: Date, offset: number) {
  const result = new Date(date);
  const targetMonth = result.getMonth() + offset;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  result.setFullYear(targetYear, normalizedMonth, Math.min(result.getDate(), lastDay));
  return result;
}

export default function CalendarControls({
  initialMonth,
  onChange,
}: {
  initialMonth: string;
  onChange?: (newMonth: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => parseInitialMonth(initialMonth));

  const updateCurrentMonth = (nextMonth: Date) => {
    setCurrentMonth(nextMonth);
    onChange?.(formatMonthKey(nextMonth));
  };

  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3 sm:px-5 sm:py-4">
      <button
        type="button"
        onClick={() => updateCurrentMonth(addMonthsClamped(currentMonth, -1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-bold text-slate-600 transition-colors hover:bg-slate-100 sm:h-9 sm:w-9"
      >
        <span className="sr-only">Previous month</span>
        ‹
      </button>
      <p className="text-[13px] font-medium text-[#0D1F3C] sm:text-[14px]">{formatMonthLabel(currentMonth)}</p>
      <button
        type="button"
        onClick={() => updateCurrentMonth(addMonthsClamped(currentMonth, 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-bold text-slate-600 transition-colors hover:bg-slate-100 sm:h-9 sm:w-9"
      >
        <span className="sr-only">Next month</span>
        ›
      </button>
    </div>
  );
}
