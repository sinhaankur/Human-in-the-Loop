import { Check, Pencil, ArrowUpRight, X } from "lucide-react";
import type { AuditRecord } from "@/types";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { VERTICAL_META } from "@/lib/verticals";

interface Props {
  record: AuditRecord;
  className?: string;
}

const ACTION_META = {
  accept: {
    label: "Accepted",
    Icon: Check,
    text: "text-confidence-high",
    bg: "bg-confidence-high/12 border-confidence-high/30",
  },
  correct: {
    label: "Corrected",
    Icon: Pencil,
    text: "text-confidence-medium",
    bg: "bg-confidence-medium/12 border-confidence-medium/30",
  },
  escalate: {
    label: "Escalated",
    Icon: ArrowUpRight,
    text: "text-info",
    bg: "bg-info/12 border-info/30",
  },
  reject: {
    label: "Rejected",
    Icon: X,
    text: "text-hallucination",
    bg: "bg-hallucination/12 border-hallucination/30",
  },
} as const;

export function AuditEntry({ record, className }: Props) {
  const meta = ACTION_META[record.action];
  const vertical = VERTICAL_META[record.vertical];
  const { Icon } = meta;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-border bg-surface-1 p-4",
        className
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 flex-none items-center justify-center rounded-md border",
          meta.bg,
          meta.text
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
          <span className="font-medium text-fg">{record.reviewer}</span>
          <span className={cn("font-medium", meta.text)}>{meta.label.toLowerCase()}</span>
          <span className="text-fg-muted truncate">{record.itemTitle}</span>
        </div>
        {record.rationale && (
          <p className="text-xs text-fg-muted leading-relaxed">{record.rationale}</p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-fg-subtle">
          <span className={cn("inline-flex items-center gap-1", vertical.accentText)}>
            <vertical.Icon className="h-3 w-3" />
            {vertical.name}
          </span>
          <span>·</span>
          <span>{relativeTime(record.timestamp)}</span>
          {record.changedClaimIds && record.changedClaimIds.length > 0 && (
            <>
              <span>·</span>
              <span>
                {record.changedClaimIds.length} claim
                {record.changedClaimIds.length === 1 ? "" : "s"} changed
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
