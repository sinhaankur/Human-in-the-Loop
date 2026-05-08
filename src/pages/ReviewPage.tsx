import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Pencil, ArrowUpRight, X, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfidenceBadge } from "@/components/primitives/ConfidenceBadge";
import { ConfidenceDistribution } from "@/components/primitives/ConfidenceDistribution";
import { HallucinationChip } from "@/components/primitives/HallucinationChip";
import { EvidenceLink, UngroundedTag } from "@/components/primitives/EvidenceLink";
import { RiskMeter } from "@/components/primitives/RiskMeter";
import { useReviewStore } from "@/state/reviewStore";
import { VERTICAL_META } from "@/lib/verticals";
import { bandFromConfidence, formatPct, relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AIClaim, DecisionAction, ReviewItem } from "@/types";

type ClaimVerdict = "pending" | "accepted" | "edited" | "rejected";

interface VerdictState {
  verdict: ClaimVerdict;
  edited?: string;
}

export function ReviewPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { itemById, submitDecision } = useReviewStore();
  const navigate = useNavigate();
  const item = itemId ? itemById(itemId) : undefined;

  const [verdicts, setVerdicts] = useState<Record<string, VerdictState>>({});
  const [focusMode, setFocusMode] = useState(false);
  const [rationale, setRationale] = useState("");

  if (!item) {
    return (
      <div className="p-12 text-center">
        <div className="text-sm text-fg-muted">Item not found.</div>
        <Button asChild variant="secondary" size="sm" className="mt-4">
          <Link to="/queue">Back to queue</Link>
        </Button>
      </div>
    );
  }

  const meta = VERTICAL_META[item.vertical];
  const setVerdict = (claimId: string, next: VerdictState) =>
    setVerdicts((p) => ({ ...p, [claimId]: next }));

  const claimsToShow = focusMode
    ? item.claims.filter(
        (c) =>
          c.flags.length > 0 ||
          c.confidence < 0.75 ||
          (verdicts[c.id]?.verdict ?? "pending") !== "accepted"
      )
    : item.claims;

  const summary = useMemo(() => {
    const counts = { accepted: 0, edited: 0, rejected: 0, pending: 0 };
    item.claims.forEach((c) => {
      counts[verdicts[c.id]?.verdict ?? "pending"] += 1;
    });
    return counts;
  }, [item.claims, verdicts]);

  const handleSubmit = (action: DecisionAction) => {
    const changedClaimIds = Object.entries(verdicts)
      .filter(([, v]) => v.verdict === "edited" || v.verdict === "rejected")
      .map(([id]) => id);
    submitDecision({
      itemId: item.id,
      action,
      reviewer: meta.reviewer,
      rationale: rationale || undefined,
      changedClaimIds: changedClaimIds.length > 0 ? changedClaimIds : undefined,
    });
    navigate("/audit");
  };

  return (
    <div className="grid h-full grid-cols-12 gap-0">
      {/* Left rail — context / subject */}
      <aside className="col-span-12 lg:col-span-3 border-r border-border bg-surface-1/40 px-5 py-5 space-y-5 overflow-y-auto">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/queue">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to queue
            </Link>
          </Button>
        </div>

        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">
            {meta.subjectNoun}
          </div>
          <div className="mt-1 text-sm font-semibold text-fg">{item.subjectLabel}</div>
          <div className="mt-2 text-xs text-fg-muted leading-relaxed">{item.subtitle}</div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <Field label="Model">
            <div className="text-fg">{item.modelName}</div>
            <div className="text-fg-muted">{item.modelVersion}</div>
          </Field>
          <Field label="Ingested">
            <div className="text-fg">{relativeTime(item.ingestedAt)}</div>
          </Field>
          <Field label="SLA">
            <div className={cn(
              new Date(item.dueAt).getTime() < Date.now()
                ? "text-hallucination font-medium"
                : "text-fg"
            )}>
              {new Date(item.dueAt).getTime() < Date.now()
                ? "overdue"
                : `due ${relativeTime(item.dueAt)}`}
            </div>
          </Field>
          <Field label="Risk">
            <RiskMeter risk={item.risk} variant="chip" />
          </Field>
          <Field label="Aggregate confidence">
            <div className="space-y-1.5">
              <ConfidenceBadge
                band={bandFromConfidence(item.aggregateConfidence)}
                value={item.aggregateConfidence}
                showValue
              />
            </div>
          </Field>
        </div>

        <div className="border-t border-border pt-4">
          <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle mb-2">
            Reviewer progress
          </div>
          <div className="space-y-1.5 text-xs">
            <ProgressRow label="Accepted" count={summary.accepted} total={item.claims.length} tone="high" />
            <ProgressRow label="Edited" count={summary.edited} total={item.claims.length} tone="medium" />
            <ProgressRow label="Rejected" count={summary.rejected} total={item.claims.length} tone="hallucination" />
            <ProgressRow label="Pending" count={summary.pending} total={item.claims.length} tone="muted" />
          </div>
        </div>
      </aside>

      {/* Center — the workspace */}
      <section className="col-span-12 lg:col-span-6 overflow-y-auto px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-fg leading-tight">{item.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {item.flags.map((f) => (
                <HallucinationChip key={f} kind={f} size="sm" />
              ))}
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                meta.accentSoft, meta.accentText
              )}>
                <meta.Icon className="h-3 w-3" />
                {meta.tenant}
              </span>
            </div>
          </div>
          <Button
            variant={focusMode ? "primary" : "outline"}
            size="sm"
            onClick={() => setFocusMode((v) => !v)}
          >
            <Eye className="h-3.5 w-3.5" />
            {focusMode ? "Showing flagged only" : "Focus mode"}
          </Button>
        </div>

        <div className="space-y-4">
          {claimsToShow.map((claim, idx) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              index={idx + 1}
              verdict={verdicts[claim.id] ?? { verdict: "pending" }}
              onChange={(next) => setVerdict(claim.id, next)}
            />
          ))}
          {claimsToShow.length === 0 && (
            <Card className="p-12 text-center text-sm text-fg-muted">
              All claims are accepted and free of flags. Nothing to focus on.
            </Card>
          )}
        </div>
      </section>

      {/* Right rail — decision */}
      <aside className="col-span-12 lg:col-span-3 border-l border-border bg-surface-1/40 px-5 py-5 space-y-4 overflow-y-auto">
        <div>
          <div className="text-sm font-semibold text-fg">Submit decision</div>
          <div className="mt-1 text-xs text-fg-muted leading-relaxed">
            Your decision is logged with timestamp, reviewer, and any per-claim edits.
          </div>
        </div>
        <DecisionSummary item={item} summary={summary} />

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-fg-subtle mb-1.5">
            Rationale (optional)
          </label>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="e.g. accepted finding 1 (PE confirmed); edited finding 2 (margin not spiculated); rejected finding 3 (no effusion)."
            className="block w-full resize-none rounded-md border border-border bg-surface-1 px-3 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-fg/20"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Button
            variant="accept"
            size="md"
            className="w-full"
            onClick={() => handleSubmit(summary.edited > 0 || summary.rejected > 0 ? "correct" : "accept")}
            disabled={summary.pending > 0}
          >
            <Check className="h-4 w-4" />
            {summary.edited > 0 || summary.rejected > 0 ? "Submit with corrections" : "Accept all"}
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => handleSubmit("escalate")}
          >
            <ArrowUpRight className="h-4 w-4" />
            Escalate to senior
          </Button>
          <Button
            variant="danger"
            size="md"
            className="w-full"
            onClick={() => handleSubmit("reject")}
          >
            <X className="h-4 w-4" />
            Reject output
          </Button>
        </div>
        {summary.pending > 0 && (
          <div className="text-[11px] text-fg-subtle leading-relaxed">
            {summary.pending} claim{summary.pending === 1 ? "" : "s"} still need a verdict before
            you can accept. You can still escalate or reject the whole output.
          </div>
        )}

        <div className="rounded-md border border-border bg-surface-2 p-3 text-[11px] text-fg-muted leading-relaxed">
          <div className="flex items-center gap-1.5 text-fg mb-1">
            <Sparkles className="h-3 w-3 text-info" />
            <span className="font-medium">Why this matters</span>
          </div>
          Your edits feed model evaluation. Patterns of correction inform calibration thresholds
          and may trigger re-training.
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle mb-0.5">
        {label}
      </div>
      <div className="text-xs">{children}</div>
    </div>
  );
}

function ProgressRow({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: "high" | "medium" | "hallucination" | "muted";
}) {
  const pct = total === 0 ? 0 : (count / total) * 100;
  const cls =
    tone === "high"
      ? "bg-confidence-high"
      : tone === "medium"
        ? "bg-confidence-medium"
        : tone === "hallucination"
          ? "bg-hallucination"
          : "bg-surface-3";
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-fg-muted">{label}</span>
        <span className="tabular-nums text-fg">{count}/{total}</span>
      </div>
      <div className="mt-1 h-1 w-full rounded-full bg-surface-3">
        <div className={cn("h-full rounded-full", cls)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface ClaimCardProps {
  claim: AIClaim;
  index: number;
  verdict: VerdictState;
  onChange: (next: VerdictState) => void;
}

function ClaimCard({ claim, index, verdict, onChange }: ClaimCardProps) {
  const isHallucination = claim.flags.includes("hallucination");
  const ungrounded = claim.evidence.length === 0;
  const editing = verdict.verdict === "edited";

  const accentBorder =
    isHallucination
      ? "border-hallucination/40"
      : claim.band === "low"
        ? "border-confidence-low/40"
        : claim.band === "unsure"
          ? "border-confidence-medium/40"
          : "border-border";

  return (
    <Card className={cn("overflow-hidden border-l-2", accentBorder)}>
      <div className="border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-3 text-[10px] font-semibold text-fg-muted tabular-nums">
            {index}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
            {claim.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {claim.flags.map((f) => (
            <HallucinationChip key={f} kind={f} size="sm" />
          ))}
          <ConfidenceBadge band={claim.band} value={claim.confidence} size="sm" />
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 bg-ai-tint">
        {/* The claim itself */}
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle mb-1.5">
            AI claim
          </div>
          {editing ? (
            <textarea
              value={verdict.edited ?? claim.text}
              onChange={(e) => onChange({ verdict: "edited", edited: e.target.value })}
              className="block w-full resize-none rounded-md border border-confidence-medium/50 bg-surface-1 px-3 py-2 text-sm text-fg focus:border-confidence-medium focus:outline-none focus:ring-1 focus:ring-confidence-medium/40"
              rows={3}
            />
          ) : (
            <p className={cn(
              "text-sm leading-relaxed",
              verdict.verdict === "rejected" && "line-through text-fg-subtle",
              verdict.verdict === "accepted" && "text-fg",
              verdict.verdict === "pending" && "text-fg"
            )}>
              {claim.text}
            </p>
          )}
        </div>

        {/* Uncertainty viz — top-k alternatives, expanded by default for low-confidence */}
        {claim.alternatives.length > 1 && (
          <div className="rounded-md border border-border bg-surface-1 px-3.5 py-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle mb-2">
              Alternatives the model considered
            </div>
            <ConfidenceDistribution
              alternatives={claim.alternatives}
              variant="stacked"
            />
          </div>
        )}

        {/* Rationale — the model's "why" */}
        {claim.rationale && (
          <div className="rounded-md border border-border bg-surface-1 px-3.5 py-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle mb-1">
              Model rationale
            </div>
            <p className="text-xs text-fg-muted leading-relaxed">{claim.rationale}</p>
          </div>
        )}

        {/* Evidence */}
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle mb-2">
            Evidence
          </div>
          {ungrounded ? (
            <UngroundedTag />
          ) : (
            <div className="flex flex-wrap gap-2">
              {claim.evidence.map((e) => (
                <EvidenceLink key={e.id} evidence={e} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verdict actions */}
      <div className="border-t border-border bg-surface-1 px-5 py-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-fg-muted mr-1">Verdict:</span>
        <VerdictButton
          active={verdict.verdict === "accepted"}
          tone="accept"
          onClick={() => onChange({ verdict: "accepted" })}
          Icon={Check}
          label="Accept"
        />
        <VerdictButton
          active={verdict.verdict === "edited"}
          tone="edit"
          onClick={() =>
            onChange({
              verdict: "edited",
              edited: verdict.edited ?? claim.text,
            })
          }
          Icon={Pencil}
          label={verdict.verdict === "edited" ? "Editing…" : "Edit"}
        />
        <VerdictButton
          active={verdict.verdict === "rejected"}
          tone="reject"
          onClick={() => onChange({ verdict: "rejected" })}
          Icon={X}
          label="Reject"
        />
        {verdict.verdict !== "pending" && (
          <button
            onClick={() => onChange({ verdict: "pending" })}
            className="ml-auto text-[11px] text-fg-subtle hover:text-fg-muted"
          >
            clear
          </button>
        )}
      </div>
    </Card>
  );
}

function VerdictButton({
  active,
  tone,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  tone: "accept" | "edit" | "reject";
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const palette =
    tone === "accept"
      ? "text-confidence-high border-confidence-high/40"
      : tone === "edit"
        ? "text-confidence-medium border-confidence-medium/40"
        : "text-hallucination border-hallucination/40";
  const activePalette =
    tone === "accept"
      ? "bg-confidence-high/15"
      : tone === "edit"
        ? "bg-confidence-medium/15"
        : "bg-hallucination/15";
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        palette,
        active ? activePalette : "bg-transparent hover:bg-surface-2"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function DecisionSummary({
  item,
  summary,
}: {
  item: ReviewItem;
  summary: { accepted: number; edited: number; rejected: number; pending: number };
}) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3 space-y-2 text-xs">
      <div className="flex items-baseline justify-between">
        <span className="text-fg-muted">Confidence</span>
        <span className="text-fg tabular-nums">{formatPct(item.aggregateConfidence)}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-fg-muted">Claims</span>
        <span className="text-fg tabular-nums">
          {summary.accepted + summary.edited + summary.rejected} / {item.claims.length}
        </span>
      </div>
      {summary.edited > 0 && (
        <div className="flex items-baseline justify-between text-confidence-medium">
          <span>· edited</span>
          <span className="tabular-nums">{summary.edited}</span>
        </div>
      )}
      {summary.rejected > 0 && (
        <div className="flex items-baseline justify-between text-hallucination">
          <span>· rejected</span>
          <span className="tabular-nums">{summary.rejected}</span>
        </div>
      )}
    </div>
  );
}
