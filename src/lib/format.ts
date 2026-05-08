import type { ConfidenceBand, RiskBand } from "@/types";

export function bandFromConfidence(p: number): ConfidenceBand {
  if (p >= 0.9) return "high";
  if (p >= 0.75) return "likely";
  if (p >= 0.5) return "unsure";
  return "low";
}

export const confidenceLabel: Record<ConfidenceBand, string> = {
  high: "High confidence",
  likely: "Likely",
  unsure: "Unsure",
  low: "Low confidence",
};

export const riskLabel: Record<RiskBand, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function formatPct(p: number, digits = 0) {
  return `${(p * 100).toFixed(digits)}%`;
}

export function relativeTime(iso: string, now: Date = new Date()): string {
  const ts = new Date(iso).getTime();
  const diffMs = ts - now.getTime();
  const sec = Math.round(diffMs / 1000);
  const abs = Math.abs(sec);
  const sign = sec < 0 ? "ago" : "from now";
  if (abs < 60) return sec < 0 ? "just now" : `in ${abs}s`;
  if (abs < 3600) return `${Math.round(abs / 60)}m ${sign}`;
  if (abs < 86400) return `${Math.round(abs / 3600)}h ${sign}`;
  return `${Math.round(abs / 86400)}d ${sign}`;
}

export function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
