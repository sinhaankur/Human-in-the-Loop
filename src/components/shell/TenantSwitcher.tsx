import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronsUpDown, Check } from "lucide-react";
import { useTenant } from "@/state/tenant";
import { VERTICAL_META, VERTICAL_ORDER } from "@/lib/verticals";
import { cn } from "@/lib/cn";

export function TenantSwitcher() {
  const { vertical, setVertical } = useTenant();
  const active = VERTICAL_META[vertical];
  const ActiveIcon = active.Icon;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg border border-border bg-surface-1 p-2.5 text-left transition-colors hover:border-border-strong hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-fg/20"
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 flex-none items-center justify-center rounded-md ring-1",
            active.accentSoft,
            active.accentRing
          )}
        >
          <ActiveIcon className={cn("h-4 w-4", active.accentText)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-fg">{active.tenant}</div>
          <div className="text-[11px] text-fg-muted">{active.tagline}</div>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 flex-none text-fg-subtle group-hover:text-fg-muted" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-40 w-[260px] overflow-hidden rounded-lg border border-border-strong bg-surface-2 p-1 shadow-2xl shadow-black/50"
        >
          <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-fg-subtle">
            Switch tenant
          </div>
          {VERTICAL_ORDER.map((v) => {
            const meta = VERTICAL_META[v];
            const Icon = meta.Icon;
            const selected = v === vertical;
            return (
              <DropdownMenu.Item
                key={v}
                onSelect={() => setVertical(v)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm outline-none",
                  "data-[highlighted]:bg-surface-3"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 flex-none items-center justify-center rounded-md ring-1",
                    meta.accentSoft,
                    meta.accentRing
                  )}
                >
                  <Icon className={cn("h-4 w-4", meta.accentText)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-fg">{meta.tenant}</div>
                  <div className="text-[11px] text-fg-muted">{meta.tagline}</div>
                </div>
                {selected && <Check className="h-4 w-4 text-fg-muted" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
