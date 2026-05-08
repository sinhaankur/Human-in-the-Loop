import type { RiskBand } from "@/types";
import { cn } from "@/lib/cn";
import { riskLabel } from "@/lib/format";

interface Props {
  risk: RiskBand;
  size?: "sm" | "md";
  variant?: "chip" | "bar";
  className?: string;
}

const RISK_BARS: Record<RiskBand, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const RISK_COLOR: Record<RiskBand, string> = {
  critical: "bg-hallucination",
  high: "bg-confidence-low",
  medium: "bg-confidence-medium",
  low: "bg-confidence-high",
};

const RISK_TEXT: Record<RiskBand, string> = {
  critical: "text-hallucination",
  high: "text-confidence-low",
  medium: "text-confidence-medium",
  low: "text-confidence-high",
};

/**
 * Risk = confidence × business impact. A 99% confidence on a low-stakes call
 * still ranks below a 70% confidence on a critical-stakes call. The 4-bar
 * meter is faster to scan in a triage queue than a numeric score.
 */
export function RiskMeter({ risk, size = "md", variant = "bar", className }: Props) {
  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
          "border bg-surface-2",
          RISK_TEXT[risk],
          risk === "critical"
            ? "border-hallucination/40"
            : risk === "high"
              ? "border-confidence-low/40"
              : risk === "medium"
                ? "border-confidence-medium/40"
                : "border-confidence-high/40",
          className
        )}
      >
        <RiskBars risk={risk} size="sm" />
        {riskLabel[risk]}
      </span>
    );
  }
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <RiskBars risk={risk} size={size} />
      <span className={cn("text-xs font-medium", RISK_TEXT[risk])}>{riskLabel[risk]}</span>
    </div>
  );
}

function RiskBars({ risk, size = "md" }: { risk: RiskBand; size?: "sm" | "md" }) {
  const filled = RISK_BARS[risk];
  return (
    <div className="inline-flex items-end gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-[2px]",
            size === "sm" ? "w-[3px]" : "w-1",
            i <= filled ? RISK_COLOR[risk] : "bg-surface-3",
            // Increasing height per bar
            size === "sm"
              ? i === 1
                ? "h-1.5"
                : i === 2
                  ? "h-2"
                  : i === 3
                    ? "h-2.5"
                    : "h-3"
              : i === 1
                ? "h-2"
                : i === 2
                  ? "h-3"
                  : i === 3
                    ? "h-3.5"
                    : "h-4"
          )}
        />
      ))}
    </div>
  );
}
