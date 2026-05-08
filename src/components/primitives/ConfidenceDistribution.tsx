import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ConfidenceAlternative } from "@/types";
import { cn } from "@/lib/cn";
import { formatPct } from "@/lib/format";

interface Props {
  alternatives: ConfidenceAlternative[];
  /** Inline (single-bar w/ stacked segments) vs expanded (list of bars) */
  variant?: "inline" | "stacked";
  className?: string;
}

/**
 * Stacked-bar visualization of the model's top-k alternatives. Inline form is
 * a single horizontal bar with segments — fits in a table row. Stacked form
 * shows each alternative on its own row with a label and value.
 *
 * Why this matters: a single confidence number hides whether the model was
 * choosing between two close options or was certain. The distribution makes
 * "uncertainty about what" legible at a glance.
 */
export function ConfidenceDistribution({
  alternatives,
  variant = "inline",
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  const sorted = [...alternatives].sort((a, b) => b.probability - a.probability);

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex w-full flex-col gap-1 text-left",
          className
        )}
      >
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
          {sorted.map((alt, i) => (
            <div
              key={alt.label}
              className={cn(
                "h-full",
                i === 0
                  ? "bg-info"
                  : i === 1
                    ? "bg-info/55"
                    : "bg-info/30",
                i > 0 && "border-l border-canvas"
              )}
              style={{ width: `${alt.probability * 100}%` }}
            />
          ))}
        </div>
        {open && (
          <ul className="mt-2 space-y-1.5">
            {sorted.map((alt, i) => (
              <li key={alt.label} className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    i === 0 ? "bg-info" : i === 1 ? "bg-info/55" : "bg-info/30"
                  )}
                />
                <span className="flex-1 truncate text-fg">{alt.label}</span>
                <span className="tabular-nums text-fg-muted">
                  {formatPct(alt.probability, 1)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-1 text-[11px] text-fg-subtle group-hover:text-fg-muted">
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              open && "rotate-180"
            )}
          />
          {open ? "Hide alternatives" : `${sorted.length} alternatives considered`}
        </div>
      </button>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {sorted.map((alt, i) => (
        <li key={alt.label} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className={cn("truncate", i === 0 ? "text-fg font-medium" : "text-fg-muted")}>
              {alt.label}
            </span>
            <span className="tabular-nums text-fg-muted">
              {formatPct(alt.probability, 1)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className={cn(
                "h-full rounded-full",
                i === 0 ? "bg-info" : i === 1 ? "bg-info/55" : "bg-info/30"
              )}
              style={{ width: `${alt.probability * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
