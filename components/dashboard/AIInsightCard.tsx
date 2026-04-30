import { Card } from "@/components/ui/Card";

type AIInsightCardProps = {
  insight: string;
};

export default function AIInsightCard({ insight }: AIInsightCardProps) {
  const parts = insight.split(/(₹[\d,]+)/g);

  return (
    <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(77,224,179,0.12),transparent_32%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-amortix-slate font-medium uppercase">AI signal</p>
          <p className="mt-3 text-sm leading-7 text-amortix-slate">
            {parts.map((part, index) =>
              /(₹[\d,]+)/.test(part) ? (
                <span key={index} className="font-medium text-amortix-emerald">
                  {part}
                </span>
              ) : (
                <span key={index}>{part}</span>
              )
            )}
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
    </Card>
  );
}
