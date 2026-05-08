import { Check, Pencil, X } from "lucide-react";
import type { AIClaim } from "@/types";
import { ConfidenceBadge } from "@/components/primitives/ConfidenceBadge";
import { ConfidenceDistribution } from "@/components/primitives/ConfidenceDistribution";
import { HallucinationChip } from "@/components/primitives/HallucinationChip";
import { EvidenceLink, UngroundedTag } from "@/components/primitives/EvidenceLink";
import { useSentinel } from "@/state/sentinel";
import { cn } from "@/lib/cn";

interface Props {
  claim: AIClaim;
  /** How the host tool wants the bare claim text rendered when Sentinel is off */
  bareLabel?: string;
}

/**
 * The core plugin component. When Sentinel is off it renders the host's plain
 * claim text — what an AI tool would have shipped without oversight. When on,
 * it wraps the same claim in confidence, evidence, flags, and verdict controls
 * — the entire intervention workflow, in place, without leaving the host.
 */
export function SentinelClaim({ claim, bareLabel }: Props) {
  const { enabled, decisions, setDecision } = useSentinel();
  const decision = decisions[claim.id] ?? { verdict: "pending" as const };
  const isHallucination = claim.flags.includes("hallucination");
  const ungrounded = claim.evidence.length === 0;
  const editing = decision.verdict === "edited";

  if (!enabled) {
    // Bare host output — no oversight overlay. This is what AI tools ship today.
    return (
      <div className="py-2 text-sm text-fg leading-relaxed">
        {bareLabel && (
          <span className="mr-2 text-[11px] uppercase tracking-wide text-fg-subtle">
            {bareLabel}
          </span>
        )}
        {claim.text}
      </div>
    );
  }

  const accentBorder =
    isHallucination
      ? "border-l-hallucination/60"
      : claim.band === "low"
        ? "border-l-confidence-low/60"
        : claim.band === "unsure"
          ? "border-l-confidence-medium/60"
          : "border-l-confidence-high/40";

  return (
    <div
      className={cn(
        "group relative rounded-md border border-border bg-surface-1/60 border-l-2 transition-colors",
        accentBorder,
        decision.verdict === "accepted" && "bg-confidence-high/[0.04]",
        decision.verdict === "rejected" && "bg-hallucination/[0.04] opacity-70",
        decision.verdict === "edited" && "bg-confidence-medium/[0.04]"
      )}
    >
      {/* Sentinel ribbon — small badge so the host knows this content is instrumented */}
      <div className="absolute -top-2 left-3 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider rounded-sm bg-canvas text-info border border-info/40">
        Sentinel
      </div>

      <div className="px-4 pt-4 pb-3 space-y-3">
        {/* Claim text */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {bareLabel && (
              <div className="text-[10px] uppercase tracking-wide text-fg-subtle mb-1">
                {bareLabel}
              </div>
            )}
            {editing ? (
              <textarea
                value={decision.edited ?? claim.text}
                onChange={(e) =>
                  setDecision(claim.id, { verdict: "edited", edited: e.target.value })
                }
                className="block w-full resize-none rounded-md border border-confidence-medium/50 bg-surface-1 px-3 py-2 text-sm text-fg focus:border-confidence-medium focus:outline-none focus:ring-1 focus:ring-confidence-medium/40"
                rows={3}
              />
            ) : (
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  decision.verdict === "rejected" && "line-through text-fg-subtle"
                )}
              >
                {claim.text}
              </p>
            )}
          </div>
          <div className="flex flex-none flex-col items-end gap-1.5">
            <ConfidenceBadge band={claim.band} value={claim.confidence} size="sm" />
            {claim.flags.map((f) => (
              <HallucinationChip key={f} kind={f} size="sm" />
            ))}
          </div>
        </div>

        {/* Evidence + alternatives row */}
        <div className="flex flex-wrap items-center gap-2">
          {ungrounded ? (
            <UngroundedTag />
          ) : (
            claim.evidence.map((e) => <EvidenceLink key={e.id} evidence={e} />)
          )}
        </div>

        {/* Alternatives (only shown for non-high confidence — progressive disclosure) */}
        {claim.alternatives.length > 1 && claim.band !== "high" && (
          <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle mb-2">
              Alternatives the model considered
            </div>
            <ConfidenceDistribution alternatives={claim.alternatives} variant="stacked" />
          </div>
        )}

        {/* Rationale */}
        {claim.rationale && claim.band !== "high" && (
          <div className="text-[11px] text-fg-muted leading-relaxed">
            <span className="font-medium text-fg-subtle">Why: </span>
            {claim.rationale}
          </div>
        )}
      </div>

      {/* Verdict bar */}
      <div className="border-t border-border bg-surface-1 px-4 py-2 flex items-center gap-2">
        <span className="text-[11px] text-fg-muted mr-1">Verdict:</span>
        <VerdictButton
          tone="accept"
          active={decision.verdict === "accepted"}
          Icon={Check}
          label="Accept"
          onClick={() => setDecision(claim.id, { verdict: "accepted" })}
        />
        <VerdictButton
          tone="edit"
          active={decision.verdict === "edited"}
          Icon={Pencil}
          label={editing ? "Editing…" : "Edit"}
          onClick={() =>
            setDecision(claim.id, {
              verdict: "edited",
              edited: decision.edited ?? claim.text,
            })
          }
        />
        <VerdictButton
          tone="reject"
          active={decision.verdict === "rejected"}
          Icon={X}
          label="Reject"
          onClick={() => setDecision(claim.id, { verdict: "rejected" })}
        />
        {decision.verdict !== "pending" && (
          <button
            onClick={() => setDecision(claim.id, { verdict: "pending" })}
            className="ml-auto text-[11px] text-fg-subtle hover:text-fg-muted"
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}

function VerdictButton({
  tone,
  active,
  Icon,
  label,
  onClick,
}: {
  tone: "accept" | "edit" | "reject";
  active: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  const palette =
    tone === "accept"
      ? "text-confidence-high border-confidence-high/40"
      : tone === "edit"
        ? "text-confidence-medium border-confidence-medium/40"
        : "text-hallucination border-hallucination/40";
  const activeBg =
    tone === "accept"
      ? "bg-confidence-high/15"
      : tone === "edit"
        ? "bg-confidence-medium/15"
        : "bg-hallucination/15";
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
        palette,
        active ? activeBg : "bg-transparent hover:bg-surface-2"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
