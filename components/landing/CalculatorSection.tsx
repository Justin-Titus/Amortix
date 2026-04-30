"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Accordion from "@/components/ui/Accordion";
import SliderField from "@/components/ui/SliderField";
import { calculateEMI, formatCurrency, totalInterest } from "@/lib/calculations/emi";
import { generateAmortizationSchedule } from "@/lib/calculations/amortization";
import { fadeUp, fadeUpStagger } from "@/lib/animations";

const presets = [
  { label: "Home", principal: 3500000, rate: 8.4, tenure: 240 },
  { label: "Personal", principal: 900000, rate: 14.2, tenure: 60 },
  { label: "Education", principal: 1600000, rate: 10.4, tenure: 120 },
];

export default function CalculatorSection() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(60);

  const emi = useMemo(() => calculateEMI(principal, rate, tenure), [principal, rate, tenure]);
  const interest = useMemo(() => totalInterest(emi, tenure, principal), [emi, tenure, principal]);
  const totalAmount = emi * tenure;
  const principalShare = (principal / totalAmount) * 100;
  const interestShare = (interest / totalAmount) * 100;
  const benchmarkRate = Math.max(0.5, rate - 1);
  const benchmarkEmi = useMemo(() => calculateEMI(principal, benchmarkRate, tenure), [principal, benchmarkRate, tenure]);

  const baseSchedule = useMemo(() => generateAmortizationSchedule(principal, rate, tenure), [principal, rate, tenure]);
  const acceleratedSchedule = useMemo(() => generateAmortizationSchedule(principal, rate, tenure, 5000), [principal, rate, tenure]);
  const baseInterest = useMemo(() => baseSchedule.reduce((sum, month) => sum + month.interestComponent, 0), [baseSchedule]);
  const acceleratedInterest = useMemo(() => acceleratedSchedule.reduce((sum, month) => sum + month.interestComponent, 0), [acceleratedSchedule]);
  const monthsSaved = Math.max(0, baseSchedule.length - acceleratedSchedule.length);
  const interestSaved = Math.max(0, baseInterest - acceleratedInterest);
  const optimizedOutflow = emi + 5000;
  const principalShareWidth = `${principalShare.toFixed(2)}%`;
  const interestShareWidth = `${interestShare.toFixed(2)}%`;

  const activePreset = presets.find(
    (item) => item.principal === principal && item.rate === rate && item.tenure === tenure,
  );

  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="calculator" aria-labelledby="calculator-heading" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={shouldReduceMotion ? false : "hidden"} whileInView={shouldReduceMotion ? undefined : "visible"} viewport={{ once: true, amount: 0.2 }} variants={fadeUpStagger}>
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="section-label">Interactive calculator</p>
            <h2 id="calculator-heading" className="section-heading mt-3">
              See the numbers before you commit.
            </h2>
            <p className="body-text mx-auto mt-4 max-w-2xl">
              Change amount, rate, and tenure to understand monthly EMI, total interest, and total cost in seconds.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 overflow-hidden rounded-4xl border border-slate-200 bg-slate-50 shadow-[0_28px_80px_rgba(15,27,45,0.08)]">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="lg:border-r border-slate-200/70 p-6 sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-amortix-navy">Scenario presets</p>
                  <p className="text-sm text-amortix-slate">Tap to load</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {presets.map((preset) => {
                    const isActive = preset.label === activePreset?.label;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setPrincipal(preset.principal);
                          setRate(preset.rate);
                          setTenure(preset.tenure);
                        }}
                        className={`rounded-2xl border px-3.5 py-2 text-sm font-medium transition ${
                          isActive
                            ? "border-amortix-emerald bg-amortix-emerald text-white"
                            : "border-slate-200 bg-white text-amortix-navy hover:border-amortix-emerald/80 hover:bg-emerald-50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 space-y-6">
                  <SliderField label="Loan amount" value={principal} min={100000} max={10000000} step={50000} displayValue={formatCurrency(principal)} onChange={setPrincipal} />
                  <SliderField label="Interest rate" value={rate} min={1} max={30} step={0.1} displayValue={`${rate.toFixed(1)}%`} onChange={setRate} />
                  <SliderField label="Tenure" value={tenure} min={6} max={360} step={6} displayValue={`${tenure} months`} onChange={setTenure} />
                </div>

                <Accordion title="How this is calculated">
                  <div className="grid gap-4 text-sm text-amortix-slate md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amortix-slate">Formula</p>
                      <p className="mt-3 leading-7 text-amortix-navy">EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ – 1)</p>
                      <p className="mt-3 text-xs text-amortix-slate">
                        Standard reducing-balance EMI with monthly compounding and no penalty assumptions.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amortix-slate">Optimized scenario</p>
                      <p className="mt-3 leading-7 text-amortix-navy">
                        Optimized assumes a fixed extra payment of ₹5,000 every month until the portfolio is closed.
                      </p>
                      <p className="mt-3 text-xs text-amortix-slate">
                        Real lender schedules can vary due to fees, rate resets, and repayment timing rules.
                      </p>
                    </div>
                  </div>
                </Accordion>
              </div>

              <div className="rounded-4xl bg-amortix-navy p-6 text-white sm:p-8">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/70">Projected EMI</p>
                  <p className="mt-4 text-4xl font-semibold tracking-tight">{formatCurrency(Math.round(emi))}</p>
                </div>

                <div className="mt-7 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>Principal</span>
                    <span className="font-medium">{formatCurrency(principal)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm text-white/80">
                    <span>Total interest</span>
                    <span className="font-medium text-amber-100">{formatCurrency(Math.round(interest))}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm font-semibold text-white">
                    <span>Total amount</span>
                    <span>{formatCurrency(Math.round(totalAmount))}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-3 py-3">
                  <div className="flex h-3.5 overflow-hidden rounded-full bg-white/10">
                    <div className="bg-emerald-400" style={{ width: principalShareWidth }} />
                    <div className="bg-amber-400" style={{ width: interestShareWidth }} />
                  </div>
                  <div className="mt-2.5 flex justify-between px-0.5 text-xs text-white/70">
                    <span>Principal {principalShare.toFixed(0)}%</span>
                    <span>Interest {interestShare.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
                  <div className="flex items-center justify-between">
                    <span>Minimum plan</span>
                    <span className="font-medium">{baseSchedule.length} mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Optimized (+₹5,000)</span>
                    <span className="font-medium text-emerald-100">{acceleratedSchedule.length} mo</span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-3xl border border-white/10 bg-amortix-navy-deep p-3 text-xs text-white/70">
                    <span>Monthly outflow on optimized plan</span>
                    <span className="font-medium text-white">{formatCurrency(Math.round(optimizedOutflow))}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
