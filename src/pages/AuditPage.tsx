import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { AuditEntry } from "@/components/primitives/AuditEntry";
import { useReviewStore } from "@/state/reviewStore";
import { useTenant } from "@/state/tenant";
import { VERTICAL_META, VERTICAL_ORDER } from "@/lib/verticals";
import { cn } from "@/lib/cn";
import type { DecisionAction, Vertical } from "@/types";

const ACTION_FILTERS: { id: DecisionAction | "all"; label: string }[] = [
  { id: "all", label: "All actions" },
  { id: "accept", label: "Accepted" },
  { id: "correct", label: "Corrected" },
  { id: "escalate", label: "Escalated" },
  { id: "reject", label: "Rejected" },
];

export function AuditPage() {
  const { audit } = useReviewStore();
  const { vertical } = useTenant();
  const [scopeAll, setScopeAll] = useState(false);
  const [actionFilter, setActionFilter] = useState<DecisionAction | "all">("all");

  const filtered = useMemo(() => {
    return audit
      .filter((r) => (scopeAll ? true : r.vertical === vertical))
      .filter((r) => (actionFilter === "all" ? true : r.action === actionFilter))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [audit, scopeAll, actionFilter, vertical]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { accept: 0, correct: 0, escalate: 0, reject: 0 };
    audit
      .filter((r) => (scopeAll ? true : r.vertical === vertical))
      .forEach((r) => {
        c[r.action] = (c[r.action] ?? 0) + 1;
      });
    return c;
  }, [audit, scopeAll, vertical]);

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-md border border-border bg-surface-1 p-1">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActionFilter(f.id)}
                className={cn(
                  "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                  actionFilter === f.id
                    ? "bg-surface-3 text-fg"
                    : "text-fg-muted hover:text-fg"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setScopeAll((s) => !s)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              scopeAll
                ? "border-fg/30 bg-surface-3 text-fg"
                : "border-border bg-surface-1 text-fg-muted hover:bg-surface-2"
            )}
          >
            {scopeAll ? "All tenants" : "Current tenant"}
          </button>
        </div>

        <div className="space-y-2">
          {filtered.map((r) => (
            <AuditEntry key={r.id} record={r} />
          ))}
          {filtered.length === 0 && (
            <Card>
              <CardBody className="text-center text-sm text-fg-muted py-12">
                No decisions match these filters.
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-4">
        <Card>
          <CardBody>
            <div className="text-sm font-semibold text-fg">Decision distribution</div>
            <div className="mt-1 text-[11px] text-fg-muted">
              {scopeAll ? "Across all tenants" : `Within ${VERTICAL_META[vertical].name}`}
            </div>
            <div className="mt-4 space-y-3">
              {(["accept", "correct", "escalate", "reject"] as DecisionAction[]).map((a) => {
                const total = Object.values(counts).reduce((s, n) => s + n, 0);
                const pct = total === 0 ? 0 : ((counts[a] ?? 0) / total) * 100;
                return (
                  <div key={a}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="capitalize text-fg">{a}</span>
                      <span className="tabular-nums text-fg-muted">{counts[a] ?? 0}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          a === "accept"
                            ? "bg-confidence-high"
                            : a === "correct"
                              ? "bg-confidence-medium"
                              : a === "escalate"
                                ? "bg-info"
                                : "bg-hallucination"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-sm font-semibold text-fg">By tenant</div>
            <div className="mt-3 space-y-2">
              {VERTICAL_ORDER.map((v: Vertical) => {
                const meta = VERTICAL_META[v];
                const n = audit.filter((r) => r.vertical === v).length;
                const Icon = meta.Icon;
                return (
                  <div
                    key={v}
                    className="flex items-center gap-3 rounded-md border border-border bg-surface-1 px-3 py-2"
                  >
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
                      <div className="text-xs font-medium text-fg">{meta.name}</div>
                      <div className="text-[10px] text-fg-muted">{meta.tenant}</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-fg">{n}</div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-[11px] text-fg-muted leading-relaxed">
            <div className="text-xs font-medium text-fg mb-1">Why audit log matters</div>
            Every reviewer decision is paired with the model output it overrode, the evidence cited,
            and a reviewer rationale. This trail supports both regulatory inspection and the
            calibration of future model versions.
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
