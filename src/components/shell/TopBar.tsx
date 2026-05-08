import { useLocation } from "react-router-dom";
import { Sun, Moon, Search, BellRing } from "lucide-react";
import { useTenant, useVerticalMeta } from "@/state/tenant";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Overview",
    subtitle: "Trust & Safety dashboard",
  },
  "/queue": {
    title: "Review queue",
    subtitle: "Items awaiting human review, ranked by risk × uncertainty",
  },
  "/audit": {
    title: "Audit log",
    subtitle: "Every reviewer decision, traceable to source evidence",
  },
  "/policy": {
    title: "Policy",
    subtitle: "Confidence thresholds and escalation rules",
  },
};

export function TopBar() {
  const { theme, toggleTheme } = useTenant();
  const meta = useVerticalMeta();
  const loc = useLocation();
  const matchedPath = loc.pathname.startsWith("/review/")
    ? "/review"
    : loc.pathname;
  const heading = PAGE_TITLES[matchedPath] ?? {
    title: "Review",
    subtitle: `${meta.subjectNoun} workspace`,
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-canvas/80 px-6 py-4 backdrop-blur">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-semibold text-fg">{heading.title}</h1>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
              meta.accentSoft,
              meta.accentText
            )}
          >
            <meta.Icon className="h-3 w-3" />
            {meta.name}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-fg-muted">{heading.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5 text-xs text-fg-muted">
          <Search className="h-3.5 w-3.5" />
          <span>Search items, claims, evidence</span>
          <kbd className="ml-2 rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-fg-subtle">⌘K</kbd>
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <BellRing className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
