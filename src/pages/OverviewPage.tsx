import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, ShieldCheck, Timer, Activity } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfidenceBadge } from "@/components/primitives/ConfidenceBadge";
import { RiskMeter } from "@/components/primitives/RiskMeter";
import { HallucinationChip } from "@/components/primitives/HallucinationChip";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useReviewStore } from "@/state/reviewStore";
import { useTenant, useVerticalMeta } from "@/state/tenant";
import { VERTICAL_META, VERTICAL_ORDER } from "@/lib/verticals";
import { bandFromConfidence, formatPct, relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Vertical } from "@/types";

export function OverviewPage() {
  const { items, audit } = useReviewStore();
  const { vertical } = useTenant();
  const meta = useVerticalMeta();

  const tenantItems = items.filter((it) => it.vertical === vertical);
  const stats = useMemo(() => {
    const open = tenantItems.filter(
      (it) => it.status === "pending" || it.status === "in_review"
    );
    const hallucinations = tenantItems.filter((it) =>
      it.flags.includes("hallucination")
    );
    const overdue = open.filter((it) => new Date(it.dueAt).getTime() < Date.now());
    const avgConf =
      tenantItems.length === 0
        ? 0
        : tenantItems.reduce((s, it) => s + it.aggregateConfidence, 0) /
          tenantItems.length;
    const decisionsToday = audit.filter(
      (a) =>
        a.vertical === vertical &&
        Date.now() - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000
    ).length;
    return { open: open.length, hallucinations: hallucinations.length, overdue: overdue.length, avgConf, decisionsToday };
  }, [tenantItems, audit, vertical]);

  const topItems = [...tenantItems]
    .filter((it) => it.status === "pending" || it.status === "in_review")
    .sort((a, b) => riskWeight(b.risk) - riskWeight(a.risk))
    .slice(0, 4);

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      <div className="col-span-12 xl:col-span-8 space-y-6">
        {/* Hero strip — KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Open reviews"
            value={stats.open}
            hint={`${stats.overdue} past SLA`}
            tone={stats.overdue > 0 ? "warn" : "default"}
            Icon={Timer}
          />
          <KpiCard
            label="Hallucinations flagged"
            value={stats.hallucinations}
            hint="ungrounded claims · 7d"
            tone={stats.hallucinations > 0 ? "alert" : "default"}
            Icon={AlertTriangle}
          />
          <KpiCard
            label="Avg model confidence"
            value={formatPct(stats.avgConf)}
            hint="across active items"
            Icon={Activity}
          />
          <KpiCard
            label="Decisions today"
            value={stats.decisionsToday}
            hint="reviewer actions logged"
            Icon={ShieldCheck}
          />
        </div>

        {/* Triage — top items by risk */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Top items needing attention</CardTitle>
              <CardDescription>
                Sorted by risk × uncertainty. Hallucinations surface first.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/queue">
                Open full queue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardBody className="!p-0">
            <ul className="divide-y divide-border">
              {topItems.map((it) => (
                <li key={it.id}>
                  <Link
                    to={`/review/${it.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors"
                  >
                    <RiskMeter risk={it.risk} variant="bar" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-fg">{it.title}</div>
                      <div className="mt-0.5 truncate text-xs text-fg-muted">
                        {it.subjectLabel} · {it.modelName} {it.modelVersion}
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-2">
                      {it.flags.includes("hallucination") && (
                        <HallucinationChip kind="hallucination" size="sm" />
                      )}
                      <ConfidenceBadge
                        band={bandFromConfidence(it.aggregateConfidence)}
                        value={it.aggregateConfidence}
                        size="sm"
                      />
                    </div>
                    <div className="hidden md:block w-24 text-right text-[11px] text-fg-subtle">
                      due {relativeTime(it.dueAt)}
                    </div>
                  </Link>
                </li>
              ))}
              {topItems.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-fg-muted">
                  Nothing in the queue. Quiet shift.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        {/* Cross-tenant strip — proves multi-tenant chassis */}
        <Card>
          <CardHeader>
            <CardTitle>Cross-tenant signal</CardTitle>
            <CardDescription>
              Open volume + hallucination rate per tenant. Switch tenants in the sidebar.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {VERTICAL_ORDER.map((v) => (
                <TenantTile key={v} v={v} />
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Trust narrative */}
        <Card className={cn(meta.accentSoft, "border-transparent")}>
          <CardBody className="flex items-start gap-4">
            <div className={cn("h-10 w-10 flex-none rounded-md bg-canvas/40 flex items-center justify-center", meta.accentText)}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-xs leading-relaxed text-fg/90">
              <div className="text-sm font-semibold text-fg mb-1">
                The reviewer is the source of truth — not the model.
              </div>
              Every claim links to its source span. Ungrounded outputs are flagged before they reach you.
              Your decisions feed back into model evaluation; the goal is for the next reviewer in this
              chair to need to intervene less, not more.
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Right rail — live activity */}
      <div className="col-span-12 xl:col-span-4">
        <Card className="h-[640px]">
          <ActivityFeed />
        </Card>
      </div>
    </div>
  );
}

function riskWeight(r: string) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[r] ?? 0;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  hint: string;
  tone?: "default" | "warn" | "alert";
  Icon: React.ComponentType<{ className?: string }>;
}

function KpiCard({ label, value, hint, tone = "default", Icon }: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-wide text-fg-subtle">{label}</div>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "alert"
              ? "text-hallucination"
              : tone === "warn"
                ? "text-confidence-low"
                : "text-fg-subtle"
          )}
        />
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          tone === "alert"
            ? "text-hallucination"
            : tone === "warn"
              ? "text-confidence-low"
              : "text-fg"
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-fg-muted">{hint}</div>
    </Card>
  );
}

function TenantTile({ v }: { v: Vertical }) {
  const meta = VERTICAL_META[v];
  const { items } = useReviewStore();
  const tItems = items.filter((it) => it.vertical === v);
  const open = tItems.filter((it) => it.status === "pending" || it.status === "in_review").length;
  const hall = tItems.filter((it) => it.flags.includes("hallucination")).length;
  const Icon = meta.Icon;
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md ring-1",
            meta.accentSoft,
            meta.accentRing
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", meta.accentText)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-fg">{meta.name}</div>
          <div className="truncate text-[10px] text-fg-muted">{meta.tenant}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded bg-canvas/50 py-1.5">
          <div className="text-base font-semibold tabular-nums text-fg">{open}</div>
          <div className="text-[10px] text-fg-muted">open</div>
        </div>
        <div className="rounded bg-canvas/50 py-1.5">
          <div
            className={cn(
              "text-base font-semibold tabular-nums",
              hall > 0 ? "text-hallucination" : "text-fg"
            )}
          >
            {hall}
          </div>
          <div className="text-[10px] text-fg-muted">flags</div>
        </div>
      </div>
    </div>
  );
}
