import * as Switch from "@radix-ui/react-switch";
import { ShieldCheck } from "lucide-react";
import { useSentinel } from "@/state/sentinel";
import { cn } from "@/lib/cn";

export function SentinelToggle() {
  const { enabled, toggle } = useSentinel();
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 transition-colors",
        enabled
          ? "border-info/45 bg-info/8"
          : "border-border bg-surface-2"
      )}
    >
      <ShieldCheck
        className={cn(
          "h-4 w-4 transition-colors",
          enabled ? "text-info" : "text-fg-subtle"
        )}
      />
      <div className="leading-tight">
        <div
          className={cn(
            "text-xs font-semibold transition-colors",
            enabled ? "text-fg" : "text-fg-muted"
          )}
        >
          Sentinel
        </div>
        <div className="text-[10px] text-fg-muted">
          {enabled ? "instrumenting AI output" : "off — host output bare"}
        </div>
      </div>
      <Switch.Root
        checked={enabled}
        onCheckedChange={toggle}
        className={cn(
          "relative ml-2 h-5 w-9 flex-none rounded-full border border-border-strong transition-colors",
          enabled ? "bg-info/55" : "bg-surface-3"
        )}
      >
        <Switch.Thumb
          className={cn(
            "block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-fg shadow-sm transition-transform",
            enabled && "translate-x-[18px]"
          )}
        />
      </Switch.Root>
    </label>
  );
}
