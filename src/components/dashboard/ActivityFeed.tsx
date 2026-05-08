import { Pause, Play, FileInput, AlertTriangle, ArrowUpRight, Check } from "lucide-react";
import { useReviewStore } from "@/state/reviewStore";
import { VERTICAL_META } from "@/lib/verticals";
import { relativeTime, timeOfDay } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ActivityEvent } from "@/types";

const KIND_META: Record<
  ActivityEvent["kind"],
  { Icon: React.ComponentType<{ className?: string }>; cls: string; label: string }
> = {
  ingested: { Icon: FileInput, cls: "text-info bg-info/12 border-info/30", label: "Ingested" },
  flagged: {
    Icon: AlertTriangle,
    cls: "text-confidence-low bg-confidence-low/12 border-confidence-low/30",
    label: "Flagged",
  },
  escalated: {
    Icon: ArrowUpRight,
    cls: "text-hallucination bg-hallucination/12 border-hallucination/30",
    label: "Escalated",
  },
  resolved: {
    Icon: Check,
    cls: "text-confidence-high bg-confidence-high/12 border-confidence-high/30",
    label: "Resolved",
  },
};

export function ActivityFeed() {
  const { activity, pauseFeed, setPauseFeed } = useReviewStore();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <div className="text-sm font-semibold text-fg">Live activity</div>
          <div className="text-[11px] text-fg-muted">
            Cross-tenant model events as they occur
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPauseFeed(!pauseFeed)}
          aria-label={pauseFeed ? "Resume feed" : "Pause feed"}
        >
          {pauseFeed ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {pauseFeed ? "Resume" : "Pause"}
        </Button>
      </div>
      <ol className="flex-1 overflow-y-auto px-2 py-2">
        {activity.slice(0, 20).map((ev) => {
          const meta = KIND_META[ev.kind];
          const v = VERTICAL_META[ev.vertical];
          const { Icon } = meta;
          return (
            <li
              key={ev.id}
              className={cn(
                "flex items-start gap-3 rounded-md px-3 py-2.5 text-xs",
                ev.id.startsWith("live-") && "animate-slide-in-feed"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 flex-none items-center justify-center rounded-md border",
                  meta.cls
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1 leading-snug">
                <div className="flex items-center gap-1.5">
                  <span className={cn("inline-flex items-center gap-1", v.accentText)}>
                    <v.Icon className="h-3 w-3" />
                    {v.name}
                  </span>
                  <span className="text-fg-subtle">·</span>
                  <span className="text-fg-subtle tabular-nums">
                    {timeOfDay(ev.timestamp)}
                  </span>
                </div>
                <div className="mt-0.5 text-fg">{ev.summary}</div>
                <div className="mt-0.5 text-[10px] text-fg-subtle">
                  {relativeTime(ev.timestamp)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
