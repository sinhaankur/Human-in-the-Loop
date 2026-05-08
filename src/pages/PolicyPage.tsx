import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ConfidenceBadge } from "@/components/primitives/ConfidenceBadge";
import { HallucinationChip } from "@/components/primitives/HallucinationChip";
import { useVerticalMeta } from "@/state/tenant";
import { bandFromConfidence, formatPct } from "@/lib/format";
import { cn } from "@/lib/cn";

interface ThresholdRow {
  id: string;
  label: string;
  description: string;
  value: number;
  /** What happens when score is below threshold */
  belowAction: "human_review" | "auto_escalate" | "block";
}

const DEFAULT_THRESHOLDS: ThresholdRow[] = [
  {
    id: "primary",
    label: "Primary findings / clauses / dispositions",
    description:
      "Top-line outputs that drive a downstream decision (diagnosis, contract term, account action).",
    value: 0.9,
    belowAction: "human_review",
  },
  {
    id: "secondary",
    label: "Secondary / supporting findings",
    description: "Outputs that contextualize but don't drive the primary decision.",
    value: 0.75,
    belowAction: "human_review",
  },
  {
    id: "incidental",
    label: "Incidentals & extractions",
    description: "Auxiliary data extraction (medications, parties, transaction codes).",
    value: 0.65,
    belowAction: "human_review",
  },
];

export function PolicyPage() {
  const meta = useVerticalMeta();
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [autoBlockHallucinations, setAutoBlockHallucinations] = useState(true);
  const [requireEvidence, setRequireEvidence] = useState(true);
  const [escalateOOD, setEscalateOOD] = useState(true);
  const [requireTwoReviewers, setRequireTwoReviewers] = useState(false);

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Confidence thresholds</CardTitle>
            <CardDescription>
              Below the threshold, the output is held for human review.
              {" "}
              Each {meta.subjectNoun} category may be tuned independently.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-5">
            {thresholds.map((row, i) => (
              <ThresholdControl
                key={row.id}
                row={row}
                onChange={(v) =>
                  setThresholds((prev) =>
                    prev.map((r, j) => (i === j ? { ...r, value: v } : r))
                  )
                }
              />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hallucination & grounding rules</CardTitle>
            <CardDescription>
              Provenance is non-negotiable. These rules govern how ungrounded outputs are handled.
            </CardDescription>
          </CardHeader>
          <CardBody className="divide-y divide-border">
            <PolicyToggle
              label="Block ungrounded primary findings"
              description="Primary outputs without an evidence span are quarantined before reaching a reviewer."
              checked={autoBlockHallucinations}
              onChange={setAutoBlockHallucinations}
              chip={<HallucinationChip kind="hallucination" size="sm" />}
            />
            <PolicyToggle
              label="Require evidence link on every claim"
              description="A claim without an EvidenceLink renders as `No source cited` and cannot be silently accepted."
              checked={requireEvidence}
              onChange={setRequireEvidence}
            />
            <PolicyToggle
              label="Escalate out-of-distribution inputs"
              description="When the input embeddings fall outside the training distribution, route to a senior reviewer."
              checked={escalateOOD}
              onChange={setEscalateOOD}
              chip={<HallucinationChip kind="out_of_distribution" size="sm" />}
            />
            <PolicyToggle
              label="Require two reviewers for `Critical` risk"
              description="Independent dual review before a Critical-risk item can be marked Accepted."
              checked={requireTwoReviewers}
              onChange={setRequireTwoReviewers}
            />
          </CardBody>
        </Card>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-4">
        <Card>
          <CardBody>
            <div className="text-sm font-semibold text-fg">Effective policy</div>
            <div className="mt-1 text-[11px] text-fg-muted">
              How the model would treat outputs at each band.
            </div>
            <div className="mt-4 space-y-2.5">
              {[0.95, 0.82, 0.6, 0.4].map((v) => {
                const band = bandFromConfidence(v);
                const lowestThresh = Math.min(...thresholds.map((t) => t.value));
                const action =
                  v >= Math.max(...thresholds.map((t) => t.value))
                    ? "auto-accept"
                    : v >= lowestThresh
                      ? "human review"
                      : "human review (priority)";
                return (
                  <div
                    key={v}
                    className="flex items-center justify-between rounded-md border border-border bg-surface-1 px-3 py-2 text-xs"
                  >
                    <ConfidenceBadge band={band} value={v} size="sm" showValue />
                    <span className="text-fg-muted">→</span>
                    <span className="font-medium text-fg">{action}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-[11px] text-fg-muted leading-relaxed">
            <div className="text-xs font-medium text-fg mb-1">Note</div>
            Threshold changes apply to new outputs only. In-flight reviews retain the policy in
            force at ingestion time, with the active version recorded in the audit trail.
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}

function ThresholdControl({
  row,
  onChange,
}: {
  row: ThresholdRow;
  onChange: (v: number) => void;
}) {
  const band = bandFromConfidence(row.value);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-fg">{row.label}</div>
          <div className="mt-0.5 text-[11px] text-fg-muted leading-relaxed">{row.description}</div>
        </div>
        <div className="flex flex-none items-center gap-2">
          <ConfidenceBadge band={band} value={row.value} size="sm" showValue />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0.4}
          max={0.99}
          step={0.01}
          value={row.value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 accent-info"
        />
        <span className="w-12 text-right text-xs tabular-nums text-fg-muted">
          {formatPct(row.value)}
        </span>
      </div>
    </div>
  );
}

function PolicyToggle({
  label,
  description,
  checked,
  onChange,
  chip,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  chip?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fg">{label}</span>
          {chip}
        </div>
        <div className="mt-0.5 text-[11px] text-fg-muted leading-relaxed">{description}</div>
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "relative h-5 w-9 flex-none rounded-full border border-border-strong transition-colors",
          checked ? "bg-info/40" : "bg-surface-3"
        )}
      >
        <Switch.Thumb
          className={cn(
            "block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-fg shadow-sm transition-transform",
            checked && "translate-x-[18px]"
          )}
        />
      </Switch.Root>
    </div>
  );
}
