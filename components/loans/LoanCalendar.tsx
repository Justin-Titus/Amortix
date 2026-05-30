"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Info } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import CalendarControls from "@/components/loans/CalendarControls";
import { formatCurrency, getCurrencyConfig, buildCalendarData, formatDateKey, RawLoan } from "@/lib/calculations";

type LoanCalendarProps = {
  loans: RawLoan[];
  initialMonth?: string;
  currencyCode?: string;
};

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

function parseYearMonth(initialMonth: string) {
  const monthPattern = /^\d{4}-\d{2}$/;
  if (!monthPattern.test(initialMonth)) return new Date();

  const [yearString, monthString] = initialMonth.split("-");
  const year = Number(yearString);
  const month = Number(monthString);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return new Date();

  const maybeDate = new Date(year, month - 1, 1);
  return Number.isNaN(maybeDate.getTime()) ? new Date() : maybeDate;
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function LoanCalendar({ loans, initialMonth, currencyCode = "INR" }: LoanCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    parseYearMonth(initialMonth ?? new Date().toISOString().slice(0, 7))
  );

  const today = useMemo(() => new Date(), []);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { days, dueIn30, totalDueIn30 } = useMemo(
    () => buildCalendarData(loans, currentMonth, today),
    [loans, currentMonth, today]
  );

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedDay = selectedDate ? days[selectedDate] ?? null : null;

  return (
    <div className="animate-fade-up space-y-6 sm:space-y-8">
      <PageHero
        badge={{ icon: CalendarDays, label: "Cashflow timeline" }}
        title="EMI Calendar"
        description="Plan upcoming dues across all loans and avoid payment pileups."
        stats={[
          { label: "Due in next 30 days", value: formatCurrency(totalDueIn30, currencyCode), muted: totalDueIn30 === 0 },
          { label: "Scheduled payments", value: `${dueIn30.length}`, muted: dueIn30.length === 0 },
        ]}
      />

      {!loans.length ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl">
          <EmptyState
            icon={<Info className="w-5 h-5 text-slate-400" />}
            title="No loans yet"
            description="Add loans to see your EMI due dates appear on the calendar. The monthly grid is ready to show payment days as soon as you add a loan."
            action={{ label: "Add a loan", href: "/loans/add" }}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <CalendarControls
              initialMonth={formatMonthKey(currentMonth)}
              onChange={(newMonth) => {
                setCurrentMonth(parseYearMonth(newMonth));
                setSelectedDate(null);
              }}
            />

          <div className="grid grid-cols-7 border-b border-slate-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center py-2 text-[9px] font-medium text-slate-400 sm:py-3 sm:text-[10px]">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`pad-${i}`} className="h-16 border-b border-r border-slate-50 sm:h-20" />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const date = new Date(year, month, day);
              const dateKey = formatDateKey(date);
              const dayEntry = days[dateKey];
              const isToday =
                today.getFullYear() === date.getFullYear() &&
                today.getMonth() === date.getMonth() &&
                today.getDate() === date.getDate();

              let cellClass = "";
              if (dayEntry) {
                const hasOverdue = dayEntry.loans.some((l) => l.status === "overdue");
                const allPaid = dayEntry.loans.length > 0 && dayEntry.loans.every((l) => l.status === "paid");
                if (hasOverdue) cellClass = "bg-red-50/40 hover:bg-red-50";
                else if (allPaid) cellClass = "bg-emerald-50/40 hover:bg-emerald-50";
                else cellClass = "bg-yellow-50/40 hover:bg-yellow-50";
              }

              return (
                <div
                  key={day}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDate(dateKey)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setSelectedDate(dateKey);
                    }
                    if (event.key === " " || event.key === "Spacebar") {
                      event.preventDefault();
                      setSelectedDate(dateKey);
                    }
                  }}
                  className={`h-16 border-b border-r border-slate-50 p-1.5 transition-colors sm:h-20 sm:p-2 ${cellClass}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10px] font-medium sm:text-[12px] ${isToday ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0D1F3C] text-white' : 'text-slate-600'}`}>
                      {day}
                    </span>

                    <div className="flex -space-x-0.5 sm:-space-x-1">
                      {(dayEntry?.loans ?? []).slice(0, 3).map((l, i) => (
                        <div
                          key={l.loanId + i}
                          title={`${l.loanName} - ${l.status}`}
                          className={`h-1.5 w-1.5 rounded-full border border-white sm:h-2 sm:w-2 ${
                            l.status === 'paid' ? 'bg-emerald-500' : l.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {dayEntry ? (
                    <div className="mt-1 flex flex-col gap-0.5 sm:mt-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="truncate text-[9px] text-slate-600 sm:text-[11px]">{formatCurrency(dayEntry.totalDue, currencyCode, { compact: true })}</div>
                      <div className="text-[9px] text-slate-400 sm:text-[11px]">{dayEntry.loans.length} EMI{dayEntry.loans.length>1?'s':''}</div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {(() => {
              const totalCells = firstDayOfWeek + daysInMonth;
              const trailing = (7 - (totalCells % 7)) % 7;
              return Array.from({ length: trailing }).map((_, i) => (
                <div key={`pad-end-${i}`} className="h-16 border-b border-slate-50 sm:h-20" />
              ));
            })()}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5">
            <p className="text-sm font-medium text-[#0D1F3C]">Upcoming due dates</p>
            <p className="mt-2 text-sm text-slate-500">The calendar above reflects the selected month and updates automatically when loans are added.</p>
          </div>

          {selectedDay ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
              <p className="text-sm font-medium text-[#0D1F3C]">{new Date(selectedDay.date).toLocaleDateString(getCurrencyConfig(currencyCode).locale, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="mt-2 text-sm text-slate-500">{`${formatCurrency(selectedDay.totalPaid, currencyCode)} paid / ${formatCurrency(selectedDay.totalDue, currencyCode)} due`}</p>

              <div className="mt-3 space-y-3">
                {selectedDay.loans.map((l) => (
                  <div key={l.loanId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <div>
                      <p className="text-sm text-[#0D1F3C]">{l.loanName}</p>
                      <p className="text-[11px] text-slate-500">{formatCurrency(l.emiAmount, currencyCode)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${l.status === 'paid' ? 'text-emerald-700 line-through opacity-80' : 'text-[#0D1F3C]'}`}>
                        Paid {formatCurrency(l.paidAmount, currencyCode)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Due {formatCurrency(Math.max(0, l.emiAmount - l.paidAmount), currencyCode, { compact: true })} • {l.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            dueIn30.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-500">No EMIs due within the next 30 days.</div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
                <p className="text-sm font-medium text-[#0D1F3C]">Next payments</p>
                <div className="mt-3 space-y-3">
                  {dueIn30.map((entry) => (
                    <div key={`${entry.loanId}-${entry.dueDate.toISOString()}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                      <div>
                        <p className="text-sm text-[#0D1F3C]">{entry.loanName}</p>
                        <p className="text-[11px] text-slate-500">{new Intl.DateTimeFormat(getCurrencyConfig(currencyCode).locale, { day: 'numeric', month: 'short' }).format(entry.dueDate)}</p>
                      </div>
                      <p className="text-sm font-medium text-[#0D1F3C]">{formatCurrency(entry.amount, currencyCode)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
