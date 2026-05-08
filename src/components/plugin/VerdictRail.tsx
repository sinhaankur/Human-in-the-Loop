import { useMemo, useState } from "react";
import { Check, ArrowUpRight, X, FileSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSentinel, useScenarioItem } from "@/state/sentinel";
import { cn } from "@/lib/cn";

/**
 * The submit rail. Stays anchored at the bottom of the host tool while the
 * reviewer is working through claims. Counts verdicts in real time, morphs
 * the primary action between "Accept all" and "Submit with corrections".
 */
export function VerdictRail() {
  const { enabled, decisions, recordAudit, setDrawerOpen } = useSentinel();
  const item = useScenarioItem();
  const [rationale, setRationale] = useState("");
  const [showRationale, setShowRationale] = useState(false);

  const counts = useMemo(() => {
    const c = { accepted: 0, edited: 0, rejected: 0, pending: 0 };
    item.claims.forEach((claim) => {
      const v = decisions[claim.id]?.verdict ?? "pending";
      c[v] += 1;
    });
    return c;
  }, [item.claims, decisions]);

  if (!enabled) return null;

  const total = item.claims.length;
  const decided = total - counts.pending;
  const hasCorrections = counts.edited > 0 || counts.rejected > 0;
  const allDecided = counts.pending === 0;

  return (
    <div className="sticky bottom-0 z-30 border-t border-info/30 bg-canvas/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-6 py-3">
        {showRationale && (
          <div className="pb-3">
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Rationale (optional) — e.g. accepted finding 1; edited finding 2 (margin not spiculated); rejected finding 3 (no effusion)."
              className="block w-full resize-none rounded-md border border-border bg-surface-1 px-3 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-fg/20"
              rows={2}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {/* Progress */}
          <div className="flex items-center gap-3 mr-auto">
            <div className="flex items-center gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-info" />
              <span className="text-fg-muted">Sentinel</span>
              <span className="text-fg tabular-nums">
                {decided}/{total}
              </span>
              <span className="text-fg-muted">claims reviewed</span>
            </div>
            {hasCorrections && (
              <div className="flex items-center gap-2 text-[11px]">
                {counts.edited > 0 && (
                  <span className="text-confidence-medium">
                    {counts.edited} edited
                  </span>
                )}
                {counts.rejected > 0 && (
                  <span className="text-hallucination">
                    {counts.rejected} rejected
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRationale((v) => !v)}
          >
            {showRationale ? "Hide rationale" : "Add rationale"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            <FileSearch className="h-3.5 w-3.5" />
            Audit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              recordAudit("escalate", rationale || undefined);
              setRationale("");
            }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Escalate
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              recordAudit("reject", rationale || undefined);
              setRationale("");
            }}
          >
            <X className="h-3.5 w-3.5" />
            Reject output
          </Button>
          <Button
            variant="accept"
            size="sm"
            disabled={!allDecided}
            onClick={() => {
              recordAudit(hasCorrections ? "correct" : "accept", rationale || undefined);
              setRationale("");
            }}
            className={cn(!allDecided && "cursor-not-allowed")}
          >
            <Check className="h-3.5 w-3.5" />
            {hasCorrections ? "Submit with corrections" : "Accept all"}
          </Button>
        </div>

        {!allDecided && (
          <div className="mt-1.5 text-[11px] text-fg-subtle">
            {counts.pending} claim{counts.pending === 1 ? "" : "s"} still need a verdict before
            you can accept. You can still escalate or reject the whole output.
          </div>
        )}
      </div>
    </div>
  );
}
