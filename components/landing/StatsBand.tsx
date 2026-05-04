import { BarChart3, Clock, TrendingDown } from "lucide-react";

const stats = [
  {
    icon: TrendingDown,
    value: 2.3,
    prefix: "₹",
    suffix: "L",
    label: "Interest saved",
    description: "In a sample 4-loan portfolio with disciplined monthly extra payment.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Clock,
    value: 17,
    suffix: " mo",
    label: "Time reduced",
    description: "Median payoff acceleration when extra cash is prioritized by strategy.",
    color: "bg-slate-100 text-amortix-navy",
  },
  {
    icon: BarChart3,
    value: 24,
    suffix: "%",
    label: "Interest share drop",
    description: "Potential reduction in total interest vs minimum-only repayment.",
    color: "bg-amber-50 text-amber-600",
  },
];

export default function StatsBand() {
  return (
    <section className="bg-slate-50 border-y border-slate-200 py-16 animate-fade-up">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <p className="section-label">Sample portfolio results</p>
          <h2 className="section-heading mt-3">What disciplined repayment looks like</h2>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3 list-none" role="list">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="rounded-4xl border border-white/70 bg-white p-8 shadow-[0_20px_50px_rgba(15,27,45,0.06)]" role="listitem">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${item.color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="mt-6">
                  <span className="num-value text-4xl font-semibold tracking-tight text-amortix-navy">
                    {item.prefix ?? ""}
                    {item.value}
                    {item.suffix}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-amortix-navy">{item.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-amortix-slate">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-amortix-text-muted">
          Sample portfolio assumptions: 4 mixed-rate loans, stable monthly payments, no penalties, no rate shocks.
        </p>
      </div>
    </section>
  );
}
