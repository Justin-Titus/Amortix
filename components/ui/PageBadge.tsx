import { LucideIcon } from "lucide-react";

export function PageBadge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 mb-4">
      <Icon className="w-3 h-3 text-slate-400" />
      <span className="text-[11px] font-medium text-slate-500 tracking-[0.02em]">
        {label}
      </span>
    </div>
  );
}
