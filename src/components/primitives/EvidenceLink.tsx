import { Link2, Quote } from "lucide-react";
import type { EvidenceSpan } from "@/types";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/cn";

interface Props {
  evidence: EvidenceSpan;
  className?: string;
}

const RELIABILITY_DOT: Record<EvidenceSpan["reliability"], string> = {
  high: "bg-confidence-high",
  likely: "bg-confidence-high/70",
  unsure: "bg-confidence-medium",
  low: "bg-confidence-low",
};

/**
 * Anchors an AI claim to a specific source span. Provenance is the antidote
 * to hallucination — every claim should either link here, or be flagged as
 * ungrounded. The reliability dot reflects how confident we are in the
 * source itself, not the claim.
 */
export function EvidenceLink({ evidence, className }: Props) {
  return (
    <Tooltip
      content={
        <div className="flex max-w-sm flex-col gap-1.5 font-sans">
          <div className="flex items-center gap-1.5 text-fg-muted">
            <Quote className="h-3 w-3" />
            <span className="text-[11px] uppercase tracking-wide">Evidence</span>
          </div>
          <div className="font-mono text-[11px] text-fg/90 leading-relaxed">
            "{evidence.excerpt}"
          </div>
          <div className="text-[11px] text-fg-muted">{evidence.source}</div>
        </div>
      }
    >
      <button
        type="button"
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] text-fg-muted hover:border-info/40 hover:text-fg transition-colors",
          className
        )}
      >
        <Link2 className="h-3 w-3 text-info group-hover:text-info" />
        <span className="font-mono">{evidence.source}</span>
        {evidence.locator && (
          <>
            <span className="text-fg-subtle">·</span>
            <span className="text-fg-subtle">{evidence.locator}</span>
          </>
        )}
        <span
          className={cn(
            "ml-1 h-1.5 w-1.5 rounded-full",
            RELIABILITY_DOT[evidence.reliability]
          )}
        />
      </button>
    </Tooltip>
  );
}

/** When a claim has no evidence — render this as a deliberately stark "ungrounded" state. */
export function UngroundedTag({ className }: { className?: string }) {
  return (
    <Tooltip content="Model produced this claim without citing any source. Treat as potentially fabricated.">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-hallucination/45 bg-hatch-hallucination px-2 py-1 text-[11px] font-medium text-hallucination",
          className
        )}
      >
        <Link2 className="h-3 w-3" />
        No source cited
      </span>
    </Tooltip>
  );
}
