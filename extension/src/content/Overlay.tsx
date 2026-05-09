import { useMemo, useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { SentinelClaim } from "@/components/plugin/SentinelClaim";
import { SentinelProvider } from "@/state/sentinel";
import type { AIClaim } from "@/types";

interface Props {
  claims: AIClaim[];
  hostLabel: string;
}

/**
 * The expanded oversight panel attached below a host AI message. Hidden by
 * default behind a Sentinel badge so the host's own UI is unchanged until
 * the reviewer opts in. When opened, every parsed paragraph is rewrapped
 * as a <SentinelClaim> with full confidence/evidence/verdict controls.
 */
export function Overlay({ claims, hostLabel }: Props) {
  const [expanded, setExpanded] = useState(false);
  const summary = useMemo(() => {
    const flagged = claims.filter((c) => c.band === "low" || c.band === "unsure").length;
    const ungrounded = claims.filter((c) => c.evidence.length === 0).length;
    return { total: claims.length, flagged, ungrounded };
  }, [claims]);

  if (claims.length === 0) return null;

  return (
    <SentinelProvider>
      <div className="my-3 rounded-lg border border-info/30 bg-canvas/95 backdrop-blur shadow-lg overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-1 transition-colors"
        >
          <ShieldCheck className="h-4 w-4 text-info flex-none" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-fg">
              Sentinel — {hostLabel} response
            </div>
            <div className="text-[10px] text-fg-muted">
              {summary.total} claim{summary.total === 1 ? "" : "s"}
              {summary.flagged > 0 && (
                <>
                  {" · "}
                  <span className="text-confidence-medium">{summary.flagged} flagged</span>
                </>
              )}
              {summary.ungrounded > 0 && (
                <>
                  {" · "}
                  <span className="text-hallucination">{summary.ungrounded} ungrounded</span>
                </>
              )}
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-fg-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-fg-muted" />
          )}
        </button>

        {expanded && (
          <div className="border-t border-border bg-surface-1/40 px-4 py-3 space-y-3 max-h-[500px] overflow-y-auto">
            {claims.map((c) => (
              <SentinelClaim key={c.id} claim={c} />
            ))}
            <p className="text-[10px] text-fg-subtle leading-snug pt-1">
              Confidence and evidence shown here are illustrative — vendors do
              not currently expose this metadata. Sentinel is a speculative
              concept for what oversight UI would look like if they did.
            </p>
          </div>
        )}
      </div>
    </SentinelProvider>
  );
}
