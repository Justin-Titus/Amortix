import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { type InterestLeak } from "@/lib/analysis/interest-leak";
import { formatCurrency } from "@/lib/calculations/emi";
import { Card } from "@/components/ui/Card";

interface LeakDetectorProps {
  leaks: InterestLeak[];
}

export function LeakDetector({ leaks }: LeakDetectorProps) {
  return (
    <section id="interest-leaks" className="space-y-3 scroll-mt-24">
      <h2 className="text-lg font-heading font-medium text-amortix-navy">Interest leak priority</h2>
      {leaks.length === 0 ? (
        <Card className="p-5 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-amortix-slate">No meaningful leak patterns detected right now.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaks.slice(0, 4).map((leak) => (
            <Card key={`${leak.loanId}-${leak.type}`} className="p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {leak.severity === "high" ? (
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <p className="text-sm font-medium text-amortix-navy">{leak.loanName}</p>
                </div>
                <p className="mt-1 text-sm text-amortix-slate">{leak.fixDescription}</p>
              </div>
              <p className="num text-lg font-medium text-amortix-navy">{formatCurrency(leak.annualLeakAmount)}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
