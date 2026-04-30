import { type DefaultRiskResult } from "@/lib/ml/default-risk";
import { riskTone } from "@/lib/utils/insights";
import { Card } from "@/components/ui/Card";

export interface RiskRow {
  loanId: string;
  loanName: string;
  risk: DefaultRiskResult;
}

interface RiskWatchlistProps {
  rows: RiskRow[];
}

export function RiskWatchlist({ rows }: RiskWatchlistProps) {
  if (rows.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-heading font-medium text-amortix-navy">Top risk watchlist</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {rows.map((row) => (
          <Card key={row.loanId} className="p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-amortix-navy">{row.loanName}</p>
              <span className={riskTone(row.risk.riskLevel)}>{row.risk.riskLevel}</span>
            </div>
            <p className="mt-3 text-3xl font-medium text-amortix-navy">{row.risk.riskScore}</p>
            <p className="text-xs text-amortix-slate">Risk score</p>
            <p className="mt-3 text-sm text-amortix-slate">{row.risk.recommendation}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
