import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfidenceBadge } from "@/components/primitives/ConfidenceBadge";
import { ConfidenceDistribution } from "@/components/primitives/ConfidenceDistribution";
import { RiskMeter } from "@/components/primitives/RiskMeter";
import { HallucinationChip } from "@/components/primitives/HallucinationChip";
import { useReviewStore } from "@/state/reviewStore";
import { useTenant, useVerticalMeta } from "@/state/tenant";
import { bandFromConfidence, relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { FlagKind, ReviewItem } from "@/types";

type StatusFilter = "all" | "pending" | "in_review" | "decided";
type FlagFilter = "all" | FlagKind;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_review", label: "In review" },
  { id: "decided", label: "Decided" },
];

const FLAG_OPTIONS: { id: FlagFilter; label: string }[] = [
  { id: "all", label: "All flags" },
  { id: "hallucination", label: "Hallucination" },
  { id: "low_confidence", label: "Low confidence" },
  { id: "out_of_distribution", label: "Out of distribution" },
  { id: "pii", label: "PII" },
];

export function QueuePage() {
  const { items } = useReviewStore();
  const { vertical } = useTenant();
  const meta = useVerticalMeta();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [flag, setFlag] = useState<FlagFilter>("all");
  const [aggregateAcrossTenants, setAggregateAcrossTenants] = useState(false);

  const filtered = useMemo(() => {
    return items
      .filter((it) => (aggregateAcrossTenants ? true : it.vertical === vertical))
      .filter((it) => {
        if (status === "all") return true;
        if (status === "decided")
          return ["accepted", "corrected", "escalated"].includes(it.status);
        return it.status === status;
      })
      .filter((it) => (flag === "all" ? true : it.flags.includes(flag as FlagKind)))
      .sort((a, b) => riskWeight(b.risk) - riskWeight(a.risk));
  }, [items, vertical, status, flag, aggregateAcrossTenants]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border border-border bg-surface-1 p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setStatus(t.id)}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                status === t.id
                  ? "bg-surface-3 text-fg"
                  : "text-fg-muted hover:text-fg"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-fg-muted">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <select
            value={flag}
            onChange={(e) => setFlag(e.target.value as FlagFilter)}
            className="rounded-md border border-border bg-surface-1 px-2.5 py-1.5 text-xs text-fg focus:outline-none focus:ring-2 focus:ring-fg/20"
          >
            {FLAG_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <Button
            variant={aggregateAcrossTenants ? "primary" : "secondary"}
            size="sm"
            onClick={() => setAggregateAcrossTenants((v) => !v)}
          >
            {aggregateAcrossTenants ? "All tenants" : `${meta.name} only`}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_minmax(160px,200px)_minmax(180px,220px)_auto_auto] gap-x-4 border-b border-border px-5 py-2.5 text-[10px] font-medium uppercase tracking-wide text-fg-subtle">
          <div>Risk</div>
          <div>Subject under review</div>
          <div>Aggregate confidence</div>
          <div>Flags</div>
          <div className="text-right">SLA</div>
          <div className="text-right">&nbsp;</div>
        </div>
        <ul className="divide-y divide-border">
          {filtered.map((it) => (
            <QueueRow key={it.id} item={it} />
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-fg-muted">
              No items match these filters.
            </li>
          )}
        </ul>
      </Card>

      <div className="text-[11px] text-fg-subtle">
        Showing {filtered.length} of {items.length} item{items.length === 1 ? "" : "s"} ·
        sorted by risk × uncertainty
      </div>
    </div>
  );
}

function riskWeight(r: string) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[r] ?? 0;
}

function QueueRow({ item }: { item: ReviewItem }) {
  const overdue = new Date(item.dueAt).getTime() < Date.now();
  const topClaim = item.claims[0];
  return (
    <li className="grid grid-cols-[auto_1fr_minmax(160px,200px)_minmax(180px,220px)_auto_auto] items-center gap-x-4 px-5 py-4 transition-colors hover:bg-surface-2">
      <RiskMeter risk={item.risk} variant="bar" />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-fg">{item.title}</div>
        <div className="mt-0.5 truncate text-xs text-fg-muted">
          {item.subjectLabel} · {item.modelName} {item.modelVersion}
        </div>
        <div className="mt-1 truncate text-[11px] text-fg-subtle">
          {item.subtitle}
        </div>
      </div>
      <div>
        <ConfidenceBadge
          band={bandFromConfidence(item.aggregateConfidence)}
          value={item.aggregateConfidence}
          size="sm"
          showValue
        />
        {topClaim && (
          <div className="mt-1.5 max-w-[200px]">
            <ConfidenceDistribution
              alternatives={topClaim.alternatives}
              variant="inline"
            />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {item.flags.length === 0 && (
          <span className="text-[11px] text-fg-subtle">no flags</span>
        )}
        {item.flags.map((f) => (
          <HallucinationChip key={f} kind={f} size="sm" />
        ))}
      </div>
      <div className="text-right">
        <div
          className={cn(
            "text-xs tabular-nums",
            overdue ? "text-hallucination font-medium" : "text-fg-muted"
          )}
        >
          {overdue ? "overdue" : `due ${relativeTime(item.dueAt)}`}
        </div>
        <div className="text-[10px] text-fg-subtle">
          status: {item.status.replace("_", " ")}
        </div>
      </div>
      <Button asChild variant="secondary" size="sm">
        <Link to={`/review/${item.id}`}>
          Review <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </li>
  );
}
