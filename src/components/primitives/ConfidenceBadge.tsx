import type { ConfidenceBand } from "@/types";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/cn";
import { confidenceLabel, formatPct } from "@/lib/format";

interface Props {
  band: ConfidenceBand;
  /** Raw confidence 0..1 — revealed on hover */
  value?: number;
  /** Compact form for table rows */
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}

const BAND_STYLES: Record<ConfidenceBand, string> = {
  high: "bg-confidence-high/12 text-confidence-high border-confidence-high/35",
  likely: "bg-confidence-high/8 text-confidence-high/90 border-confidence-high/25",
  unsure: "bg-confidence-medium/12 text-confidence-medium border-confidence-medium/35",
  low: "bg-confidence-low/12 text-confidence-low border-confidence-low/35",
};

const DOT_STYLES: Record<ConfidenceBand, string> = {
  high: "bg-confidence-high",
  likely: "bg-confidence-high/70",
  unsure: "bg-confidence-medium",
  low: "bg-confidence-low",
};

/**
 * Shows a calibrated confidence label (High / Likely / Unsure / Low) instead
 * of a raw % everywhere. Hover reveals the exact value — calibrated language
 * up front, precise number on demand. Reduces percentage fatigue.
 */
export function ConfidenceBadge({
  band,
  value,
  size = "md",
  showValue = false,
  className,
}: Props) {
  const label = confidenceLabel[band];
  const pct = value != null ? formatPct(value) : null;

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        BAND_STYLES[band],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          DOT_STYLES[band],
          band === "low" && "animate-pulse-soft"
        )}
      />
      <span>{label}</span>
      {showValue && pct && <span className="opacity-70 tabular-nums">{pct}</span>}
    </span>
  );

  if (value == null) return inner;
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{label}</span>
          <span className="text-fg-muted tabular-nums">Model probability {pct}</span>
        </div>
      }
    >
      {inner}
    </Tooltip>
  );
}
