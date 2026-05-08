import { NavLink } from "react-router-dom";
import { LayoutGrid, Inbox, FileSearch, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { TenantSwitcher } from "./TenantSwitcher";
import { useReviewStore } from "@/state/reviewStore";
import { useTenant, useVerticalMeta } from "@/state/tenant";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Overview", Icon: LayoutGrid, end: true },
  { to: "/queue", label: "Review queue", Icon: Inbox, end: false },
  { to: "/audit", label: "Audit log", Icon: FileSearch, end: false },
  { to: "/policy", label: "Policy", Icon: SlidersHorizontal, end: false },
];

export function Sidebar() {
  const { items } = useReviewStore();
  const { vertical } = useTenant();
  const meta = useVerticalMeta();
  const pendingCount = items.filter(
    (it) => it.vertical === vertical && (it.status === "pending" || it.status === "in_review")
  ).length;

  return (
    <aside className="flex w-[260px] flex-none flex-col border-r border-border bg-canvas">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-clinical-soft ring-1 ring-clinical/40">
          <ShieldCheck className="h-4 w-4 text-clinical" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-fg">Sentinel</div>
          <div className="text-[10px] uppercase tracking-wider text-fg-subtle">
            AI Trust &amp; Safety
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <TenantSwitcher />
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-surface-2 text-fg"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg"
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {to === "/queue" && pendingCount > 0 && (
              <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-fg-muted">
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <div className="text-[11px]">
          <div className="font-medium text-fg-muted">Reviewer</div>
          <div className="text-fg">{meta.reviewer}</div>
        </div>
      </div>
    </aside>
  );
}
