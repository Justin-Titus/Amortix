import { type DefaultRiskResult } from "@/lib/ml/default-risk";

export function monthsSince(dateInput: Date | string | null | undefined): number {
  if (!dateInput) return 0;
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 0;
  }

  const now = new Date();
  const years = now.getFullYear() - date.getFullYear();
  const months = now.getMonth() - date.getMonth();
  const diff = years * 12 + months;
  if (diff <= 0) return 0;
  return diff;
}

export function riskTone(level: DefaultRiskResult["riskLevel"]): string {
  if (level === "critical") return "badge-red";
  if (level === "high") return "badge-amber";
  if (level === "medium") return "badge-slate";
  return "badge-green";
}
